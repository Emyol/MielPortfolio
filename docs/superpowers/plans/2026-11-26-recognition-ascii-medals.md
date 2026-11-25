# Recognition ASCII Medals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Recognition header list with four spinning ASCII medals and an "Also" row, on their own screen ahead of the certificate strip.

**Architecture:** `lib/dive/extras.js` gains `AWARD_MEDALS` and a pure `splitAwards()`; `Dive.jsx` server-renders medals (with a text fallback) and the Also row inside `#awards`; a new `components/dive/medal-coin.js` draws one coin on a 2D canvas; `engine.js` runs the coins only while on screen.

**Tech Stack:** Next.js 16 (React server components), plain JS canvas, CSS in `app/dive.css`, Playwright tests.

**Spec:** `docs/superpowers/specs/2026-11-26-recognition-ascii-medals-design.md` (prototype reference: study 1 of `recognition-five.html`, session scratchpad).

## Global Constraints

- No content schema change: medal data lives in `lib/dive/extras.js`, keyed by award id (stored Supabase content must still validate).
- Medal ids and values, verbatim: `entry-5` → `{ place: 1, label: 'Track D Champion', short: 'n8n Buildathon Finals' }`; `entry-6` → `{ place: 1, label: 'Champion', short: 'CyberXploit CTF' }`; `entry-7` → `{ place: 2, label: '2nd Place', short: 'OpenAI Campus Hackathon' }`; `entry-8` → `{ place: 2, label: '1st Runner-Up', short: 'SEEN Cyber Rumble CTF' }`.
- Organiser and year come from the award item (`organization`, `year`); nothing reworded beyond these fields.
- Coins: front = placement numeral, back = `’` + last two digits of the year; 1st place full brightness, 2nd at 0.68.
- Animation ≤ 30 fps, only while the medals screen intersects the viewport; reduced motion draws once, face-on.
- No new dependencies. Engine code must register every listener/observer so `startDive`'s cleanup removes it.

## Review Focus

1. Owner archives a medal award in `/admin` → that coin disappears, nothing else moves into its slot, no empty coin. (Task 1 test)
2. An award id listed in `AWARD_MEDALS` no longer exists → ignored, no crash. (Task 1 test)
3. Fraunces not loaded when masks are first drawn → numerals drawn in the fallback font, then redrawn on `document.fonts.ready`. (Task 2, Step 3)
4. Phone at 390 px → 2×2 coins, no horizontal overflow. (existing overflow test, Task 1 Step 4)
5. Reduced motion → coins never change between frames. (Task 2 test)

Decided: coins respond to hover only (pointer devices); medal list items are not made focusable, since they hold no action.

---

### Task 1: Medal data, markup and two-screen layout

**Files:**
- Modify: `lib/dive/extras.js` (append)
- Modify: `components/dive/Dive.jsx:163-182` (Recognition section)
- Modify: `app/dive.css:161-175` (Scene 4) and the `@media (max-width: 760px)` and reduced-motion blocks
- Modify: `components/dive/engine.js:218-225` (`stripFrame` measures the strip wrapper, not the whole section)
- Create: `tests/medals.test.ts`
- Modify: `tests/frontend.spec.ts:8-19`

**Interfaces:**
- Produces: `export const AWARD_MEDALS: Record<string, { place: number, label: string, short: string }>`; `export function splitAwards(awards: Award[]): { medals: Array<Award & { place, label, short }>, also: Award[] }` (input already filtered to active; preserves content order in both lists).
- Produces markup: `<ul id="awards">` holds every award as an `li`. Medal items: `li.medal[data-place][data-year]` containing `canvas.coin` (`aria-hidden`, empty until JS), `span.coin-alt` (fallback text, e.g. `1st`), `span.label` (`{label} · {year}`), `b` (`short`), `span.org`. Also items: `li.also-item` inside a `div.also` glass row, each `span.when` + title.
- Produces layout: `section.rec` = `div.rec-medals` (one screen, not pinned) then `div.rec-certs` (the old `rec-stage` with strip, 280svh wrapper, sticky stage, `p.label` "Certificates" from `content.credentials.galleryTitle`).

- [ ] **Step 1: Write failing tests**

`tests/medals.test.ts`:
```ts
import { test, expect } from '@playwright/test';
import { splitAwards, AWARD_MEDALS } from '../lib/dive/extras.js';
import seed from '../lib/content/seed.json';

const active = seed.awards.items.filter((a) => !a.archived);
test('the four 2026 results become medals, the rest stay in Also, in order', () => {
  const { medals, also } = splitAwards(active);
  expect(medals.map((m) => m.id)).toEqual(['entry-5', 'entry-6', 'entry-7', 'entry-8']);
  expect(medals.map((m) => m.place)).toEqual([1, 1, 2, 2]);
  expect(also).toHaveLength(4);
});
test('an archived medal award leaves no empty coin', () => {
  const { medals, also } = splitAwards(active.filter((a) => a.id !== 'entry-6'));
  expect(medals).toHaveLength(3);
  expect(also.some((a) => a.id === 'entry-6')).toBe(false);
});
test('medal ids without a matching award are ignored', () => {
  expect(Object.keys(AWARD_MEDALS)).toContain('entry-5');
  expect(splitAwards([]).medals).toEqual([]);
});
```
In `tests/frontend.spec.ts` "every section reads without JavaScript", keep `#awards li` = 8 and add:
```ts
await expect(page.locator('#awards li.medal')).toHaveCount(4);
await expect(page.locator('#awards li.medal').first().locator('.coin-alt')).toHaveText('1st');
await expect(page.locator('#awards .also-item')).toHaveCount(4);
```

