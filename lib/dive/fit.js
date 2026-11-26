import METRICS from './fraunces-metrics.json';

// Letter-spacing of the display face, in em (--display-track in app/dive.css).
const TRACK = -0.045;

// The font size, in cqi of the line's box, at which `text` set in Fraunces exactly fills the box (with the same 0.5%
// margin as the fit in engine.js). Computed from the font's own widths and kerning (scripts/fraunces-metrics.cjs),
// so the size is right before the web font arrives and the line never jumps when it does.
// Returns null when the text has a character the table does not know; the line is then fitted in the browser.
export function fitCqi(text) {
  const chars = [...text];
  let w = 0;
  for (let i = 0; i < chars.length; i++) {
    const a = METRICS.adv[chars[i]];
    if (a === undefined) return null;
    w += a + TRACK + (i ? METRICS.kern[chars[i - 1] + chars[i]] || 0 : 0);
  }
  return w > 0 ? Math.round((99.5 / w) * 1000) / 1000 : null;
}
