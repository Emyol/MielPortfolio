import { spawn } from 'node:child_process';
import { writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9566;
const OUT = path.resolve('docs/media');
const URL = process.argv[2] || 'http://localhost:3000/melt-lab';
const FILE = process.argv[3] || 'chrome-matter-review-first.png';
const rest = process.argv.slice(4);
const FLAGS = new Set(rest.filter((arg) => /^(phone|reduced|focus|perf|quick)$/.test(arg)));
const SCROLL = Number(rest.find((arg) => /^\d+(\.\d+)?$/.test(arg)) || 0);
const CLICK = rest.find((arg) => arg && !/^(phone|reduced|focus|perf|quick)$/.test(arg) && !/^\d+(\.\d+)?$/.test(arg)) || '';
const PHONE = FLAGS.has('phone');
const REDUCED = FLAGS.has('reduced');
const WAIT = FLAGS.has('quick') ? 500 : Number(process.env.MELT_WAIT || 6500);

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const userData = await mkdtemp(path.join(os.tmpdir(), 'melt-shot-'));
await mkdir(OUT, { recursive: true });
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--hide-scrollbars',
    '--enable-webgl',
    '--use-gl=angle',
    '--window-size=1440,900',
    'about:blank',
  ],
  { stdio: 'ignore' }
);

try {
  let version;
  for (let i = 0; i < 24; i += 1) {
    try {
      version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
      break;
    } catch {
      await wait(250);
    }
  }
  if (!version) throw new Error('no chrome');
  let pageTarget;
  for (let i = 0; i < 24; i += 1) {
    const tabs = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
    pageTarget = tabs.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (pageTarget) break;
    await wait(250);
  }
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  let id = 1;
  const cdp = (method, params = {}) => {
    const thisId = id++;
    ws.send(JSON.stringify({ id: thisId, method, params }));
    return new Promise((resolve, reject) => {
      const onMsg = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id !== thisId) return;
        ws.removeEventListener('message', onMsg);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      };
      ws.addEventListener('message', onMsg);
      setTimeout(() => reject(new Error(method)), FLAGS.has('perf') ? 30000 : 20000);
    });
  };
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', PHONE
    ? { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }
    : { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }
  );
  if (REDUCED) {
    await cdp('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
  }
  await cdp('Page.navigate', { url: URL });
  await wait(WAIT);
  if (SCROLL > 0) {
    await cdp('Runtime.evaluate', {
      expression: `(() => {
        const root = document.querySelector('[class*="scrollRoot"]');
        if (!root) return 'missing';
        root.scrollTop = root.scrollHeight * ${SCROLL};
        return String(root.scrollTop);
      })()`,
    });
    await wait(1800);
  }
  if (CLICK) {
    await cdp('Runtime.evaluate', {
      expression: `(() => {
        const hit = [...document.querySelectorAll('button, a')].find((el) => el.textContent.includes(${JSON.stringify(CLICK)}));
        hit?.click();
        return hit ? hit.textContent : 'missing';
      })()`,
    });
    await wait(900);
  }
  if (FLAGS.has('focus')) {
    await cdp('Runtime.evaluate', {
      expression: `document.querySelector('.skip-link')?.focus()`,
    });
    await wait(200);
  }
  if (FLAGS.has('perf')) {
    const fps = await cdp('Runtime.evaluate', {
      awaitPromise: true,
      returnByValue: true,
      expression: `new Promise((resolve) => {
        let n = 0;
        const t0 = performance.now();
        const tick = (now) => {
          n += 1;
          if (now - t0 < 10000) requestAnimationFrame(tick);
          else resolve({ fps: +(n / ((now - t0) / 1000)).toFixed(1), frames: n });
        };
        requestAnimationFrame(tick);
      })`,
    });
    console.log('perf', fps.result?.value || fps.result);
  }
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
  const dest = path.join(OUT, FILE);
  await writeFile(dest, Buffer.from(data, 'base64'));
  console.log(dest);
  ws.close();
} finally {
  chrome.kill();
}
