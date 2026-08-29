import { spawn } from 'node:child_process';
import { writeFile, mkdir, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9555;
const OUT = path.resolve('docs/media');

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const userData = await mkdtemp(path.join(os.tmpdir(), 'parse-shot-'));
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
      setTimeout(() => reject(new Error(method)), 20000);
    });
  };
  await cdp('Page.enable');
  await cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await cdp('Page.navigate', { url: 'http://localhost:3000/' });
  await wait(4200);
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(path.join(OUT, 'parse-finish-review-compile.png'), Buffer.from(data, 'base64'));
  console.log('saved parse-finish-review-compile.png');
  await cdp('Runtime.evaluate', {
    expression: `(() => {
      const btn = [...document.querySelectorAll('.parse-rail button')].find((b) => b.textContent.trim() === 'KitaKo');
      btn?.click();
      return !!btn;
    })()`,
    returnByValue: true,
  });
  await wait(400);
  const kitako = await cdp('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(path.join(OUT, 'parse-nodes-review-kitako.png'), Buffer.from(kitako.data, 'base64'));
  console.log('saved parse-nodes-review-kitako.png');
  ws.close();
} finally {
  chrome.kill();
}
