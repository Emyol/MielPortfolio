// One Recognition medal drawn in the ocean's glyphs: a coin turning about its vertical axis.
// Ported from study 1 of the Recognition prototype (after shadcn's "Medallion Flip Awards").
/* eslint-disable */

// Twice as many columns as rows because monospace cells are about twice as tall as wide, so
// the coin comes out round. RAMP runs dim to bright; THICK is the edge depth in coin radii.
const COLS = 48, ROWS = 24, RAMP = ' .:-=+*#%@', THICK = 0.17, MASK = 160;

// A 160×160 alpha mask of `text`, centred, for the coin's raised face.
export function makeMask(text, px, family) {
  const c = document.createElement('canvas');
  c.width = c.height = MASK;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, MASK, MASK);
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '800 ' + px + 'px ' + family;
  g.fillText(text, MASK / 2, MASK / 2 + 6);
  const d = g.getImageData(0, 0, MASK, MASK).data, out = new Uint8ClampedArray(MASK * MASK);
  // White on black, so the red channel alone is the alpha; keep one byte per pixel.
  for (let i = 0; i < out.length; i++) out[i] = d[i * 4];
  return out;
}

function sample(m, u, v) {
  const x = Math.max(0, Math.min(MASK - 1, ((u * 0.5 + 0.5) * MASK) | 0)), y = Math.max(0, Math.min(MASK - 1, ((v * 0.5 + 0.5) * MASK) | 0));
  return m[y * MASK + x] / 255;
}

// Draws the coin at `angle` (radians; 0 = face-on) into a size×size area of ctx.
// front/back are masks from makeMask; tint scales brightness (1 for first place).
export function drawCoin(ctx, size, angle, front, back, tint, mono) {
  const cw = size / COLS, ch = size / ROWS, cs = Math.cos(angle), sn = Math.sin(angle), a = Math.abs(cs);
  const x0 = (THICK / 2) * sn, x1 = -x0, xf = cs >= 0 ? x0 : x1, m = cs >= 0 ? front : back, lo = Math.min(x0, x1), hi = Math.max(x0, x1);
  // Turning shifts the two faces sideways by half the thickness each way; xf is the face
  // toward the viewer (front while cos >= 0) and lo..hi is the band the edge fills between them.
  ctx.clearRect(0, 0, size, size);
  ctx.font = '500 ' + (size / 26.4).toFixed(2) + 'px ' + mono;
  ctx.textBaseline = 'top'; ctx.fillStyle = '#ececec';
  for (let r = 0; r < ROWS; r++) {
    const sy = ((r + 0.5) / ROWS * 2 - 1) * 1.1;
    if (sy * sy >= 1) continue;
    const hw = Math.sqrt(1 - sy * sy);
    for (let k = 0; k < COLS; k++) {
      const sx = ((k + 0.5) / COLS * 2 - 1) * 1.1;
      let b = -1, g;
      // Inside the visible face, foreshortened to an ellipse; skipped when nearly edge-on.
      // Dividing by a undoes the squash so u, v are flat face coordinates for the mask.
      if (a > 0.03 && Math.abs(sx - xf) <= a * hw) {
        const u = (sx - xf) / a, v = sy, rr = Math.hypot(u, v);
        b = 0.14 + 0.16 * a;
        if (rr > 0.9) b = 0.9;
        else if (rr > 0.79 && rr < 0.85) b = Math.cos(Math.atan2(v, u) * 22) > 0.25 ? 0.8 : 0.2;
        else if (sample(m, u * 1.04, v * 1.04) > 0.5) b = 0.82 + 0.18 * a;
        // A soft diagonal glint whose position tracks the angle, so a sheen sweeps across as it turns.
        b += Math.exp(-Math.pow(u * 0.75 + v * 0.66 - 1.7 * Math.sin(angle * 0.5 + 0.6), 2) * 4) * 0.3;
        g = RAMP[Math.min(9, (b * 10) | 0)];
      } else {
        // Not on the face: cells in the volume between the two faces draw the coin's edge.
        const d = sx < lo ? lo - sx : sx > hi ? sx - hi : 0;
        if (d <= a * hw + 0.001 && Math.abs(sx) <= hi + a * hw) { b = 0.5; g = sy > 0.55 || sy < -0.55 ? '=' : '|'; }
      }
      if (b < 0 || g === ' ') continue;
      ctx.globalAlpha = Math.min(1, (0.2 + 0.8 * Math.min(b, 1)) * tint);
      ctx.fillText(g, k * cw, r * ch);
    }
  }
  ctx.globalAlpha = 1;
}
