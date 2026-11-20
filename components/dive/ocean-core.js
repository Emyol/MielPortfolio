// The ocean: one field of characters behind the whole page, the whale shark, ripples and the liquid-glass lens.
// This module only draws. The engine reads the page (scroll, pointer, panel rects) and hands it over each frame,
// so the same code runs in a worker on an OffscreenCanvas or, where that is unsupported, on the main thread.
/* eslint-disable */
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const TAU = Math.PI * 2;
const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.37) * 43758.5453123; return v - Math.floor(v); };
// Value noise. It remembers the four lattice corners, which neighbouring cells usually share, so most samples
// skip the hashing; the result is the same as recomputing them.
function cachedNoise(s) {
  let cx = NaN, cy = NaN, h00 = 0, h10 = 0, h01 = 0, h11 = 0;
  return (x, y) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), tx = x - x0, ty = y - y0;
    if (x0 !== cx || y0 !== cy) { cx = x0; cy = y0; h00 = hash(x0, y0, s); h10 = hash(x0 + 1, y0, s); h01 = hash(x0, y0 + 1, s); h11 = hash(x0 + 1, y0 + 1, s); }
    const ux = tx * tx * (3 - 2 * tx), uy = ty * ty * (3 - 2 * ty);
    const a = h00 * (1 - ux) + h10 * ux, b = h01 * (1 - ux) + h11 * ux;
    return a * (1 - uy) + b * uy;
  };
}
const hash2 = (a, b) => { let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };
const smooth = (x) => x * x * (3 - 2 * x);
const RAMP = ' .:-=+*#%@';

// The character grid for a canvas of w x h CSS pixels. The engine uses it too, to build the headline mask.
export function grid(w, h, dpr) {
  const W = Math.round(w * dpr), H = Math.round(h * dpr);
  const cols = clamp(Math.round(w / (w < 700 ? 6 : 8.5)), 40, 230), cw = W / cols, chh = cw * 1.7, rows = Math.ceil(H / chh);
  return { w, h, dpr, W, H, cols, rows, cw, chh };
}

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

// cv: the canvas to draw on. makeCanvas(w, h): a scratch canvas (OffscreenCanvas in a worker).
export function createOcean(cv, makeCanvas) {
  const ctx = cv.getContext('2d'), R = Math.random, seed = R() * 1000;
  const noiseA = cachedNoise(seed), noiseB = cachedNoise(seed + 31), noiseC = cachedNoise(seed + 7);
  const off = makeCanvas(1, 1), octx = off.getContext('2d', { willReadFrequently: true });
  const lens = { k: -1, dx: 0, dy: 0 };
  let d = null, cols = 0, rows = 0, cw = 0, chh = 0, waves = [], ink = 'rgb(236, 236, 236)', dim = 'rgba(236, 236, 236, 0.34)', accent = '#2997ff';
  let quiet = [], fish = null, sk = null, text = null, tStart = 0, lastW = 0, rim = 'rgba(236, 236, 236, 0.6)', frost = 'rgba(236, 236, 236, 0.16)';
  let reduced = false, ptr = { x: 0, y: 0, on: false }, lastTouch = 0;

  function initShark() {
    const L = clamp(d.w * 0.32, 150, 480), N = 28, sp = L / N, hx = d.w * 0.62, hy = d.h * 0.2;
    sk = { L, N, sp, x: hx, y: hy, a: Math.PI, boost: 0, wp: null, wpT: 0, wake: 0, last: 0, segs: Array.from({ length: N }, (_, i) => ({ x: hx + i * sp, y: hy })) };
  }
  const inQuiet = (x, y, pad) => quiet.some((q) => x > q.left - pad && x < q.right + pad && y > q.top - pad && y < q.bottom + pad);
  function pickWaypoint() {
    for (let k = 0; k < 10; k++) { const x = d.w * (0.06 + R() * 0.88), y = d.h * (0.1 + R() * 0.8); if (!inQuiet(x, y, 60)) return { x, y }; }
    return { x: d.w * (0.06 + R() * 0.88), y: d.h * (0.1 + R() * 0.8) };
  }
  function startle(x, y, now) { if (!sk || reduced) return; if (Math.hypot(x - sk.x, y - sk.y) < sk.L) { sk.boost = 1.3; sk.wp = { x: clamp(sk.x + (sk.x - x) * 3, d.w * 0.06, d.w * 0.94), y: clamp(sk.y + (sk.y - y) * 3, d.h * 0.08, d.h * 0.92) }; sk.wpT = now + 5000; } }
  // The water carries the shark a little as you scroll, so it trails behind and then swims to catch up.
  function nudge(dy, now) {
    if (!sk || reduced) return;
    const k = clamp(dy, -80, 80) * 0.22; sk.y -= k; sk.segs.forEach((p) => { p.y -= k; });
    if (sk.y < -sk.L || sk.y > d.h + sk.L) { sk.wp = pickWaypoint(); sk.wpT = now + 9000; }
  }
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

  function resize(w, h, dpr) {
    const g = grid(w, h, dpr);
    cv.width = g.W; cv.height = g.H;
    d = { w, h, dpr, W: g.W, H: g.H };
    cols = g.cols; rows = g.rows; cw = g.cw; chh = g.chh;
    off.width = cols; off.height = rows; fish = new Float32Array(cols * rows);
    if (!sk || w !== lastW) initShark();
    lastW = w;
  }
  // The headline written in the water: { mask, rows, top, h, start }, or null when there is no room for it.
  function setText(t) { text = t; if (t && !tStart) tStart = t.start; }
  function setColors(c) { ink = c.ink; dim = c.dim; rim = c.rim; frost = c.frost; accent = c.accent; }
  function setReduced(v) { reduced = v; }
  function wave(x, y, t, k) { waves.push(k == null ? { x, y, t } : { x, y, t, k }); }

  // st: { now, scrollY, max, heroH, quiet, glass, ptr, lastTouch }, all read from the page by the engine.
  function frame(st) {
    if (!d) return;
    const now = st.now, scrollY = st.scrollY;
    quiet = st.quiet; ptr = st.ptr; lastTouch = st.lastTouch;
    const glass = st.glass;
    const t = reduced ? 4 : now * 0.001, dpr = d.dpr, rowCss = chh / dpr, colCss = cw / dpr;
    waves = waves.filter((w) => now - w.t < 2400);
    if (sk) stepShark(now);
    const depth = clamp(scrollY / st.max, 0, 1);
    const flow = scrollY / rowCss * 0.35, snowShift = scrollY / rowCss * 0.9;
    const heroH = st.heroH, s = reduced ? 0 : smooth(clamp(scrollY / (heroH * 0.6), 0, 1));
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
        const cloud = noiseA(sc * 0.07 + t * 0.09, sr * 0.11 - t * 0.05) * 0.62 + noiseB(sc * 0.19 - t * 0.07, sr * 0.27 + t * 0.04) * 0.38;
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
            if (m > 0.03) { v = Math.max(v, m * (0.74 + 0.26 * noiseC(c * 0.21 + t * 0.5, r * 0.33 - t * 0.3))); lit = m > 0.25; if (s > 0.12 && hh > 0.7) ch = hh > 0.86 ? 'o' : '°'; }
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

  return { resize, setText, setColors, setReduced, wave, startle, nudge, frame };
}
