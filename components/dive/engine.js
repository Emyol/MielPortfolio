// Dive engine: the ocean canvas, the scroll scenes, liquid glass and the case pages.
// Ported from the approved prototype. The markup is server-rendered by Dive.jsx; this script only enhances it.
// startDive returns a cleanup that removes every listener, timer and animation frame it created.
/* eslint-disable */
import { createOcean, grid } from './ocean-core';

export function startDive(host, data) {
  'use strict';
  const ac = new AbortController(), signal = ac.signal;
  let stopped = false;
  const timers = new Set();
  const on = (t, type, fn, o) => t.addEventListener(type, fn, Object.assign({}, typeof o === 'object' ? o : { capture: !!o }, { signal }));
  const addEventListener = (type, fn, o) => on(window, type, fn, o);
  const setInterval = (fn, ms) => { const id = window.setInterval(fn, ms); timers.add(() => window.clearInterval(id)); return id; };
  const setTimeout = (fn, ms) => { const id = window.setTimeout(() => { if (!stopped) fn(); }, ms); timers.add(() => window.clearTimeout(id)); return id; };
  const clearTimeout = (id) => window.clearTimeout(id);
  const requestAnimationFrame = (fn) => window.requestAnimationFrame((t) => { if (!stopped) fn(t); });
  const cancelAnimationFrame = (id) => window.cancelAnimationFrame(id);
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const TAU = Math.PI * 2;
  const R = Math.random;
  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const icon = (name, sw = 2) => { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', String(sw)); s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true'); const u = document.createElementNS('http://www.w3.org/2000/svg', 'use'); u.setAttribute('href', '#i-' + name); s.append(u); return s; };
  const pad2 = (n) => String(n).padStart(2, '0');
  const SYSTEMS = data.systems, CERTS = data.certs;
  const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.37) * 43758.5453123; return v - Math.floor(v); };
  function vnoise(x, y, s) {
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    const ux = tx * tx * (3 - 2 * tx), uy = ty * ty * (3 - 2 * ty);
    const a = hash(x0, y0, s) * (1 - ux) + hash(x0 + 1, y0, s) * ux;
    const b = hash(x0, y0 + 1, s) * (1 - ux) + hash(x0 + 1, y0 + 1, s) * ux;
    return a * (1 - uy) + b * uy;
  }
  let modalOpen = false;
  const fields = [];
  const syncAll = () => fields.forEach((f) => f.sync());
  const smooth = (x) => x * x * (3 - 2 * x);
  function win(title, tag) {
    const w = el('span', 'win'), bar = el('span', 'win-bar'), dots = el('i');
    dots.append(el('b')); dots.setAttribute('aria-hidden', 'true');
    bar.append(dots, el('span', '', title), el('em', '', tag || ''));
    w.append(bar);
    return w;
  }
  const lumOf = (img, cols, rows) => {
    try {
      const o = document.createElement('canvas'), ox = o.getContext('2d', { willReadFrequently: true });
      o.width = cols; o.height = rows; ox.drawImage(img, 0, 0, cols, rows);
      const px = ox.getImageData(0, 0, cols, rows).data, lum = new Float32Array(cols * rows);
      let lo = 1, hi = 0;
      for (let i = 0; i < lum.length; i++) { const v = (px[i * 4] * 0.3 + px[i * 4 + 1] * 0.59 + px[i * 4 + 2] * 0.11) / 255; lum[i] = v; lo = Math.min(lo, v); hi = Math.max(hi, v); }
      for (let i = 0; i < lum.length; i++) lum[i] = (lum[i] - lo) / Math.max(0.05, hi - lo);
      return lum;
    } catch (err) { return null; }
  };

  /* ================= The ocean: one field of characters behind the whole page ================= */
  // The drawing lives in ocean-core.js. Where the browser can, it runs in a worker on an OffscreenCanvas so the
  // main thread stays free for scrolling and input; this side reads the page each frame and sends it over.
  const ocean = (() => {
    let cv = $('#ocean');
    const heroEl = $('#hero-water'), heroSec = $('.hero'), ptr = { x: 0, y: 0, on: false };
    let g = null, raf = 0, lastTouch = 0, sy = 0, tStart = 0, core = null, worker = null, busy = false, pending = null;
    let quietNodes = null, glassNodes = null;
    const radii = new WeakMap();
    const glassOf = (n) => {
      const b = n.getBoundingClientRect();
      if (!radii.has(n)) radii.set(n, parseFloat(getComputedStyle(n).borderTopLeftRadius) || 0);
      const hx = b.width / 2, hy = b.height / 2;
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, cx: b.left + hx, cy: b.top + hy, hx, hy, rad: Math.min(radii.get(n), hx, hy), bez: Math.min(34, hx * 0.5, hy * 0.6) };
    };
    // A canvas handed to a worker cannot be drawn on again here, so a restart (or a fallback) gets a fresh one.
    const freshCanvas = () => { const n = cv.cloneNode(false); delete n.dataset.offscreen; cv.replaceWith(n); cv = n; };
    const local = () => { core = createOcean(cv, (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }); };
    const call = (type, ...args) => { if (worker) worker.postMessage({ type, args }); else if (core) core[type](...args); };
    const flush = () => { busy = true; worker.postMessage({ type: 'frame', args: [pending] }); pending = null; };
    function fallback() {
      if (!worker) return;
      worker.terminate(); worker = null; busy = false; pending = null;
      freshCanvas(); local(); rebuild();
    }
    if (cv.dataset.offscreen) freshCanvas();
    if (typeof Worker !== 'undefined' && typeof OffscreenCanvas !== 'undefined' && 'transferControlToOffscreen' in cv) {
      try {
        worker = new Worker(new URL('./ocean.worker.js', import.meta.url), { type: 'module' });
        const oc = cv.transferControlToOffscreen();
        cv.dataset.offscreen = 'true';
        worker.postMessage({ type: 'init', canvas: oc }, [oc]);
        worker.onmessage = () => { busy = false; if (pending) flush(); };
        worker.onerror = fallback;
        timers.add(() => { if (worker) worker.terminate(); });
      } catch (err) { if (worker) worker.terminate(); worker = null; if (cv.dataset.offscreen) freshCanvas(); }
    }
    if (!worker) local();

    // The headline written in the water, as a mask on the character grid. Built here because it needs the page's fonts.
    function buildText() {
      const r = heroEl.getBoundingClientRect();
      if (r.height < 40) return null;
      const trows = Math.max(1, Math.round(r.height * g.dpr / g.chh)), cols = g.cols, tc = document.createElement('canvas'), tx = tc.getContext('2d', { willReadFrequently: true });
      tc.width = cols; tc.height = trows;
      const lines = data.water.length ? data.water : [''];
      const family = getComputedStyle(host).getPropertyValue('--display').trim() || 'Georgia, serif';
      tx.font = '900 100px ' + family;
      const widest = Math.max(...lines.map((l) => tx.measureText(l).width));
      const size = Math.min(100 * r.width / Math.max(1, widest), r.height / (lines.length > 1 ? 1.78 : 1.05));
      tx.setTransform(cols / g.w, 0, 0, trows / r.height, 0, 0);
      tx.font = '900 ' + size.toFixed(1) + 'px ' + family;
      tx.fillStyle = '#fff';
      const base2 = r.height - size * 0.06, base1 = base2 - size * 0.86;
      if (lines.length > 1) { tx.fillText(lines[0], r.left, base1); tx.fillText(lines[1], r.left, base2); } else tx.fillText(lines[0], r.left, base2);
      const px = tx.getImageData(0, 0, cols, trows).data, mask = new Float32Array(cols * trows);
      for (let i = 0; i < mask.length; i++) mask[i] = Math.min(1, px[i * 4 + 3] / 255 * 1.7);
      if (!tStart) tStart = performance.now();
      return { mask, rows: trows, top: r.top + scrollY, h: r.height, start: tStart };
    }
    function measure() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      g = grid(w, h, dpr);
      call('resize', w, h, dpr);
      call('setText', buildText());
      return true;
    }
    function frame(now) {
      if (!g) return;
      if (!quietNodes) { quietNodes = $$('[data-quiet]'); glassNodes = $$('[data-glass]'); }
      const quiet = quietNodes.map((n) => n.getBoundingClientRect()).filter((q) => q.width && q.bottom > -60 && q.top < g.h + 60).map((q) => ({ left: q.left, top: q.top, right: q.right, bottom: q.bottom }));
      const glass = glassNodes.filter((n) => n.offsetParent && getComputedStyle(n).visibility !== 'hidden').map(glassOf).filter((q) => q.hx > 0 && q.b > 0 && q.t < g.h);
      const st = { now, scrollY, max: Math.max(1, document.documentElement.scrollHeight - innerHeight), heroH: heroSec.offsetHeight, quiet, glass, ptr: { x: ptr.x, y: ptr.y, on: ptr.on }, lastTouch };
      if (!worker) { core.frame(st); return; }
      pending = st;
      if (!busy) flush();
    }
    const loop = (now) => { raf = requestAnimationFrame(loop); frame(now); };
    const running = () => !document.hidden && !reduced && !modalOpen && g;
    function sync() { if (running()) { if (!raf) raf = requestAnimationFrame(loop); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function recolor() { const cs = getComputedStyle(document.body), ink = cs.color; const rgb = ink.match(/\d+/g) || [236, 236, 236]; const tone = (a) => 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + a + ')'; call('setColors', { ink, dim: tone(0.34), rim: tone(0.62), frost: tone(0.16), accent: cs.getPropertyValue('--accent').trim() || ink }); }
    function rebuild() { if (!measure()) return; call('setReduced', reduced); recolor(); sync(); frame(performance.now()); }
    const skip = (e) => e.target.closest('a, button, input, textarea, select, dialog, .w-screen');
    addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = e.pointerType !== 'touch'; lastTouch = performance.now(); }, { passive: true });
    on(document, 'pointerleave', () => { ptr.on = false; });
    addEventListener('pointerdown', (e) => { if (!g || reduced || skip(e)) return; const now = performance.now(); lastTouch = now; call('wave', e.clientX * g.dpr, e.clientY * g.dpr, now); call('startle', e.clientX, e.clientY, now); });
    addEventListener('scroll', () => {
      const dy = scrollY - sy; sy = scrollY;
      if (g && !reduced) call('nudge', dy, performance.now());
      if (reduced && g) requestAnimationFrame(() => frame(performance.now()));
    }, { passive: true });
    setInterval(() => { if (running() && performance.now() - lastTouch > 5000 && scrollY < innerHeight) call('wave', g.W * (0.2 + R() * 0.6), g.H * (0.25 + R() * 0.4), performance.now()); }, 6400);
    setTimeout(() => { if (running()) call('wave', g.W * 0.3, g.H * 0.55, performance.now()); }, 2200);
    let lw = 0, lh = 0;
    addEventListener('resize', () => { const w = cv.clientWidth, h = cv.clientHeight; if (w === lw && Math.abs(h - lh) < 2) return; lw = w; lh = h; requestAnimationFrame(rebuild); });
    const ripple = (x, y) => { if (!g || reduced) return; call('wave', x * g.dpr, y * g.dpr, performance.now(), 0.45); };
    const api = { sync, recolor, rebuild, ripple };
    fields.push(api);
    return api;
  })();
  on(document, 'visibilitychange', syncAll);

  /* ================= Work: one screen; the projects change as you scroll ================= */
  const sh = { set: 'systems', items: SYSTEMS, cards: [] };
  const wFx = $('#w-fx'), wTicks = $$('.w-ticks i'), workSec = $('#work');
  const texts = $$('.w-item');
  const shots = $$('#w-shots img');
  const FX = { cols: 96, rows: 0, lums: [] };
  shots.forEach((img, i) => { const go = () => { FX.rows = Math.round(FX.cols * 9 / 16 / 1.7); FX.lums[i] = lumOf(img, FX.cols, FX.rows); }; if (img.complete && img.naturalWidth) go(); else on(img, 'load', go, { once: true }); });
  let wActive = -1;
  function setActive(i) {
    if (i === wActive) return;
    wActive = i;
    texts.forEach((b, j) => { b.classList.toggle('on', j === i); b.classList.toggle('past', j < i); b.inert = j !== i; });
    wTicks.forEach((tk, j) => tk.classList.toggle('on', j <= i));
    const count = $('#w-count'), title = $('#w-wintitle');
    if (count) count.textContent = pad2(i + 1) + ' / ' + pad2(SYSTEMS.length);
    if (title) title.textContent = SYSTEMS[i].window;
  }
  function openWork(i, from) { const screen = from || $('#w-screen') || $$('[data-open-work]')[0]; sh.set = 'systems'; sh.items = SYSTEMS; sh.cards = SYSTEMS.map(() => screen); open(i); }
  $$('[data-open-work]').forEach((b) => on(b, 'click', () => openWork(Number(b.dataset.openWork), b.closest('.w-item') ? null : b)));
  if ($('#w-screen')) on($('#w-screen'), 'click', () => openWork(Math.max(0, wActive)));
  function workFrame() {
    if (!workSec || !wFx || SYSTEMS.length < 2) { if (workSec) setActive(0); return; }
    const r = workSec.getBoundingClientRect(), span = Math.max(1, r.height - innerHeight), p = clamp(-r.top / span, 0, 1), n = SYSTEMS.length;
    const u = p * (n - 1), i = Math.min(n - 2, Math.floor(u)), frac = u - i, tt = clamp((frac - 0.22) / 0.56, 0, 1), t = reduced ? (tt > 0.5 ? 1 : 0) : smooth(tt);
    const band = 0.3, front = t * (1 + band), shown = clamp(front - band, 0, 1);
    shots.forEach((img, j) => { img.style.clipPath = j <= i ? 'none' : j === i + 1 && t > 0 ? 'inset(0 0 ' + ((1 - shown) * 100).toFixed(2) + '% 0)' : 'inset(0 0 100% 0)'; });
    setActive(t > 0.5 ? i + 1 : i);
    const cw = wFx.clientWidth, chh = wFx.clientHeight;
    if (!cw) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (wFx.width !== Math.round(cw * dpr)) { wFx.width = Math.round(cw * dpr); wFx.height = Math.round(chh * dpr); }
    const ctx = wFx.getContext('2d');
    ctx.clearRect(0, 0, wFx.width, wFx.height);
    if (t <= 0 || t >= 1 || !FX.rows) return;
    const lum = FX.lums[i + 1], cols = FX.cols, rows = FX.rows, cx = wFx.width / cols, cy = wFx.height / rows;
    ctx.font = (cy * 1.02).toFixed(1) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'; ctx.textBaseline = 'top'; ctx.fillStyle = '#ececec';
    const RAMP = ' .:-=+*#%@';
    for (let r = 0; r < rows; r++) {
      const k = (front - (r + 0.5) / rows) / band;
      if (k <= 0 || k >= 1) continue;
      const fade = Math.sin(k * Math.PI);
      ctx.fillStyle = 'rgba(7, 7, 7, ' + (0.9 * fade).toFixed(2) + ')'; ctx.fillRect(0, r * cy, wFx.width, cy + 1);
      ctx.fillStyle = '#ececec';
      for (let c = 0; c < cols; c++) { const v = lum ? lum[r * cols + c] : 0.5; const g = RAMP[Math.round(clamp((0.12 + v) * fade, 0, 1) * 9)]; if (g !== ' ') ctx.fillText(g, c * cx, r * cy); }
    }
  }

  /* ================= Experience: a line that draws as you read ================= */
  const tl = $('#tl'), tlLine = $('.tl-line');
  function tlFrame() { if (!tl || !tlLine) return; const r = tl.getBoundingClientRect(), p = clamp((innerHeight * 0.75 - r.top) / r.height, 0, 1); tlLine.style.transform = 'scaleY(' + p.toFixed(4) + ')'; }

  /* ================= Recognition: certificates slide past ================= */
  const strip = $('#strip'), recSec = $('#recognition');
  const certEls = $$('.cert');
  certEls.forEach((b) => on(b, 'click', () => { sh.set = 'certs'; sh.items = CERTS; sh.cards = certEls; open(Number(b.dataset.cert)); }));
  function stripFrame() {
    if (reduced || !strip || !recSec) return;
    const r = recSec.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1), travel = Math.max(0, strip.scrollWidth - strip.parentElement.clientWidth);
    strip.style.transform = 'translateX(' + (-p * travel).toFixed(1) + 'px)';
  }

  /* ================= About: hovering a discipline sends a ripple through the water ================= */
  $$('#idx li').forEach((li) => on(li, 'pointerenter', (e) => { if (e.pointerType !== 'mouse') return; const r = li.getBoundingClientRect(); ocean.ripple(r.left + 14, r.top + r.height / 2); }));

  // The specular rim turns toward the pointer, the way Apple's glass catches light as things move.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) addEventListener('pointermove', (e) => {
    $$('.glass').forEach((g) => { const r = g.getBoundingClientRect(); g.style.setProperty('--spec', (Math.atan2(r.top + r.height / 2 - e.clientY, r.left + r.width / 2 - e.clientX) * 180 / Math.PI + 90).toFixed(0) + 'deg'); });
  }, { passive: true });

  // Local time in Manila
  const clock = $('#clock');
  const tickClock = () => { if (!clock) return; try { clock.textContent = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit' }).format(new Date()) + ' local'; } catch (err) { clock.textContent = 'UTC+8'; } };
  tickClock(); setInterval(tickClock, 30000);

  /* ================= Arrivals: words rise, rows slide in, figures count ================= */
  $$('.split').forEach((h) => { if (h.querySelector('.w')) return; const words = h.textContent.trim().split(/\s+/); h.textContent = ''; words.forEach((w, i) => { const o = el('span', 'w'), inner = el('span', '', w); o.style.setProperty('--i', String(i)); o.setAttribute('aria-hidden', 'true'); o.append(inner); h.append(o, document.createTextNode(' ')); }); h.setAttribute('aria-label', words.join(' ')); });
  const countUp = (n) => {
    const to = Number(n.dataset.count), padTo = Number(n.dataset.pad) || 0, show = (v) => { n.textContent = String(v).padStart(padTo, '0'); };
    if (reduced || to < 3) { show(to); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = (now) => { const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4); show(Math.round(to * e)); if (p < 1) requestAnimationFrame(tick); };
    show(0); requestAnimationFrame(tick);
  };
  const arrive = (n) => { n.classList.add('in'); $$('[data-count]', n).forEach(countUp); };
  let io = null;
  if ('IntersectionObserver' in window && !reduced) {
    io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { io.unobserve(en.target); arrive(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
    $$('.rv, .split').forEach((n) => io.observe(n));
    timers.add(() => io.disconnect());
  } else $$('.rv, .split').forEach(arrive);
  requestAnimationFrame(() => { const hero = $('.hero'); if (hero) hero.classList.add('in'); });

  /* ================= Fitted lines, the gauge and the scroll scenes ================= */
  function fitAll() {
    $$('.fit').forEach((f) => {
      const box = f.parentElement, room = box.clientWidth, line = f.firstElementChild;
      if (room <= 0) return;
      f.style.fontSize = '100px';
      const w = line.scrollWidth;
      if (w) f.style.fontSize = (100 * room / w * 0.995).toFixed(2) + 'px';
    });
    // A section title on a glass panel shrinks only when it would run past the panel's edge.
    $$('.pane .big').forEach((h) => {
      h.style.fontSize = '';
      const pane = h.closest('.pane'), cs = getComputedStyle(pane), room = pane.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), w = h.scrollWidth;
      if (room > 0 && w > room) h.style.fontSize = (parseFloat(getComputedStyle(h).fontSize) * room / w * 0.98).toFixed(2) + 'px';
    });
  }
  const DEPTH = 40, gauge = $('.gauge'), secs = ['work', 'experience', 'recognition', 'about', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
  // Placed with a transform rather than top, so moving them is not a layout shift.
  function placeMarks() {
    if (!gauge) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), H = gauge.clientHeight;
    secs.forEach((s) => { const a = $('a[data-sec="' + s.id + '"]', gauge), p = clamp((s.getBoundingClientRect().top + scrollY) / max, 0, 1); if (a && H) a.style.transform = 'translateY(calc(' + (14 + (H - 28) * p).toFixed(1) + 'px - 50%))'; });
  }
  const navLinks = $$('.hd nav a[href^="#"], .gauge a[data-sec]');
  let curSec = '';
  function scenes() {
    raf2 = 0;
    workFrame(); tlFrame(); stripFrame();
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), p = clamp(scrollY / max, 0, 1);
    if (gauge && gauge.clientHeight) { const now = $('.gauge-now', gauge); now.style.transform = 'translateY(' + (14 + (gauge.clientHeight - 28) * p).toFixed(1) + 'px)'; now.firstElementChild.textContent = (p * DEPTH).toFixed(1) + ' m'; }
    let here = '';
    secs.forEach((s) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) here = s.id; });
    if (here !== curSec) { curSec = here; navLinks.forEach((a) => { if (a.getAttribute('href') === '#' + here) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); }
  }
  let raf2 = 0;
  addEventListener('scroll', () => { if (!raf2) raf2 = requestAnimationFrame(scenes); }, { passive: true });
  const relayout = () => { fitAll(); placeMarks(); scenes(); };
  addEventListener('resize', () => requestAnimationFrame(relayout));
  relayout();
  ocean.rebuild();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { relayout(); ocean.rebuild(); });
  addEventListener('load', relayout);
  on(motionQuery, 'change', () => { reduced = motionQuery.matches; ocean.rebuild(); relayout(); });

  const pieceCache = new Map();
  function buildKitako() {
    const QUERIES = [
      { q: 'kumakain sa beach', gloss: 'eating at the beach', tags: ['food', 'beach'] },
      { q: 'aso sa beach', gloss: 'a dog at the beach', tags: ['dog', 'beach'] },
      { q: 'kasama si lola', gloss: 'with grandma', tags: ['family'] },
      { q: 'gabi sa city', gloss: 'night in the city', tags: ['night', 'city'] },
    ];
    const TILES = [[['paw', 'wave'], ['dog', 'beach']], [['wave'], ['beach']], [['bowl', 'moon'], ['food', 'night']], [['people'], ['family']], [['city'], ['city']], [['paw'], ['dog']], [['bowl', 'wave'], ['food', 'beach']], [['people', 'bowl'], ['family', 'food']], [['mountain'], ['nature']], [['moon', 'city'], ['night', 'city']], [['paw', 'people'], ['dog', 'family']], [['tree'], ['nature']]];
    const wrap = el('div', 'panel');
    const steps = el('ol', 'kk-steps');
    [['1 · Normalize', 'Taglish query'], ['2 · Embed', 'SigLIP-2 text encoder'], ['3 · Search', 'IVF-PQ index']].forEach(([a, b]) => { const li = el('li'); li.append(el('b', '', a), document.createTextNode(b)); steps.append(li); });
    const bar = el('div', 'kk-bar'), q = el('span', 'kk-q');
    q.setAttribute('aria-live', 'polite');
    const tag = el('span', 'label', 'On-device');
    bar.append(icon('search'), q, tag);
    const chips = el('div', 'kk-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Try a Taglish search');
    const grid = el('div', 'kk-grid');
    const note = el('p', 'note');
    const tiles = TILES.map(([icons, tags]) => {
      const t = el('div', 'tile'), rank = el('span', 'tile-rank'), row = el('span', 'tile-icons');
      icons.forEach((name) => row.append(icon(name, 1.6)));
      t.append(rank, row); grid.append(t);
      return { t, rank, tags };
    });
    let timer = [];
    function run(n) {
      timer.forEach(clearTimeout); timer = [];
      const query = QUERIES[n];
      $$('.chip', chips).forEach((b, i) => b.setAttribute('aria-pressed', String(i === n)));
      q.textContent = query.q;
      tiles.forEach((x) => { x.t.classList.remove('hit', 'best'); x.rank.textContent = ''; });
      const lis = $$('li', steps);
      const show = () => {
        const scored = tiles.map((x, i) => ({ x, i, s: x.tags.filter((tg) => query.tags.includes(tg)).length })).sort((a, b) => b.s - a.s || a.i - b.i);
        const top = scored[0].s;
        let place = 0;
        scored.forEach(({ x, s }) => { x.t.classList.toggle('hit', s > 0); x.t.classList.toggle('best', s > 0 && s === top); x.rank.textContent = s > 0 ? pad2(++place) : ''; });
        note.textContent = '“' + query.q + '” means ' + query.gloss + '. ' + place + ' of 12 photos match. An illustration of the steps, not the real model.';
      };
      if (reduced) { lis.forEach((li) => li.classList.remove('on')); show(); return; }
      lis.forEach((li, i) => timer.push(setTimeout(() => { lis.forEach((x) => x.classList.toggle('on', x === li)); }, i * 230)));
      timer.push(setTimeout(() => { lis.forEach((x) => x.classList.remove('on')); show(); }, 3 * 230));
    }
    QUERIES.forEach((query, n) => { const b = el('button', 'chip', query.q); b.type = 'button'; b.addEventListener('click', () => run(n)); chips.append(b); });
    wrap.append(steps, bar, chips, grid, note);
    run(0);
    return wrap;
  }

  function buildIcare() {
    const DAY0 = 8 * 60, SPAN = 12 * 60;
    const ROOMS = [{ name: 'Audio-Visual Room', cap: 40 }, { name: 'Small Group Room', cap: 10 }];
    const TAKEN = [
      { room: 0, s: 9 * 60, e: 11 * 60, name: 'Calculus review' },
      { room: 0, s: 14 * 60, e: 16 * 60, name: 'Org meeting' },
      { room: 1, s: 13 * 60, e: 15 * 60, name: 'Peer tutoring' },
      { room: 1, s: 16 * 60 + 30, e: 18 * 60, name: 'Thesis consult' },
    ];
    const me = { room: 0, s: 11 * 60, len: 120, people: 12 };
    const hm = (m) => pad2(Math.floor(m / 60)) + ':' + pad2(m % 60);
    const wrap = el('div', 'panel');
    wrap.append(el('p', 'label mute', 'Thursday, 16 October · drag your booking'));
    const board = el('div', 'ic-board');
    const hours = el('div', 'ic-hours'), ticks = el('div', 'ticks');
    for (let h = 8; h <= 20; h += 2) { const s = el('span', '', pad2(h) + ':00'); s.style.left = ((h * 60 - DAY0) / SPAN * 100) + '%'; ticks.append(s); }
    hours.append(el('span', 'room-sp'), ticks);
    board.append(hours);
    const tracks = [], taken = [];
    ROOMS.forEach((r, i) => {
      const lane = el('div', 'ic-lane'), lab = el('div', 'ic-room'), tr = el('div', 'ic-track');
      lab.append(document.createTextNode(r.name), el('small', '', 'Holds ' + r.cap));
      TAKEN.filter((b) => b.room === i).forEach((b) => {
        const x = el('div', 'bk'); x.style.left = ((b.s - DAY0) / SPAN * 100) + '%'; x.style.width = ((b.e - b.s) / SPAN * 100) + '%';
        x.append(el('span', '', b.name), el('small', '', hm(b.s) + '–' + hm(b.e)));
        tr.append(x); taken.push({ b, x });
      });
      lane.append(lab, tr); board.append(lane); tracks.push(tr);
    });
    const mine = el('div', 'bk mine');
    mine.tabIndex = 0;
    mine.setAttribute('role', 'button');
    mine.setAttribute('aria-roledescription', 'draggable booking');
    const mineName = el('span', '', 'Your request'), mineTime = el('small');
    mine.append(mineName, mineTime);
    const controls = el('div', 'ic-controls');
    const roomSeg = el('div', 'seg');
    roomSeg.setAttribute('role', 'group'); roomSeg.setAttribute('aria-label', 'Room');
    const roomBtns = ROOMS.map((r, i) => { const b = el('button', 'chip', i ? 'Small group' : 'AV room'); b.type = 'button'; b.addEventListener('click', () => { me.room = i; update(); }); roomSeg.append(b); return b; });
    const stepper = (label, onMinus, onPlus) => { const s = el('div', 'stepper'), o = el('output'); const m = el('button', 'chip', '−'), p = el('button', 'chip', '+'); m.type = p.type = 'button'; m.setAttribute('aria-label', 'Less ' + label); p.setAttribute('aria-label', 'More ' + label); m.addEventListener('click', onMinus); p.addEventListener('click', onPlus); s.append(m, o, p); return { s, o }; };
    const lenS = stepper('time', () => { me.len = Math.max(30, me.len - 30); update(); }, () => { me.len = Math.min(240, me.len + 30); me.s = Math.min(me.s, DAY0 + SPAN - me.len); update(); });
    const pplS = stepper('people', () => { me.people = Math.max(2, me.people - 2); update(); }, () => { me.people = Math.min(60, me.people + 2); update(); });
    controls.append(roomSeg, lenS.s, pplS.s);
    const checks = el('ul', 'checks'), cFree = el('li'), cCap = el('li');
    checks.append(cFree, cCap);
    const verdict = el('p', 'verdict');
    verdict.setAttribute('aria-live', 'polite');
    const note = el('p', 'note', 'The rules follow the repository’s unit tests. The rooms are iCARE’s; the bookings are made up. Arrow keys move your booking; up and down switch rooms.');
    wrap.append(board, controls, checks, verdict, note);

    function update() {
      me.s = clamp(me.s, DAY0, DAY0 + SPAN - me.len);
      const e = me.s + me.len, room = ROOMS[me.room];
      if (mine.parentNode !== tracks[me.room]) tracks[me.room].append(mine);
      mine.style.left = ((me.s - DAY0) / SPAN * 100) + '%';
      mine.style.width = (me.len / SPAN * 100) + '%';
      mineTime.textContent = hm(me.s) + '–' + hm(e);
      mine.setAttribute('aria-label', 'Your request, ' + room.name + ', ' + hm(me.s) + ' to ' + hm(e));
      roomBtns.forEach((b, i) => b.setAttribute('aria-pressed', String(i === me.room)));
      lenS.o.textContent = (me.len / 60).toString().replace('.5', '½') + (me.len === 60 ? ' hour' : ' hours');
      pplS.o.textContent = me.people + ' people';
      const clash = TAKEN.filter((b) => b.room === me.room && me.s < b.e && e > b.s);
      const touch = TAKEN.filter((b) => b.room === me.room && (b.e === me.s || b.s === e));
      taken.forEach(({ b, x }) => x.classList.toggle('clash', clash.includes(b)));
      cFree.className = clash.length ? 'bad' : '';
      cFree.textContent = clash.length ? 'Clashes with ' + clash[0].name + ', ' + hm(clash[0].s) + '–' + hm(clash[0].e) + ', in the same room' : 'Room is free' + (touch.length ? ' · back-to-back with ' + touch[0].name + ' is allowed' : '');
      const over = me.people > room.cap;
      cCap.className = over ? 'bad' : '';
      cCap.textContent = over ? 'Too many people: this room holds ' + room.cap : me.people + ' people fit · this room holds ' + room.cap;
      const ok = !clash.length && !over;
      mine.classList.toggle('bad', !ok);
      verdict.textContent = ok ? 'Ready to request' : 'Stopped before it is sent';
    }
    let drag = null;
    mine.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, s: me.s }; mine.setPointerCapture(e.pointerId); e.preventDefault(); });
    mine.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const w = tracks[0].clientWidth || 1;
      me.s = drag.s + Math.round((e.clientX - drag.x) / w * SPAN / 30) * 30;
      tracks.forEach((t, i) => { const r = t.getBoundingClientRect(); if (e.clientY >= r.top - 6 && e.clientY <= r.bottom + 6) me.room = i; });
      update();
    });
    const stop = () => { drag = null; };
    mine.addEventListener('pointerup', stop); mine.addEventListener('pointercancel', stop);
    mine.addEventListener('keydown', (e) => {
      const k = e.key;
      if (k === 'ArrowLeft') me.s -= 30; else if (k === 'ArrowRight') me.s += 30;
      else if (k === 'ArrowUp') me.room = 0; else if (k === 'ArrowDown') me.room = 1;
      else return;
      e.preventDefault(); update(); mine.focus();
    });
    update();
    return wrap;
  }

  function buildBekilang() {
    const PROGRAMS = [
      ['Loop', '// Bilang hanggang tatlo\nborta count ay 1 periodt\ngorabel count mas_chaka 4 {\n    parinig "Bilang: " dagdag count ganern\n    count ay count dagdag 1 periodt\n}'],
      ['If / else', 'borta edad ay 15 periodt\nborta threshold ay 18 periodt\n\nkunwari edad mas_chaka threshold {\n    parinig "Bawal pa lumabas ang mga bata!" ganern\n} eh_di {\n    parinig "Gorabel, party na!" periodt\n}'],
      ['Concert', 'chika user ay "Mhiema" periodt\nborta tickets ay 2 ganern\ntruch is_vip ay korik periodt\n\nparinig "Welcome sa concert, " dagdag user ganern\nkunwari is_vip parehas korik at_saka tickets mas_tarush 0 {\n    gorabel tickets mas_tarush 0 {\n        tickets ay tickets bawas 1 periodt\n        parinig "Ticket scanned! Remaining: " dagdag tickets ganern\n    }\n} eh_di {\n    parinig "Sorry teh, uwi na!" ganern\n}'],
    ];
    const TYPES = ['borta', 'mema', 'chika', 'charot', 'truch'], DELIMS = ['periodt', 'ganern'];
    const OPS = ['dagdag', 'bawas', 'times', 'divide', 'mas_tarush', 'mas_chaka', 'parehas', 'wit_parehas', 'at_saka', 'o_kaya'];
    const KEYS = ['ay', 'parinig', 'kunwari', 'eh_di', 'gorabel'], BOOLS = ['korik', 'wiz'];
    const fail = (line, msg) => { const er = new Error(msg); er.line = line; return er; };
    function lex(src) {
      const toks = []; let i = 0, line = 1;
      while (i < src.length) {
        const ch = src[i];
        if (ch === '\n') { line++; i++; continue; }
        if (/\s/.test(ch)) { i++; continue; }
        if (src.startsWith('//', i)) { while (i < src.length && src[i] !== '\n') i++; continue; }
        if (ch === '"') { let j = i + 1; while (j < src.length && src[j] !== '"' && src[j] !== '\n') j++; if (src[j] !== '"') throw fail(line, 'This chika never closes its quote.'); toks.push({ k: 'str', v: src.slice(i + 1, j), t: src.slice(i, j + 1), line }); i = j + 1; continue; }
        if (ch === "'") { if (src[i + 2] !== "'") throw fail(line, "A charot holds exactly one character, like 'A'."); toks.push({ k: 'char', v: src[i + 1], t: src.slice(i, i + 3), line }); i += 3; continue; }
        if (/[0-9]/.test(ch)) { const m = /^[0-9]+(\.[0-9]+)?/.exec(src.slice(i)); toks.push({ k: 'num', v: Number(m[0]), t: m[0], line }); i += m[0].length; continue; }
        if (/[A-Za-z_]/.test(ch)) {
          const w = /^[A-Za-z_][A-Za-z0-9_]*/.exec(src.slice(i))[0];
          const k = TYPES.includes(w) ? 'type' : DELIMS.includes(w) ? 'delim' : OPS.includes(w) ? 'op' : KEYS.includes(w) ? 'key' : BOOLS.includes(w) ? 'bool' : 'id';
          toks.push({ k, v: w, t: w, line }); i += w.length; continue;
        }
        if (ch === '{' || ch === '}') { toks.push({ k: 'brace', v: ch, t: ch, line }); i++; continue; }
        throw fail(line, 'Unknown symbol “' + ch + '”.');
      }
      return toks;
    }
    function parse(toks) {
      let p = 0;
      const peek = () => toks[p];
      const lastLine = () => (toks[p - 1] || toks[0] || { line: 1 }).line;
      const expect = (k, v, msg) => { const t = toks[p]; if (!t || t.k !== k || (v && t.v !== v)) throw fail(t ? t.line : lastLine(), msg); p++; return t; };
      const delim = () => expect('delim', null, 'End the statement with periodt or ganern.');
      const LEVELS = [['o_kaya'], ['at_saka'], ['mas_tarush', 'mas_chaka', 'parehas', 'wit_parehas'], ['dagdag', 'bawas'], ['times', 'divide']];
      function expr(lv = 0) {
        if (lv === LEVELS.length) return prim();
        let left = expr(lv + 1);
        while (peek() && peek().k === 'op' && LEVELS[lv].includes(peek().v)) { const op = toks[p++]; left = { op: op.v, a: left, b: expr(lv + 1), line: op.line }; if (lv === 2) break; }
        return left;
      }
      function prim() {
        const t = toks[p++];
        if (!t) throw fail(lastLine(), 'Expected a value here.');
        if (t.k === 'num' || t.k === 'str' || t.k === 'char') return { lit: t.v };
        if (t.k === 'bool') return { lit: t.v === 'korik' };
        if (t.k === 'id') return { ref: t.v, line: t.line };
        throw fail(t.line, 'Expected a value, not “' + t.t + '”.');
      }
      function block() {
        expect('brace', '{', 'Open the block with {.');
        const body = [];
        while (peek() && !(peek().k === 'brace' && peek().v === '}')) body.push(stmt());
        expect('brace', '}', 'This block never closes with }.');
        return body;
      }
      function stmt() {
        const t = peek();
        if (t.k === 'type') { p++; const id = expect('id', null, 'Give the ' + t.v + ' a name.'); expect('key', 'ay', 'Use ay to give ' + id.v + ' a value.'); const e = expr(); delim(); return { s: 'decl', type: t.v, name: id.v, e, line: t.line }; }
        if (t.k === 'id') { p++; expect('key', 'ay', 'Use ay to give ' + t.v + ' a value.'); const e = expr(); delim(); return { s: 'set', name: t.v, e, line: t.line }; }
        if (t.v === 'parinig') { p++; const e = expr(); delim(); return { s: 'print', e, line: t.line }; }
        if (t.v === 'kunwari') { p++; const c = expr(); const a = block(); let b = null; if (peek() && peek().v === 'eh_di') { p++; b = block(); } return { s: 'if', c, a, b, line: t.line }; }
        if (t.v === 'gorabel') { p++; const c = expr(); return { s: 'while', c, body: block(), line: t.line }; }
        throw fail(t.line, 'Didn’t expect “' + t.t + '” here.');
      }
      const prog = [];
      while (p < toks.length) prog.push(stmt());
      return prog;
    }
    function run(prog) {
      const env = new Map(), out = [];
      let steps = 0;
      const show = (v) => (v === true ? 'korik' : v === false ? 'wiz' : String(v));
      const kind = (v) => (typeof v === 'boolean' ? 'truch' : typeof v === 'number' ? 'number' : 'chika');
      function coerce(type, v, name, line) {
        const bad = () => { throw fail(line, name + ' is a ' + type + ', but got a ' + kind(v) + '.'); };
        if (type === 'borta') { if (typeof v !== 'number') bad(); return Math.trunc(v); }
        if (type === 'mema') { if (typeof v !== 'number') bad(); return v; }
        if (type === 'chika') { if (typeof v !== 'string') bad(); return v; }
        if (type === 'charot') { if (typeof v !== 'string' || v.length !== 1) bad(); return v; }
        if (typeof v !== 'boolean') bad(); return v;
      }
      function ev(n) {
        if ('lit' in n) return n.lit;
        if (n.ref) { if (!env.has(n.ref)) throw fail(n.line, 'Declare ' + n.ref + ' first, like borta ' + n.ref + ' ay 0 periodt.'); return env.get(n.ref).v; }
        const a = ev(n.a), b = ev(n.b);
        switch (n.op) {
          case 'dagdag': return typeof a === 'string' || typeof b === 'string' ? show(a) + show(b) : a + b;
          case 'bawas': return a - b;
          case 'times': return a * b;
          case 'divide': if (b === 0) throw fail(n.line, 'Hindi pwede: division by zero.'); return a / b;
          case 'mas_tarush': return a > b;
          case 'mas_chaka': return a < b;
          case 'parehas': return a === b;
          case 'wit_parehas': return a !== b;
          case 'at_saka': return Boolean(a) && Boolean(b);
          default: return Boolean(a) || Boolean(b);
        }
      }
      function exec(list) {
        for (const s of list) {
          if (++steps > 5000) throw fail(s.line, 'Stopped after 5,000 steps. Is the loop missing a line that moves it forward?');
          if (s.s === 'decl') { if (env.has(s.name)) throw fail(s.line, s.name + ' is already declared.'); env.set(s.name, { type: s.type, v: coerce(s.type, ev(s.e), s.name, s.line) }); }
          else if (s.s === 'set') { if (!env.has(s.name)) throw fail(s.line, 'Declare ' + s.name + ' first, like borta ' + s.name + ' ay 0 periodt.'); const slot = env.get(s.name); slot.v = coerce(slot.type, ev(s.e), s.name, s.line); }
          else if (s.s === 'print') out.push(show(ev(s.e)));
          else if (s.s === 'if') { if (ev(s.c)) exec(s.a); else if (s.b) exec(s.b); }
          else while (ev(s.c)) { if (++steps > 5000) throw fail(s.line, 'Stopped after 5,000 steps. Is the loop missing a line that moves it forward?'); exec(s.body); }
        }
      }
      exec(prog);
      return out;
    }
    const wrap = el('div', 'panel');
    const presets = el('div', 'bk-presets');
    presets.setAttribute('role', 'group'); presets.setAttribute('aria-label', 'Example programs from the BekiLang guide');
    const code = el('textarea', 'bk-code');
    code.spellcheck = false; code.setAttribute('aria-label', 'BekiLang code'); code.rows = 10;
    const row = el('div', 'bk-row');
    const runBtn = el('button', 'chip fill', 'Run'); runBtn.type = 'button';
    const viewSeg = el('div', 'seg'); viewSeg.setAttribute('role', 'group'); viewSeg.setAttribute('aria-label', 'Show');
    const vOut = el('button', 'chip', 'Output'), vTok = el('button', 'chip', 'Tokens');
    vOut.type = vTok.type = 'button';
    viewSeg.append(vOut, vTok);
    const stat = el('span', 'label mute');
    row.append(runBtn, stat, viewSeg);
    const out = el('pre', 'bk-out'); out.setAttribute('aria-live', 'polite');
    const toksEl = el('div', 'bk-toks');
    const note = el('p', 'note', 'The examples come from the BekiLang guide. This page runs them with a small JavaScript version of the language; the real compiler and interpreter are Python, in the repository. Edit the code and run it again.');
    let mode = 'out';
    const setMode = (m) => { mode = m; vOut.setAttribute('aria-pressed', String(m === 'out')); vTok.setAttribute('aria-pressed', String(m === 'tok')); out.hidden = m !== 'out'; toksEl.hidden = m !== 'tok'; };
    function go() {
      out.replaceChildren(); toksEl.replaceChildren();
      let toks = [];
      try {
        toks = lex(code.value);
        toks.forEach((t) => toksEl.append(el('span', 'tk ' + t.k, t.t)));
        stat.textContent = toks.length + ' tokens';
        const lines = run(parse(toks));
        out.textContent = lines.length ? lines.join('\n') : '(no output)';
      } catch (er) {
        if (!toks.length) stat.textContent = 'Lexing stopped';
        const s = el('span', 'err', 'Line ' + (er.line || '?') + ': ' + er.message);
        out.replaceChildren(s);
        setMode('out');
      }
    }
    PROGRAMS.forEach(([name, src], i) => { const b = el('button', 'chip', name); b.type = 'button'; b.addEventListener('click', () => { code.value = src; $$('.chip', presets).forEach((x, j) => x.setAttribute('aria-pressed', String(j === i))); go(); }); presets.append(b); });
    runBtn.addEventListener('click', go);
    vOut.addEventListener('click', () => setMode('out'));
    vTok.addEventListener('click', () => setMode('tok'));
    code.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); go(); } });
    wrap.append(presets, code, row, out, toksEl, note);
    code.value = PROGRAMS[0][1];
    presets.firstChild.setAttribute('aria-pressed', 'true');
    setMode('out');
    go();
    return wrap;
  }

  function buildCitysense() {
    const LAYERS = [
      { key: 'heat', name: 'Heat', c: '#e4572e', src: 'MODIS land surface temperature' },
      { key: 'green', name: 'Greenspace', c: '#2a9d4b', src: 'MODIS NDVI' },
      { key: 'water', name: 'Water', c: '#2f6fdb', src: 'GPM IMERG rain, SEDAC flood hazard' },
      { key: 'air', name: 'Air', c: '#8b5cf6', src: 'MAIAC aerosol, OMI NO₂' },
      { key: 'built', name: 'Built-up', c: '#d97706', src: 'JRC GHSL built-up surface' },
      { key: 'pop', name: 'Population', c: '#db2777', src: 'WorldPop density' },
    ];
    const on = new Set(['heat']);
    const riverX = (v) => 0.3 + 0.07 * Math.sin(v * 6.5) + 0.03 * Math.sin(v * 17);
    function fields(u, v) {
      const rd = Math.abs(u - riverX(v));
      const dist = Math.hypot((u - 0.6) * 1.2, v - 0.5);
      const park = clamp((vnoise(u * 5, v * 5, 7) - 0.66) * 6, 0, 1);
      let built = clamp(1.05 - dist * 1.9 + (vnoise(u * 7, v * 7, 1) - 0.5) * 0.5, 0, 1) * (rd < 0.035 ? 0 : 1) * (1 - park);
      const green = clamp(park * 0.95 + (1 - built) * 0.35 + (vnoise(u * 9, v * 9, 4) - 0.5) * 0.2, 0, 1);
      const heat = clamp(built * 0.85 - green * 0.45 + 0.3 + (vnoise(u * 4, v * 4, 9) - 0.5) * 0.3, 0, 1);
      const water = clamp(1 - rd * 9, 0, 1) * (0.55 + 0.45 * vnoise(u * 6, v * 3, 5));
      const road = Math.min(Math.abs(v - 0.55 - (u - 0.5) * 0.15), Math.abs(u - 0.68 - (v - 0.5) * 0.25));
      const air = clamp((1 - road * 12) * 0.75 + built * 0.35, 0, 1);
      const pop = clamp(built * 0.85 + (vnoise(u * 11, v * 11, 3) - 0.5) * 0.45, 0, 1);
      return { heat, green, water, air, built, pop, rd, road, park };
    }
    const wrap = el('div', 'panel');
    const map = el('div', 'cs-map'), canvas = el('canvas'), read = el('p', 'cs-read');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'An illustrative city with a river on the west side, a dense centre, and parks. The chosen layers are tinted over it.');
    map.append(canvas, read);
    const layersEl = el('div', 'cs-layers');
    layersEl.setAttribute('role', 'group'); layersEl.setAttribute('aria-label', 'Layers');
    const srcEl = el('div', 'cs-src');
    const note = el('p', 'note', 'An illustrative city with made-up values (0 to 100). The real app streams these layers from NASA and partner services onto a Leaflet map.');
    LAYERS.forEach((L) => {
      const b = el('button', 'chip'); b.type = 'button'; b.style.setProperty('--c', L.c);
      b.append(el('i'), document.createTextNode(L.name));
      b.addEventListener('click', () => { if (on.has(L.key)) on.delete(L.key); else on.add(L.key); paint(); });
      layersEl.append(b); L.btn = b;
    });
    wrap.append(map, layersEl, srcEl, note);
    const cx2 = canvas.getContext('2d');
    let size = null, base = null, hover = null;
    const rgb = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    function drawBase() {
      const { W, H } = size, cs = getComputedStyle(wrap), ink = cs.getPropertyValue('--ink').trim() || '#000';
      const b = document.createElement('canvas'); b.width = W; b.height = H;
      const g = b.getContext('2d');
      g.fillStyle = ink;
      const blk = Math.max(10, W / 46), gap = blk * 0.22;
      for (let y = 0; y < H; y += blk) for (let x = 0; x < W; x += blk) {
        const f = fields((x + blk / 2) / W, (y + blk / 2) / H);
        if (f.rd < 0.04 || f.road < 0.012) continue;
        if (f.park > 0.4) { g.globalAlpha = 0.18; g.beginPath(); g.arc(x + blk / 2, y + blk / 2, blk * 0.12, 0, TAU); g.fill(); continue; }
        g.globalAlpha = 0.07 + f.built * 0.3;
        g.fillRect(x + gap / 2, y + gap / 2, blk - gap, blk - gap);
      }
      g.globalAlpha = 0.55; g.strokeStyle = ink; g.lineWidth = Math.max(2, W / 120);
      g.beginPath(); for (let i = 0; i <= 60; i++) { const v = i / 60, x = riverX(v) * W; if (i) g.lineTo(x, v * H); else g.moveTo(x, v * H); } g.stroke();
      g.globalAlpha = 1;
      base = b;
    }
    function paint() {
      LAYERS.forEach((L) => L.btn.setAttribute('aria-pressed', String(on.has(L.key))));
      srcEl.replaceChildren(...LAYERS.filter((L) => on.has(L.key)).map((L) => { const p = el('p'); p.append(el('b', '', L.name + ': '), document.createTextNode(L.src)); return p; }));
      if (!size) return;
      const { W, H } = size;
      cx2.clearRect(0, 0, W, H);
      if (base) cx2.drawImage(base, 0, 0);
      const cell = Math.max(6, Math.round(W / 90));
      const act = LAYERS.filter((L) => on.has(L.key));
      for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) {
        const f = fields((x + cell / 2) / W, (y + cell / 2) / H);
        act.forEach((L) => { const v = f[L.key]; if (v < 0.08) return; const [r, g, b] = rgb(L.c); cx2.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (v * 0.5 / Math.max(1, act.length * 0.7)).toFixed(3) + ')'; cx2.fillRect(x, y, cell, cell); });
      }
      if (hover) {
        cx2.strokeStyle = getComputedStyle(wrap).getPropertyValue('--ink').trim() || '#000';
        cx2.lineWidth = 2; cx2.beginPath(); cx2.arc(hover[0] * W, hover[1] * H, 12 * size.dpr, 0, TAU); cx2.stroke();
        const f = fields(hover[0], hover[1]);
        read.textContent = act.length ? act.map((L) => L.name + ' ' + Math.round(f[L.key] * 100)).join(' · ') : 'Switch a layer on';
      } else read.textContent = act.length ? 'Point at the map to read the layers' : 'Switch a layer on';
    }
    function resize() {
      const w = map.clientWidth, h = map.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      size = { W: canvas.width, H: canvas.height, dpr };
      drawBase(); paint();
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(map);
    canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); hover = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; paint(); });
    canvas.addEventListener('pointerleave', () => { hover = null; paint(); });
    paint();
    requestAnimationFrame(resize);
    return wrap;
  }
  const BUILDERS = { kitako: buildKitako, icare: buildIcare, bekilang: buildBekilang, citysense: buildCitysense };

  /* ================= Full page for one item ================= */
  const view = $('#view'), vScroll = $('#v-scroll');
  const cur = { i: 0 };
  function fill() {
    const item = sh.items[cur.i], n = sh.items.length;
    $('#v-kicker').textContent = (sh.set === 'systems' ? 'Work ' : 'Certificate ') + pad2(cur.i + 1) + ' · ' + item.kicker;
    $('#v-title').textContent = item.title;
    $('#v-lede').textContent = item.lede;
    $('#v-count').textContent = pad2(cur.i + 1) + ' / ' + pad2(n);
    $('#v-prev').disabled = cur.i === 0; $('#v-next').disabled = cur.i === n - 1;
    const info = $('#v-info'), slot = $('#v-piece');
    info.replaceChildren(); slot.replaceChildren();
    if (sh.set === 'systems') {
      const a = el('div'); a.append(el('h3', 'label', 'What it does'));
      const ol = el('ul', 'facts'); item.facts.forEach((f) => ol.append(el('li', '', f))); a.append(ol);
      const b = el('div'); b.append(el('h3', 'label', 'Built with'));
      const tags = el('div', 'tags'); item.stack.forEach((s) => tags.append(el('span', '', s))); b.append(tags);
      const c = el('div', 'actions');
      const link = (href, label, fill) => { const l = el('a', fill ? 'chip fill' : 'chip'); l.href = href; l.target = '_blank'; l.rel = 'noopener noreferrer'; l.append(document.createTextNode(label), icon('arrow')); c.append(l); };
      if (item.repo) link(item.repo, 'Open the repository', true);
      if (item.demo) link(item.demo, 'Open the demo', false);
      info.append(a, b, c);
      if (item.piece && BUILDERS[item.piece]) {
        if (!pieceCache.has(item.piece)) pieceCache.set(item.piece, BUILDERS[item.piece]());
        const live = win(item.pieceLabel, 'Interactive');
        live.append(pieceCache.get(item.piece));
        slot.append(live);
      }
      const fig = el('figure'), shot = win(item.window), img = el('img');
      img.src = item.img; img.alt = 'Screenshot of ' + item.title; img.width = 1100; img.height = 619;
      shot.append(img);
      fig.append(shot, el('figcaption', '', 'Screenshot of the real project.'));
      slot.append(fig);
    } else {
      const a = el('div'); a.append(el('h3', 'label', 'Type'), el('p', '', item.cat));
      const b = el('div'); b.append(el('h3', 'label', 'Verification'));
      if (item.verify) { const l = el('a', 'chip'); l.href = item.verify; l.target = '_blank'; l.rel = 'noopener noreferrer'; l.append(document.createTextNode('Verify'), icon('arrow')); b.append(l); } else b.append(el('p', 'mute', 'No verification link on record yet.'));
      info.append(a, b);
      const fig = el('figure', 'cert-figure'), img = el('img'); img.src = item.img; img.alt = item.title + ' certificate'; fig.append(img);
      slot.append(fig);
    }
    vScroll.scrollTop = 0;
  }
  const cardRect = () => sh.cards[cur.i].getBoundingClientRect();
  const insetOf = (r) => 'inset(' + Math.max(0, r.top).toFixed(1) + 'px ' + Math.max(0, innerWidth - r.right).toFixed(1) + 'px ' + Math.max(0, innerHeight - r.bottom).toFixed(1) + 'px ' + Math.max(0, r.left).toFixed(1) + 'px round 12px)';
  let animating = false, opening = null;
  function open(i) {
    if (animating) return;
    cur.i = i; fill();
    const r = cardRect();
    view.showModal(); modalOpen = true; root.classList.add('dive-locked'); syncAll();
    $('#v-close').focus({ preventScroll: true });
    if (reduced) return;
    animating = true;
    opening = view.animate([{ clipPath: insetOf(r) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    opening.finished.catch(() => {}).finally(() => { animating = false; opening = null; });
    $('#v-body').animate([{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 440, delay: 140, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' });
  }
  function close() {
    // Closing interrupts an opening that is still running, so Escape always works.
    if (opening) { opening.cancel(); opening = null; animating = false; }
    if (animating || !view.open) return;
    const card = sh.cards[cur.i];
    const finish = () => { view.close(); modalOpen = false; root.classList.remove('dive-locked'); syncAll(); card.focus({ preventScroll: true }); animating = false; };
    if (reduced) { card.scrollIntoView({ block: 'center' }); finish(); return; }
    const r = card.getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight - 80) { root.style.scrollBehavior = 'auto'; card.scrollIntoView({ block: 'center' }); root.style.scrollBehavior = ''; }
    animating = true;
    view.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: insetOf(cardRect()) }], { duration: 400, easing: 'cubic-bezier(0.7, 0, 0.84, 0)' }).finished.then(finish, finish);
  }
  function step(dir) {
    const n = sh.items.length, j = clamp(cur.i + dir, 0, n - 1);
    if (j === cur.i) return;
    cur.i = j;
    if (reduced) { fill(); return; }
    const body = $('#v-body');
    body.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'ease-in' }).finished.then(() => {
      fill();
      body.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    });
  }
  on($('#v-close'), 'click', close);
  on($('#v-prev'), 'click', () => step(-1));
  on($('#v-next'), 'click', () => step(1));
  on(view, 'cancel', (e) => { e.preventDefault(); close(); });
  host.dataset.ready = 'true';
  on(view, 'keydown', (e) => {
    if (e.target.closest('textarea, .mine')) return;
    if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1);
  });


  return () => {
    stopped = true; ac.abort(); timers.forEach((f) => f());
    if (view.open) view.close();
    root.classList.remove('dive-locked');
    delete host.dataset.ready;
  };
}
