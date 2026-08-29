import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const CHROME = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = process.env.PARSE_URL || 'http://localhost:3000/';
const DATA = process.env.PARSE_DATA_URL || '';
const PORT = Number(process.env.PARSE_CDP_PORT || 9666);
const OUT = path.resolve('docs/media');
const FFMpeg = process.env.FFMPEG || 'ffmpeg';

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

const userData = await mkdtemp(path.join(os.tmpdir(), 'parse-record-'));
const framesDir = await mkdtemp(path.join(os.tmpdir(), 'parse-frames-'));
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

function connectCdp(wsUrl) {
  const ws = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const frames = [];
  const ready = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve);
    ws.addEventListener('error', reject);
  });
  ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data.toString());
    if (msg.method === 'Page.screencastFrame') {
      frames.push(msg.params.data);
      ws.send(JSON.stringify({ id: nextId++, method: 'Page.screencastFrameAck', params: { sessionId: msg.params.sessionId } }));
      return;
    }
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  });
  const cdp = (method, params = {}) => {
    const id = nextId++;
    ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      setTimeout(() => reject(new Error(`timeout ${method}`)), 30000);
    });
  };
  const evaluate = async (expression) => {
    const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'evaluate failed');
    return result.result.value;
  };
  return { ws, ready, cdp, evaluate, frames };
}

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
  if (!version) throw new Error('chrome debug port did not open');
  let pageTarget;
  for (let i = 0; i < 24; i += 1) {
    const tabs = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
    pageTarget = tabs.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
    if (pageTarget) break;
    await wait(250);
  }
  const session = connectCdp(pageTarget.webSocketDebuggerUrl);
  await session.ready;
  await session.cdp('Page.enable');
  await session.cdp('Runtime.enable');
  await session.cdp('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });

  async function lcp(url) {
    await session.cdp('Page.navigate', { url });
    await wait(2800);
    return session.evaluate(`Math.round(performance.getEntriesByType('largest-contentful-paint').at(-1)?.startTime || performance.now())`);
  }

  const metrics = {};
  if (DATA) {
    metrics.trunkLcpMs = await lcp(DATA);
    console.log(`lcp trunk ${metrics.trunkLcpMs}ms`);
  }
  metrics.headLcpMs = await lcp(BASE);
  console.log(`lcp head ${metrics.headLcpMs}ms`);

  await session.cdp('Page.startScreencast', { format: 'jpeg', quality: 62, everyNthFrame: 2 });
  await wait(2800);
  await session.evaluate(`([...document.querySelectorAll('.parse-rail button')].find((b) => b.textContent.trim() === 'KitaKo') || {}).click?.()`);
  await wait(2500);
  await session.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await wait(600);
  await session.evaluate(`([...document.querySelectorAll('.parse-rail button')].find((b) => b.textContent.trim() === 'BekiLang') || {}).click?.()`);
  await wait(1800);
  await session.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await wait(400);
  await session.evaluate(`([...document.querySelectorAll('.parse-rail button')].find((b) => b.textContent.trim() === 'CONTACT') || {}).click?.()`);
  await wait(1800);
  await session.evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))`);
  await wait(400);
  await session.cdp('Input.dispatchMouseEvent', { type: 'mousePressed', x: 720, y: 360, button: 'left', clickCount: 1 });
  await session.cdp('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 860, y: 420, button: 'left' });
  await session.cdp('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 860, y: 420, button: 'left' });
  await wait(1200);
  await session.evaluate(`([...document.querySelectorAll('button')].find((b) => /Reset camera/i.test(b.textContent)) || {}).click?.()`);
  await wait(1600);
  await session.cdp('Page.stopScreencast');
  await wait(300);

  const kept = session.frames.slice(0, 900);
  for (let i = 0; i < kept.length; i += 1) {
    await writeFile(path.join(framesDir, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(kept[i], 'base64'));
  }
  console.log(`frames ${kept.length}`);

  const mp4 = path.join(OUT, 'parse-finish-review.mp4');
  await new Promise((resolve, reject) => {
    const ff = spawn(FFMpeg, [
      '-y',
      '-framerate',
      '12',
      '-i',
      path.join(framesDir, 'f%04d.jpg'),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4,
    ]);
    ff.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`))));
  });
  console.log(`wrote ${mp4}`);
  await writeFile(path.join(OUT, 'parse-verify-metrics.json'), `${JSON.stringify(metrics, null, 2)}\n`);
  session.ws.close();
} finally {
  chrome.kill();
  await rm(framesDir, { recursive: true, force: true }).catch(() => {});
}
