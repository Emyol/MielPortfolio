import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.PARSE_URL || 'http://localhost:3000/';
const PORT = 9333;

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function cdp(ws, id, method, params = {}) {
  const payload = { id, method, params };
  ws.send(JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    const onMsg = (event) => {
      const raw = event.data;
      if (typeof raw !== 'string' && !Buffer.isBuffer(raw)) return;
      const msg = JSON.parse(raw.toString());
      if (msg.id !== id) return;
      ws.removeEventListener('message', onMsg);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    };
    ws.addEventListener('message', onMsg);
    setTimeout(() => reject(new Error(`timeout ${method}`)), 20000);
  });
}

async function evaluate(ws, id, expression) {
  const result = await cdp(ws, id, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'evaluate failed');
  }
  return result.result.value;
}

const failures = [];
function check(name, ok, detail) {
  if (ok) console.log(`PASS ${name}`);
  else {
    console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
    failures.push(name);
  }
}

const userData = await mkdtemp(path.join(os.tmpdir(), 'parse-verify-'));
const chrome = spawn(
  CHROME,
  [
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    `--window-size=1440,900`,
    'about:blank',
  ],
  { stdio: 'ignore' }
);

try {
  let version;
  for (let i = 0; i < 20; i += 1) {
    try {
      version = await fetch(`http://127.0.0.1:${PORT}/json/version`).then((r) => r.json());
      break;
    } catch {
      await wait(250);
    }
  }
  if (!version) throw new Error('chrome debug port did not open');

  let pageTarget;
  for (let i = 0; i < 20; i += 1) {
    const tabs = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
    pageTarget = tabs.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (pageTarget) break;
    await wait(250);
  }
  if (!pageTarget) throw new Error('no page target');

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });

  let id = 1;
  await cdp(ws, id++, 'Page.enable');
  await cdp(ws, id++, 'Runtime.enable');
  await cdp(ws, id++, 'Page.navigate', { url: BASE });
  await wait(2500);

  const boot = await evaluate(
    ws,
    id++,
    `(() => {
      const labels = [...document.querySelectorAll('.parse-label')].map((el) => el.textContent);
      const canvas = document.querySelector('canvas');
      const font = getComputedStyle(document.body).fontFamily;
      const bg = getComputedStyle(document.body).backgroundColor;
      const display = getComputedStyle(document.documentElement).getPropertyValue('--font-display');
      const skip = !!document.querySelector('.skip-link');
      const reset = [...document.querySelectorAll('button')].some((b) => b.textContent.includes('Reset camera'));
      const rail = [...document.querySelectorAll('.parse-rail button')].map((b) => ({
        label: b.textContent.trim(),
        h: b.getBoundingClientRect().height,
      }));
      return { labels, hasCanvas: !!canvas, canvas: canvas && { w: canvas.width, h: canvas.height }, font, bg, display, skip, reset, rail };
    })()`
  );

  check('AMIEL label', boot.labels.includes('AMIEL'), JSON.stringify(boot.labels.slice(0, 6)));
  check('canvas', boot.hasCanvas && boot.canvas.w > 100);
  check('skip link', boot.skip);
  check('reset camera', boot.reset);
  check('no garamond', !/garamond/i.test(boot.font + boot.display));
  check('black ground', boot.bg === 'rgb(0, 0, 0)');
  check('rail 44px', boot.rail.every((b) => b.h >= 44), JSON.stringify(boot.rail.map((b) => b.h)));
  check('citysense rail', boot.rail.some((b) => b.label === 'CitySense'));
  check('icare rail', boot.rail.some((b) => b.label === 'ICARE'));

  async function openNode(label) {
    return evaluate(
      ws,
      id++,
      `(async () => {
        const btn = [...document.querySelectorAll('.parse-rail button')].find((b) => b.textContent.trim() === ${JSON.stringify(label)});
        if (!btn) return { ok: false, reason: 'missing button' };
        btn.click();
        await new Promise((r) => setTimeout(r, 80));
        const sheet = document.querySelector('.parse-sheet');
        return {
          ok: !!sheet,
          title: document.getElementById('parse-sheet-title')?.textContent || '',
          text: sheet ? sheet.innerText : '',
          hrefs: sheet ? [...sheet.querySelectorAll('a')].map((a) => a.getAttribute('href')) : [],
        };
      })()`
    );
  }

  const kitako = await openNode('KitaKo');
  check('kitako sheet', kitako.ok && /on-device semantic image search/i.test(kitako.text));
  check('kitako repo', (kitako.hrefs || []).some((h) => h && h.includes('KitaKo_Codebase')));

  const beki = await openNode('BekiLang');
  check('beki sheet', beki.ok && /Swardspeak/i.test(beki.text));

  const certs = await openNode('CERTS');
  check('sap cert', certs.ok && /SAP Activate/i.test(certs.text));

  const marks = await openNode('MARKS');
  check('rank 2', marks.ok && /Rank 2/.test(marks.text));

  const scc = await openNode('SCC');
  check('scc logistics', scc.ok && /Director for Logistics/.test(scc.text));

  const icare = await openNode('ICARE');
  check('icare reservation copy or tutoring', icare.ok && /700\\+|room reservation|Student Assistant/.test(icare.text));

  const amiel = await openNode('AMIEL');
  check('root hero', amiel.ok && /Architecting/.test(amiel.text));
  check('root manila', amiel.ok && /MANILA/.test(amiel.text));

  const portrait = await evaluate(
    ws,
    id++,
    `!!document.querySelector('.parse-sheet-portrait')`
  );
  check('portrait in inspect', portrait === true);

  const contact = await openNode('CONTACT');
  check('email', contact.ok && (contact.hrefs || []).some((h) => h && h.includes('mailto:acunaamieljosiah@gmail.com')));
  check('cv', contact.ok && (contact.hrefs || []).some((h) => h && h.includes('Amiel_Acuna_CV.pdf')));
  check('github', contact.ok && (contact.hrefs || []).some((h) => h && h.includes('github.com/Emyol')));
  check('linkedin', contact.ok && (contact.hrefs || []).some((h) => h && h.includes('linkedin.com')));

  await evaluate(
    ws,
    id++,
    `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`
  );
  await wait(100);
  const closed = await evaluate(ws, id++, `!document.querySelector('.parse-sheet')`);
  check('escape closes', closed === true);

  const lab = await fetch(new URL('/parse-lab', BASE)).then((r) => r.status);
  check('parse-lab 404', lab === 404);

  const fps = await evaluate(
    ws,
    id++,
    `new Promise((resolve) => {
      let n = 0;
      const t0 = performance.now();
      function tick() {
        n += 1;
        if (performance.now() - t0 >= 2000) resolve(n / 2);
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })`
  );
  check('fps >= 30', fps >= 30, String(fps));

  await cdp(ws, id++, 'Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
  });
  await cdp(ws, id++, 'Page.reload');
  await wait(1800);
  const reduced = await evaluate(
    ws,
    id++,
    `!!document.querySelector('.parse-still') && document.querySelector('.parse-still').textContent.includes('AMIEL')`
  );
  check('reduced still tree', reduced === true);

  await cdp(ws, id++, 'Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp(ws, id++, 'Emulation.setEmulatedMedia', { features: [] });
  await cdp(ws, id++, 'Page.navigate', { url: BASE });
  await wait(2200);
  const phone = await evaluate(
    ws,
    id++,
    `(() => {
      const rail = document.querySelector('.parse-rail');
      const r = rail.getBoundingClientRect();
      const btns = [...rail.querySelectorAll('button')].map((b) => b.getBoundingClientRect().height);
      return { visible: r.width > 0 && r.height >= 44, minH: Math.min(...btns) };
    })()`
  );
  check('phone rail visible', phone.visible);
  check('phone rail 44px', phone.minH >= 44, String(phone.minH));

  ws.close();
} finally {
  chrome.kill();
}

if (failures.length) {
  console.error(`failed: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('parse live ok');
