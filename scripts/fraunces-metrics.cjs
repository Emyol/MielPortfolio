// Writes lib/dive/fraunces-metrics.json: Fraunces advance widths and kerning pairs (in em) at the instance the page
// draws its fitted lines with (weight 800, opsz 144, WONK 1; see --display-* in app/dive.css). Dive.jsx uses it to
// size those lines on the server, so they never re-fit (and shift) when the web font arrives.
// Run after `next build` (it reads the built Fraunces file):
//   npx -p fontkit@2.0.4 -p wawoff2@2.0.1 node scripts/fraunces-metrics.cjs <path to the Fraunces .woff2>
const fs = require('node:fs');
const path = require('node:path');
const fontkit = require('fontkit');
const { decompress } = require('wawoff2');

const CHARS = [...Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)), ...'‘’“”–—…·éèáàíóúñÑçü'];

(async () => {
  const font = fontkit.create(Buffer.from(await decompress(fs.readFileSync(process.argv[2])))).getVariation({ wght: 800, opsz: 144, WONK: 1 });
  const em = (s) => font.layout(s).positions.reduce((a, p) => a + p.xAdvance, 0) / font.unitsPerEm;
  const round = (v) => Math.round(v * 1e5) / 1e5;
  const chars = CHARS.filter((c) => font.hasGlyphForCodePoint(c.codePointAt(0)));
  const adv = Object.fromEntries(chars.map((c) => [c, round(em(c))]));
  const kern = {};
  for (const a of chars) for (const b of chars) { const k = round(em(a + b) - adv[a] - adv[b]); if (Math.abs(k) > 1e-4) kern[a + b] = k; }
  const out = path.join(__dirname, '..', 'lib', 'dive', 'fraunces-metrics.json');
  fs.writeFileSync(out, JSON.stringify({ adv, kern }));
  console.log('wrote', out, chars.length, 'chars', Object.keys(kern).length, 'pairs');
})();