- [ ] **Step 2: Run to see them fail**

Run: `npx playwright test tests/medals.test.ts tests/frontend.spec.ts -g "medal|without JavaScript"`
Expected: FAIL (`splitAwards` not exported; `li.medal` count 0).

- [ ] **Step 3: Implement**

`AWARD_MEDALS` and `splitAwards` in `extras.js` per Interfaces. `Dive.jsx` renders the markup above; ordinal suffix for `coin-alt`: 1→st, 2→nd, 3→rd, else th. CSS: medals screen `min-height: 100svh`, padding like `.rec-stage`; coins in a 4-column grid, canvas 290px square (`clamp(9rem, 21vw, 18rem)`), labels centred; `.coin-alt` shown as Fraunces 800 numeral when `html:not(.dive-js)`, hidden otherwise; Also row reuses `.glass` with `flex-wrap: wrap`. ≤760px: 2×2 grid, coins ~150px. Reduced motion: `.rec-certs` height auto, stage not sticky (same as today's rules, moved to the new class). Remove `.rec-head`/`.awards` grid rules that no longer apply. `stripFrame` uses `$('.rec-certs')` for its rect and height.

- [ ] **Step 4: Run tests**

Run: `npm run typecheck && npx playwright test tests/medals.test.ts tests/frontend.spec.ts tests/content.test.ts`
Expected: all pass, including both overflow tests and "the pinned work stage…" and "a certificate opens with its details".

- [ ] **Step 5: Commit** — `feat: give Recognition a medals screen ahead of the certificates`

---

### Task 2: ASCII coin renderer wired into the engine

**Files:**
- Create: `components/dive/medal-coin.js`
- Modify: `components/dive/engine.js` (new "Recognition: medals" block next to `stripFrame`)
- Modify: `tests/frontend.spec.ts` (two tests)

**Interfaces:**
- Consumes: `canvas.coin` inside `li.medal[data-place][data-year]` (Task 1).
- Produces: `export function makeMask(text: string, px: number): Uint8ClampedArray` (160×160 alpha mask, Fraunces 800, centred) and `export function drawCoin(ctx: CanvasRenderingContext2D, size: number, angle: number, front: Uint8ClampedArray, back: Uint8ClampedArray, tint: number): void`. Grid 48×24 cells, ramp `' .:-=+*#%@'`, thickness 0.17, Geist Mono 500; geometry, rim, beads (22 around at r 0.79–0.85), mask threshold 0.5 and sheen exactly as `drawCoin` in study 1 of the prototype with its final constants (face base `.14 + .16*|cos|`, raised `.82 + .18*|cos|`, sheen `.3`).

- [ ] **Step 1: Write failing tests** (in `tests/frontend.spec.ts`)

```ts
test('medals turn while on screen', async ({ page }) => {
  await page.goto('/'); await ready(page);
  await page.evaluate(() => document.getElementById('recognition')!.scrollIntoView());
  const snap = () => page.locator('canvas.coin').first().evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const a = await snap(); await page.waitForTimeout(400); const b = await snap();
  expect(a).not.toEqual(b);
  expect(a.length).toBeGreaterThan(2000); // something was drawn
});
test('reduced motion keeps medals still and face-on', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' }); const page = await context.newPage();
  await page.goto('/'); await ready(page);
  await page.evaluate(() => document.getElementById('recognition')!.scrollIntoView());
  const snap = () => page.locator('canvas.coin').first().evaluate((c: HTMLCanvasElement) => c.toDataURL());
  const a = await snap(); await page.waitForTimeout(400); expect(await snap()).toEqual(a);
  await context.close();
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx playwright test tests/frontend.spec.ts -g "medals"`
Expected: FAIL (canvas blank, both snapshots equal).

- [ ] **Step 3: Implement**

`medal-coin.js` per Interfaces. In `engine.js`: collect `$$('li.medal')`; per coin keep `{ ctx, angle, hover, front, back, tint }`, starting angles `[-.35, .25, -.15, .4]` by index; canvas backing store at `devicePixelRatio` (cap 2). Masks from `data-place` and `data-year`; rebuild masks on `document.fonts.ready`. An `IntersectionObserver` on `.rec-medals` starts/stops one rAF loop throttled to 30 fps: `angle += dt * .9`, or ease to the nearest multiple of 2π while hovered (`pointerenter`/`pointerleave` with `pointerType === 'mouse'`). Reduced motion (initial or via `motionQuery` change): stop the loop, set angles to 0, draw once. Disconnect the observer in the cleanup (`timers` set or `signal` abort).

- [ ] **Step 4: Run all tests**

Run: `npm run typecheck && npx playwright test tests/frontend.spec.ts tests/medals.test.ts tests/content.test.ts tests/admin.spec.ts`
Expected: all pass.

- [ ] **Step 5: Commit** — `feat: draw the Recognition medals as spinning ASCII coins`

---

### Task 3: Check in the browser and record

**Files:**
- Modify: `current-state.md` (status line, Session log)

- [ ] **Step 1:** In Edge at 1360×850 and 390×844 (script or preview), screenshot the medals screen and the certificates screen; confirm coins render with legible numerals, Also row wraps cleanly, strip still slides, no console errors.
- [ ] **Step 2:** With the medals screen in view on desktop, record frame timing for 3 s (Performance panel or `requestAnimationFrame` deltas): no long tasks attributable to `drawCoin`; then scroll away and confirm the loop stops (no further `drawCoin` calls).
- [ ] **Step 3:** Update `current-state.md` with what changed, what was verified, and what was not (Safari, Firefox, real phone).
- [ ] **Step 4: Commit** — `docs: record the Recognition medals in current-state`
