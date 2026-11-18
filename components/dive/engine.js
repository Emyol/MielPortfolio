// Dive engine: the ocean canvas, the scroll scenes, liquid glass and the case pages.
// Ported from the approved prototype. The markup is server-rendered by Dive.jsx; this script only enhances it.
// startDive returns a cleanup that removes every listener, timer and animation frame it created.
/* eslint-disable */
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
  const hash2 = (a, b) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
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
  const ocean = (() => {
    const cv = $('#ocean'), ctx = cv.getContext('2d'), RAMP = ' .:-=+*#%@', seed = R() * 1000;
    const off = document.createElement('canvas'), octx = off.getContext('2d', { willReadFrequently: true });
    const heroEl = $('#hero-water'), heroSec = $('.hero'), ptr = { x: 0, y: 0, on: false };
    let d = null, cols = 0, rows = 0, cw = 0, chh = 0, raf = 0, waves = [], ink = 'rgb(236, 236, 236)', dim = 'rgba(236, 236, 236, 0.34)', accent = '#2997ff';
    let quiet = [], glass = [], fish = null, sk = null, text = null, tStart = 0, lastTouch = 0, lastW = 0, sy = 0, rim = 'rgba(236, 236, 236, 0.6)', frost = 'rgba(236, 236, 236, 0.16)';
    // Liquid glass lens. Bezel profile is the convex squircle y = (1 - (1 - x)^4)^(1/4); each sample is how far
    // a ray bends at that point by Snell's law (air n = 1 into glass n = 1.5), normalised to 0..1.
    const LENS = (() => {
      const N = 48, f = (x) => Math.pow(1 - Math.pow(1 - clamp(x, 0, 1), 4), 0.25), out = [];
      let mx = 0;
      for (let i = 0; i < N; i++) {
        const x = Math.max(0.004, i / (N - 1)), dl = 0.001, slope = (f(x + dl) - f(x - dl)) / (2 * dl);
        const a1 = Math.atan(slope), a2 = Math.asin(Math.sin(a1) / 1.5), m = f(x) * Math.tan(a1 - a2);
        out.push(m); mx = Math.max(mx, m);
      }
      return out.map((m) => m / mx);
    })();
    const radii = new WeakMap();
    const glassOf = (n) => {
      const b = n.getBoundingClientRect();
      if (!radii.has(n)) radii.set(n, parseFloat(getComputedStyle(n).borderTopLeftRadius) || 0);
      const hx = b.width / 2, hy = b.height / 2;
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, cx: b.left + hx, cy: b.top + hy, hx, hy, rad: Math.min(radii.get(n), hx, hy), bez: Math.min(34, hx * 0.5, hy * 0.6) };
    };
    // Returns the offset (CSS px) to sample the water from, and where the cell sits: 0..1 across the bezel, 1 inside, -1 outside.
    const lensAt = (g, x, y, out) => {
      const px = x - g.cx, py = y - g.cy, qx = Math.abs(px) - g.hx + g.rad, qy = Math.abs(py) - g.hy + g.rad;
      let sd, nx, ny;
      if (qx > 0 && qy > 0) { const L = Math.hypot(qx, qy); sd = L - g.rad; nx = qx / L; ny = qy / L; }
      else if (qx > qy) { sd = qx - g.rad; nx = 1; ny = 0; } else { sd = qy - g.rad; nx = 0; ny = 1; }
      if (sd >= 0) return false;
      nx *= px < 0 ? -1 : 1; ny *= py < 0 ? -1 : 1;
      const k = -sd / g.bez;
      if (k >= 1) { out.k = 1; out.dx = 0; out.dy = 0; return true; }
      const m = LENS[Math.round(k * (LENS.length - 1))] * g.bez * 1.15;
      out.k = k; out.dx = -nx * m; out.dy = -ny * m;
      return true;
    };
    const lens = { k: -1, dx: 0, dy: 0 };

    function buildText() {
      const r = heroEl.getBoundingClientRect();
      if (r.height < 40) { text = null; return; }
      const trows = Math.max(1, Math.round(r.height * d.dpr / chh)), tc = document.createElement('canvas'), tx = tc.getContext('2d', { willReadFrequently: true });
      tc.width = cols; tc.height = trows;
      const lines = data.water.length ? data.water : [''];
      const family = getComputedStyle(host).getPropertyValue('--display').trim() || 'Georgia, serif';
      tx.font = '900 100px ' + family;
      const widest = Math.max(...lines.map((l) => tx.measureText(l).width));
      const size = Math.min(100 * r.width / Math.max(1, widest), r.height / (lines.length > 1 ? 1.78 : 1.05));
      tx.setTransform(cols / d.w, 0, 0, trows / r.height, 0, 0);
      tx.font = '900 ' + size.toFixed(1) + 'px ' + family;
      tx.fillStyle = '#fff';
      const base2 = r.height - size * 0.06, base1 = base2 - size * 0.86;
      if (lines.length > 1) { tx.fillText(lines[0], r.left, base1); tx.fillText(lines[1], r.left, base2); } else tx.fillText(lines[0], r.left, base2);
      const px = tx.getImageData(0, 0, cols, trows).data, mask = new Float32Array(cols * trows);
      for (let i = 0; i < mask.length; i++) mask[i] = Math.min(1, px[i * 4 + 3] / 255 * 1.7);
      text = { mask, rows: trows, top: r.top + scrollY, h: r.height };
      if (!tStart) tStart = performance.now();
    }
    function initShark() {
      const L = clamp(d.w * 0.32, 150, 480), N = 28, sp = L / N, hx = d.w * 0.62, hy = d.h * 0.2;
      sk = { L, N, sp, x: hx, y: hy, a: Math.PI, boost: 0, wp: null, wpT: 0, wake: 0, last: 0, segs: Array.from({ length: N }, (_, i) => ({ x: hx + i * sp, y: hy })) };
    }
    const inQuiet = (x, y, pad) => quiet.some((q) => x > q.left - pad && x < q.right + pad && y > q.top - pad && y < q.bottom + pad);
    function pickWaypoint() {
      for (let k = 0; k < 10; k++) { const x = d.w * (0.06 + R() * 0.88), y = d.h * (0.1 + R() * 0.8); if (!inQuiet(x, y, 60)) return { x, y }; }
      return { x: d.w * (0.06 + R() * 0.88), y: d.h * (0.1 + R() * 0.8) };
    }
    function startle(x, y) { if (!sk || reduced) return; if (Math.hypot(x - sk.x, y - sk.y) < sk.L) { sk.boost = 1.3; sk.wp = { x: clamp(sk.x + (sk.x - x) * 3, d.w * 0.06, d.w * 0.94), y: clamp(sk.y + (sk.y - y) * 3, d.h * 0.08, d.h * 0.92) }; sk.wpT = performance.now() + 5000; } }
    function stepShark(now) {
      const s = sk, segs = s.segs, dt = s.last ? Math.min(0.05, (now - s.last) / 1000) : 0.016; s.last = now;
      if (!reduced) {
        if (!s.wp || now > s.wpT || Math.hypot(s.wp.x - s.x, s.wp.y - s.y) < 70) { s.wp = pickWaypoint(); s.wpT = now + 11000; }
        const follow = ptr.on && s.boost <= 0 && now - lastTouch < 2500, tx = follow ? ptr.x : s.wp.x, ty = follow ? ptr.y : s.wp.y, near = Math.hypot(tx - s.x, ty - s.y);
        let da = Math.atan2(ty - s.y, tx - s.x) - s.a; da = Math.atan2(Math.sin(da), Math.cos(da));
        s.a += clamp(da, -1, 1) * (0.9 + s.boost) * dt * (follow && near < 46 ? 0.15 : 1);
        s.boost = Math.max(0, s.boost - dt);
        const speed = (follow && near < 46 ? 10 : 46) * (1 + s.boost * 2) * (s.L / 300), wig = Math.sin(now * 0.0032) * 0.05;
        s.x += Math.cos(s.a + wig) * speed * dt; s.y += Math.sin(s.a + wig) * speed * dt;
        segs[0].x = s.x; segs[0].y = s.y;
        for (let i = 1; i < s.N; i++) { const p = segs[i - 1], q = segs[i], ang = Math.atan2(q.y - p.y, q.x - p.x); q.x = p.x + Math.cos(ang) * s.sp; q.y = p.y + Math.sin(ang) * s.sp; }
        if (now - s.wake > 2600) { s.wake = now; const tl = segs[s.N - 1]; waves.push({ x: tl.x * d.dpr, y: tl.y * d.dpr, t: now, k: 0.3 }); }
      }
      const t = reduced ? 0 : now * 0.001, P = [];
      for (let i = 0; i < s.N; i++) {
        const u = i / (s.N - 1), j = Math.max(1, i), ang = Math.atan2(segs[j - 1].y - segs[j].y, segs[j - 1].x - segs[j].x), nx = -Math.sin(ang), ny = Math.cos(ang);
        const sway = reduced ? 0 : Math.sin(t * 3.2 - u * 5) * s.L * 0.04 * u * u;
        const w = s.L * (0.012 + 0.105 * (u < 0.14 ? 0.8 + 0.2 * (u / 0.14) : Math.pow(1 - (u - 0.14) / 0.86, 1.2)));
        P.push({ x: segs[i].x + nx * sway, y: segs[i].y + ny * sway, nx, ny, fx: Math.cos(ang), fy: Math.sin(ang), w });
      }
      octx.setTransform(1, 0, 0, 1, 0, 0); octx.clearRect(0, 0, cols, rows); octx.setTransform(cols / d.w, 0, 0, rows / d.h, 0, 0);
      octx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      octx.beginPath();
      P.forEach((p) => { octx.moveTo(p.x + p.w, p.y); octx.arc(p.x, p.y, p.w, 0, TAU); });
      [-1, 1].forEach((side) => {
        const a = P[5], b = P[9], c = P[11], reach = s.L * 0.19;
        octx.moveTo(a.x + a.nx * side * a.w * 0.7, a.y + a.ny * side * a.w * 0.7);
        octx.lineTo(c.x + c.nx * side * (c.w + reach), c.y + c.ny * side * (c.w + reach));
        octx.lineTo(b.x + b.nx * side * b.w * 0.6, b.y + b.ny * side * b.w * 0.6);
        octx.closePath();
        const e = P[s.N - 1], g = P[s.N - 4], span = s.L * (side < 0 ? 0.1 : 0.06);
        octx.moveTo(g.x, g.y);
        octx.lineTo(e.x - e.fx * s.L * 0.05 + e.nx * side * span, e.y - e.fy * s.L * 0.05 + e.ny * side * span);
        octx.lineTo(e.x, e.y);
        octx.closePath();
      });
      octx.fill('nonzero');
      octx.globalCompositeOperation = 'destination-out'; octx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      const dot = Math.max(d.w / cols * 0.5, s.L * 0.009);
      octx.beginPath();
      for (let i = 1; i < s.N - 7; i++) [-0.58, 0, 0.58].forEach((k) => { if ((i + (k === 0 ? 1 : 0)) % 2) return; const p = P[i]; octx.moveTo(p.x + p.nx * k * p.w + dot, p.y + p.ny * k * p.w); octx.arc(p.x + p.nx * k * p.w, p.y + p.ny * k * p.w, dot, 0, TAU); });
      octx.fill(); octx.globalCompositeOperation = 'source-over';
      const px = octx.getImageData(0, 0, cols, rows).data;
      for (let i = 0; i < fish.length; i++) fish[i] = px[i * 4 + 3] / 255;
    }

    function measure() {
      const w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return false;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      d = { w, h, dpr, W: cv.width, H: cv.height };
      cols = clamp(Math.round(w / (w < 700 ? 6 : 8.5)), 40, 230); cw = d.W / cols; chh = cw * 1.7; rows = Math.ceil(d.H / chh);
      off.width = cols; off.height = rows; fish = new Float32Array(cols * rows);
      if (!sk || w !== lastW) initShark();
      lastW = w;
      buildText();
      return true;
    }
    function frame(now) {
      if (!d) return;
      const t = reduced ? 4 : now * 0.001, dpr = d.dpr, rowCss = chh / dpr, colCss = cw / dpr;
      quiet = $$('[data-quiet]').map((n) => n.getBoundingClientRect()).filter((q) => q.width && q.bottom > -60 && q.top < d.h + 60);
      glass = $$('[data-glass]').filter((n) => n.offsetParent && getComputedStyle(n).visibility !== 'hidden').map(glassOf).filter((g) => g.hx > 0 && g.b > 0 && g.t < d.h);
      waves = waves.filter((w) => now - w.t < 2400);
      if (sk) stepShark(now);
      const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), depth = clamp(scrollY / max, 0, 1);
      const flow = scrollY / rowCss * 0.35, snowShift = scrollY / rowCss * 0.9;
      const heroH = heroSec.offsetHeight, s = reduced ? 0 : smooth(clamp(scrollY / (heroH * 0.6), 0, 1));
      const appear = reduced ? 1 : 1 - Math.pow(1 - clamp((now - tStart - 200) / 1700, 0, 1), 3);
      const dens = 0.42 * (1 - depth * 0.35), glow2 = (110 * dpr) * (110 * dpr), pX = ptr.x * dpr, pY = ptr.y * dpr;
      ctx.clearRect(0, 0, d.W, d.H);
      ctx.font = chh.toFixed(2) + 'px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
      ctx.textBaseline = 'top';
      let cur = '';
      for (let r = 0; r < rows; r++) {
        const y = (r + 0.5) * chh, yCss = y / dpr, rr = r + flow;
        const qRow = quiet.filter((q) => yCss > q.top - 14 && yCss < q.bottom + 14);
        const gRow = glass.filter((g) => yCss > g.t && yCss < g.b);
        const mRow = text ? (scrollY + yCss - text.top) / (text.h / text.rows) : -1e9;
        for (let c = 0; c < cols; c++) {
          const x = (c + 0.5) * cw, xCss = x / dpr;
          lens.k = -1;
          for (let n = 0; n < gRow.length; n++) { const g = gRow[n]; if (xCss > g.l && xCss < g.r && lensAt(g, xCss, yCss, lens)) break; }
          const sc = c + (lens.k >= 0 ? lens.dx / colCss : 0), sr = rr + (lens.k >= 0 ? lens.dy / rowCss : 0);
          const cloud = vnoise(sc * 0.07 + t * 0.09, sr * 0.11 - t * 0.05, seed) * 0.62 + vnoise(sc * 0.19 - t * 0.07, sr * 0.27 + t * 0.04, seed + 31) * 0.38;
          let v = clamp((cloud - 0.45) * 2.4, 0, 1) * dens, crest = 0, lit = false, ch = '';
          const sn = hash2(c, Math.floor(r + snowShift + t * 1.4));
          if (sn > 0.9955 && lens.k < 0) v = Math.max(v, 0.2 + (sn - 0.9955) * 140);
          if (ptr.on) { const dx = x - pX, dy = y - pY; v += 0.18 * Math.exp(-(dx * dx + dy * dy) / glow2); }
          let ox = 0, oy = 0;
          for (let n = 0; n < waves.length; n++) {
            const w = waves[n], age = (now - w.t) / 1000, dist = Math.hypot(x - w.x, y - w.y) || 1;
            const q = (dist - age * 560 * dpr) / (44 * dpr), k = 0.7 * (w.k || 1) * Math.exp(-age * 1.5) * Math.exp(-q * q);
            crest += k;
            const push = k * q * 2.6 * cw; ox += (x - w.x) / dist * push; oy += (y - w.y) / dist * push;
          }
          if (text && mRow > -30 && mRow < text.rows + 30) {
            const hh = hash2(c, Math.round(mRow));
            const sc = Math.round(c - ox / cw + (hh - 0.5) * s * 22), sr = Math.round(mRow - oy / chh + s * (3 + hh * 18));
            if (sc >= 0 && sc < cols && sr >= 0 && sr < text.rows) {
              const m = text.mask[sr * cols + sc] * appear * (1 - s * 0.6);
              if (m > 0.03) { v = Math.max(v, m * (0.74 + 0.26 * vnoise(c * 0.21 + t * 0.5, r * 0.33 - t * 0.3, seed + 7))); lit = m > 0.25; if (s > 0.12 && hh > 0.7) ch = hh > 0.86 ? 'o' : '°'; }
            }
          }
          if (fish) {
            const fc = lens.k >= 0 ? clamp(Math.round(c + lens.dx / colCss), 0, cols - 1) : c, fr = lens.k >= 0 ? clamp(Math.round(r + lens.dy / rowCss), 0, rows - 1) : r;
            const a = fish[fr * cols + fc]; if (a > 0.01) { v = a < 0.3 ? v * (1 - a / 0.3) : 0.3 + (a - 0.3) / 0.7 * 0.7; lit = a > 0.3; }
          }
          let out = v + crest;
          if (lens.k >= 0) {
            // Inside the glass: the bezel shows the water bent and bright, the flat middle shows it frosted and dim.
            if (lens.k < 1) out = out * 1.25 + 0.05 * (1 - lens.k); else out *= 0.7;
            ch = RAMP[Math.round(clamp(out, 0, 1) * 9)];
            if (ch === ' ') continue;
            const want = crest > 0.22 ? accent : (lens.k < 1 ? rim : frost);
            if (want !== cur) { cur = want; ctx.fillStyle = want; }
            ctx.fillText(ch, c * cw, r * chh);
            continue;
          }
          if (qRow.length && qRow.some((q) => xCss > q.left - 14 && xCss < q.right + 14)) { if (crest < 0.25) continue; out = crest; ch = ""; }
          if (!ch) ch = RAMP[Math.round(clamp(out, 0, 1) * 9)];
          else if (out < 0.08) ch = ' ';
          if (ch === ' ') continue;
          const want = crest > 0.22 ? accent : (lit ? ink : dim);
          if (want !== cur) { cur = want; ctx.fillStyle = want; }
          ctx.fillText(ch, c * cw, r * chh);
        }
      }
    }
    const loop = (now) => { raf = requestAnimationFrame(loop); frame(now); };
    const running = () => !document.hidden && !reduced && !modalOpen && d;
    function sync() { if (running()) { if (!raf) raf = requestAnimationFrame(loop); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    function recolor() { const cs = getComputedStyle(document.body); ink = cs.color; const rgb = ink.match(/\d+/g) || [236, 236, 236]; const tone = (a) => 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', ' + a + ')'; dim = tone(0.34); rim = tone(0.62); frost = tone(0.16); accent = cs.getPropertyValue('--accent').trim() || ink; }
    function rebuild() { if (!measure()) return; recolor(); sync(); frame(performance.now()); }
    const skip = (e) => e.target.closest('a, button, input, textarea, select, dialog, .w-screen');
    addEventListener('pointermove', (e) => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = e.pointerType !== 'touch'; lastTouch = performance.now(); }, { passive: true });
    on(document, 'pointerleave', () => { ptr.on = false; });
    addEventListener('pointerdown', (e) => { if (!d || reduced || skip(e)) return; lastTouch = performance.now(); waves.push({ x: e.clientX * d.dpr, y: e.clientY * d.dpr, t: performance.now() }); startle(e.clientX, e.clientY); });
    // The water carries the shark a little as you scroll, so it trails behind and then swims to catch up.
    addEventListener('scroll', () => {
      const dy = scrollY - sy; sy = scrollY;
      if (sk && !reduced) { const k = clamp(dy, -80, 80) * 0.22; sk.y -= k; sk.segs.forEach((p) => { p.y -= k; }); if (sk.y < -sk.L || sk.y > d.h + sk.L) { sk.wp = pickWaypoint(); sk.wpT = performance.now() + 9000; } }
      if (reduced && d) requestAnimationFrame(() => frame(performance.now()));
    }, { passive: true });
    setInterval(() => { if (running() && performance.now() - lastTouch > 5000 && scrollY < innerHeight) waves.push({ x: d.W * (0.2 + R() * 0.6), y: d.H * (0.25 + R() * 0.4), t: performance.now() }); }, 6400);
    setTimeout(() => { if (running()) waves.push({ x: d.W * 0.3, y: d.H * 0.55, t: performance.now() }); }, 2200);
    let lw = 0, lh = 0;
    addEventListener('resize', () => { const w = cv.clientWidth, h = cv.clientHeight; if (w === lw && Math.abs(h - lh) < 2) return; lw = w; lh = h; requestAnimationFrame(rebuild); });
    const ripple = (x, y) => { if (!d || reduced) return; waves.push({ x: x * d.dpr, y: y * d.dpr, t: performance.now(), k: 0.45 }); };
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
  function placeMarks() {
    if (!gauge) return;
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight), H = gauge.clientHeight;
    secs.forEach((s) => { const a = $('a[data-sec="' + s.id + '"]', gauge), p = clamp((s.getBoundingClientRect().top + scrollY) / max, 0, 1); if (a && H) a.style.top = (14 + (H - 28) * p).toFixed(1) + 'px'; });
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
