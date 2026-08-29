# Melt the homepage

Replace the parse tree with one mercury mass that changes job as the visitor moves. Xander and Ralph win on invented beats per viewport, not on shared content. This stack has to invent its own beats. Keep every current fact. The operator lands the stack.

PR ids in order are chrome-kit, chrome-matter, chrome-scroll, chrome-inspect, chrome-cutover, and chrome-finish.

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `pstack/skills/poteto-mode/playbooks/autopilot-stack.md`. The operator reviews and lands chrome-kit, chrome-matter, chrome-scroll, chrome-inspect, chrome-cutover, and chrome-finish. Nothing auto-merges.

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on her explicit go.
- [ ] On her go, arm a `/goal` with this exact text. "`docs/chrome-redesign-plan.md`. PR ids chrome-kit, chrome-matter, chrome-scroll, chrome-inspect, chrome-cutover, chrome-finish. Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. The operator lands. Done when `/` is the melt, the parse tree is gone, and chrome-finish has a clean verdict."
- [ ] Read these from trunk at program start. Re-read them at every tick.
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/autopilot-stack.md`
  - [ ] `git show origin/main:pstack/skills/swarm/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/control-ui/SKILL.md`
  - [ ] `git show origin/main:pstack/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `git show origin/main:pstack/skills/how/SKILL.md`
- [ ] Arm the 30-minute audit tick. In a local session, a real terminal `/loop`. In a cloud root, a cloud-sleeper wake chain. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the execution playbook from trunk and the armed /goal. Audit the operation against both and fix drift in this tick. Probe every active lane and judge progress by side effects only. Stand down a stuck lane and dispatch its replacement now. Then send the operator a status message, whether or not anything changed, with the queue table of PR, owner, state, and head SHA, the verdicts since the last tick, what merged, open operator gates, and blockers."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] chrome-kit is first. It branches from `main`.
  - [ ] chrome-matter after chrome-kit.
  - [ ] chrome-scroll after chrome-matter.
  - [ ] chrome-inspect after chrome-matter. It may stack beside chrome-scroll on the same parent.
  - [ ] chrome-cutover after chrome-scroll and chrome-inspect and after the operator picks the winner.
  - [ ] chrome-finish after chrome-cutover.
- [ ] Hold the file boundaries. chrome-kit touches only `data/**` and `scripts/**`. chrome-matter touches only `components/melt/**`, `app/melt-lab/**`, and `package.json`. chrome-scroll touches `components/melt/**` and `app/melt-lab/**`. chrome-inspect touches `components/melt/**` and `app/melt-lab/**`. chrome-cutover touches `app/page.jsx`, `app/layout.jsx`, `app/globals.css`, and deletes `components/parse/**`. chrome-finish touches motion, phone, and a11y in `components/melt/**` plus `app/globals.css`.
- [ ] Hold the review gate. chrome-matter, chrome-scroll, chrome-inspect, chrome-cutover, and chrome-finish change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Open the PR ready, never draft, with `gh pr create` and `draft: false`, or with Graphite `gt` for a stack.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before babysit and again before the merge-ready report.

### Verdict and merge, for every PR

- [ ] At the merge-ready head SHA, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. One audit lane that reads the diff and the receipts and distrusts the PR body.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner. A new head gets a fresh swarm and a fresh verdict.
- [ ] The root appends the PR to the Graphite stack. The operator lands it. No owner squash-merges.

### Boot recipe, for every live lane

Each live lane runs on its own cloud VM at the PR head. Drive through `control-ui` from `cursor-team-kit`.

- [ ] `git fetch origin <head-branch> && git checkout <head SHA>`.
- [ ] Run `npm ci` then `npm run dev`. Wait until the terminal prints the local URL.
- [ ] Deliver input only through the control skill's commands. Name the read-only diagnostics.
- [ ] Save every screenshot to `/tmp/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## Register kit marks (chrome-kit)

**Depends on.** None.

**Files.**

- [ ] Edit `data/site.js`.
- [ ] Create `data/kit.js`.
- [ ] Edit `scripts/assert-site-data.mjs`.

**Build.**

- [ ] Add a `kit` array on `site` with id, name, kind (`tool` or `cert`), and `mark` (a local SVG path or a simple-icons slug). Include Git, Flutter, Next.js, ONNX Runtime, SAP Activate, Claude Code, Cursor, Figma, Google Workspace, PMI, SAP, Anthropic, Google, MathWorks, and Certiport. No invented tools.

**You see.**

- [ ] `node scripts/assert-site-data.mjs` prints `site data ok`. The live homepage is still the parse tree.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `assert-site-data.mjs` checks kit length, unique ids, and that every cert issuer in `site.certifications` has a kit row. Run `node scripts/assert-site-data.mjs`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Open `/`. Save `chrome-kit-home.png`. Pass when AMIEL chrome root is still the homepage.
- [ ] Lane 2. Confirm no new route. Save `chrome-kit-lab.png`. Pass when `/melt-lab` 404s.
- [ ] Lane 3. Open the assert log. Save `chrome-kit-assert.png`. Pass when the log shows `site data ok`.
- [ ] Lane 4. Check Flutter in `data/kit.js`. Save `chrome-kit-flutter.png`. Pass when Flutter is a tool row with a mark.
- [ ] Lane 5. Check Cursor in `data/kit.js`. Save `chrome-kit-cursor.png`. Pass when Cursor is a tool row.
- [ ] Lane 6. Check Figma in `data/kit.js`. Save `chrome-kit-figma.png`. Pass when Figma is a tool row.
- [ ] Lane 7. Check SAP Activate. Save `chrome-kit-sap.png`. Pass when SAP Activate is present as tool or cert.
- [ ] Lane 8. Check Anthropic. Save `chrome-kit-anthropic.png`. Pass when Anthropic is a cert mark.
- [ ] Lane 9. Check no extra client. Save `chrome-kit-no-invent.png`. Pass when the kit file has no tool name absent from `site.js` facts or the operator list in this plan.
- [ ] Lane 10. Skip link still works. Save `chrome-kit-skip.png`. Pass when Skip to content exists.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Largest Contentful Paint on `/`.
- [ ] Probe. Chrome Performance panel on a cold load of `npm run dev`, trunk then head, interleaved.
- [ ] Baseline. Record the trunk LCP first.
- [ ] Rule. Head LCP may not exceed trunk by more than 100 ms.

**Review gate.** None. chrome-kit is not review-gated.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Build the mercury (chrome-matter)

**Depends on.** chrome-kit.

**Files.**

- [ ] Create `app/melt-lab/page.jsx`.
- [ ] Create `components/melt/MeltCanvas.jsx`.
- [ ] Create `components/melt/MercuryMaterial.jsx`.
- [ ] Create `components/melt/ChromeType.jsx`.
- [ ] Edit `package.json`.

**Build.**

- [ ] Add a `/melt-lab` scene that is one mercury mass and chrome extruded type that reads AMIEL. Do not brand Rank 2 or Batch 27 on the metal. The parse homepage stays on `/`. Do not draw a node graph.

**You see.**

- [ ] Opening `/melt-lab` shows liquid metal and AMIEL as the metal itself. Opening `/` still shows the parse tree.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run build` exits 0. Run `npm run build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Open `/melt-lab`. Save `chrome-matter-first.png`. Pass when AMIEL is chrome type on mercury, not a label on a sphere.
- [ ] Lane 2. Orbit. Save `chrome-matter-orbit.png`. Pass when highlights move on the metal.
- [ ] Lane 3. Hunt leftover rank branding. Save `chrome-matter-no-rank.png`. Pass when RANK 2 and BATCH 27 are absent from the lab.
- [ ] Lane 4. Open `/`. Save `chrome-matter-old-home.png`. Pass when the parse tree is still the homepage.
- [ ] Lane 5. Confirm no node rail. Save `chrome-matter-no-rail.png`. Pass when there is no jump rail of Work Proof Lead Contact as equal boxes.
- [ ] Lane 6. Palette. Save `chrome-matter-palette.png`. Pass when sampled pixels are black, white, or grey.
- [ ] Lane 7. Type. Save `chrome-matter-type.png`. Pass when computed font on UI chrome is not Cormorant Garamond.
- [ ] Lane 8. Reduced motion. Save `chrome-matter-reduced.png`. Pass when the mass is still and AMIEL stays readable.
- [ ] Lane 9. Width 390px. Save `chrome-matter-phone.png`. Pass when AMIEL remains fully visible.
- [ ] Lane 10. Keyboard. Save `chrome-matter-keyboard.png`. Pass when Tab reaches a visible control.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Average FPS of `/melt-lab` during a 10 s orbit.
- [ ] Probe. Chrome Rendering FPS meter after a 3 s settle.
- [ ] Baseline. Record 30 FPS as the floor. Trunk has no melt lab.
- [ ] Rule. Head average FPS below 30 fails.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 screenshots into `docs/media/chrome-matter-review-first.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `docs/media/chrome-matter-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Pour the scroll film (chrome-scroll)

**Depends on.** chrome-matter.

**Files.**

- [ ] Create `components/melt/MeltScroll.jsx`.
- [ ] Create `components/melt/KitMint.jsx`.
- [ ] Create `components/melt/WorkForm.jsx`.
- [ ] Create `components/melt/Hallmark.jsx`.
- [ ] Edit `app/melt-lab/page.jsx`.
- [ ] Edit `app/globals.css`.

**Build.**

- [ ] Drive `/melt-lab?mode=scroll` as a vertical film. Scroll pours the same mercury through five jobs. Identity, kit mint, work forms, proof stamps, contact ingot. Each job is a new form, not a repeated card. Kit logos mint as chrome coins from the mass. Work forms are a lens (KitaKo), a glyph (BekiLang), a map fold (CitySense), and a key (iCARE). Empty stills stay empty frames on the form. Do not invent screenshots.

**You see.**

- [ ] Scrolling `/melt-lab?mode=scroll` changes the metal's job five times. Flutter and Figma appear as minted marks, not a line of text.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run build` exits 0. Run `npm run build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Cold load scroll mode. Save `chrome-scroll-identity.png`. Pass when AMIEL pours as metal type.
- [ ] Lane 2. Scroll to kit. Save `chrome-scroll-kit.png`. Pass when Flutter and Figma are visible as marks, not plain list text.
- [ ] Lane 3. Scroll to work. Save `chrome-scroll-work.png`. Pass when four distinct chrome forms are visible.
- [ ] Lane 4. KitaKo form. Save `chrome-scroll-kitako.png`. Pass when the lens form is labeled KitaKo.
- [ ] Lane 5. BekiLang form. Save `chrome-scroll-beki.png`. Pass when the glyph form is labeled BekiLang.
- [ ] Lane 6. Scroll to proof. Save `chrome-scroll-proof.png`. Pass when SAP or PMI is a stamp in the metal.
- [ ] Lane 7. Scroll to contact. Save `chrome-scroll-contact.png`. Pass when mailto is usable.
- [ ] Lane 8. Confirm no node graph. Save `chrome-scroll-no-tree.png`. Pass when there are no orbiting labeled spheres as the layout.
- [ ] Lane 9. Width 390px. Save `chrome-scroll-phone.png`. Pass when type and marks remain readable.
- [ ] Lane 10. Reduced motion. Save `chrome-scroll-reduced.png`. Pass when each job is a still frame and content stays reachable.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Average FPS during a full scroll through all five jobs.
- [ ] Probe. Chrome Rendering FPS meter, trunk parse `/` then head `/melt-lab?mode=scroll`, interleaved.
- [ ] Baseline. Record parse homepage orbit FPS first.
- [ ] Rule. Head average FPS below 30 fails.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 screenshots into `docs/media/chrome-scroll-review-identity.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `docs/media/chrome-scroll-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Freeze the inspect pool (chrome-inspect)

**Depends on.** chrome-matter.

**Files.**

- [ ] Create `components/melt/MeltInspect.jsx`.
- [ ] Edit `app/melt-lab/page.jsx`.
- [ ] Edit `components/melt/MeltCanvas.jsx`.

**Build.**

- [ ] Drive `/melt-lab?mode=inspect` as one pool. Pointer heat liquifies a region. Click freezes that region into the same work form or kit coin and opens a glass sheet with existing copy and links. Escape returns to the pool. This is not a syntax tree and not a rail of equal buttons.

**You see.**

- [ ] Clicking the pool on KitaKo's region freezes a lens and opens the thesis copy plus the GitHub link.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run build` exits 0. Run `npm run build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Load inspect mode. Save `chrome-inspect-pool.png`. Pass when the first view is one mass, not four corner nodes.
- [ ] Lane 2. Move the pointer. Save `chrome-inspect-heat.png`. Pass when the metal locally liquifies.
- [ ] Lane 3. Click KitaKo. Save `chrome-inspect-kitako.png`. Pass when a sheet shows on-device semantic image search and the repo link.
- [ ] Lane 4. Click the repo link. Save `chrome-inspect-repo.png`. Pass when GitHub opens.
- [ ] Lane 5. Freeze a cert. Save `chrome-inspect-sap.png`. Pass when SAP Activate is visible.
- [ ] Lane 6. Freeze SCC. Save `chrome-inspect-scc.png`. Pass when Director for Logistics is visible.
- [ ] Lane 7. Freeze contact. Save `chrome-inspect-mail.png`. Pass when the mailto is visible.
- [ ] Lane 8. Press Escape. Save `chrome-inspect-close.png`. Pass when the sheet closes and the pool is usable.
- [ ] Lane 9. Keyboard to email. Save `chrome-inspect-a11y.png`. Pass when Tab reaches mailto.
- [ ] Lane 10. Confirm no parse rail. Save `chrome-inspect-no-rail.png`. Pass when there is no bottom jump rail of 15 equal boxes.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Time from click on KitaKo to sheet text painted.
- [ ] Probe. Chrome Performance, click KitaKo ten times, take the median.
- [ ] Baseline. Record chrome-matter orbit FPS first.
- [ ] Rule. Median sheet paint above 200 ms fails. Orbit FPS below 30 fails.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 3 screenshots into `docs/media/chrome-inspect-review-kitako.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `docs/media/chrome-inspect-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Cut over the winner (chrome-cutover)

**Depends on.** chrome-scroll, chrome-inspect.

**Files.**

- [ ] Edit `app/page.jsx`.
- [ ] Edit `app/layout.jsx`.
- [ ] Edit `app/globals.css`.
- [ ] Delete `app/melt-lab/page.jsx`.
- [ ] Delete `components/parse/ParseApp.jsx`.
- [ ] Delete `components/parse/ParseScene.jsx`.
- [ ] Delete `components/parse/ParseNode.jsx`.
- [ ] Delete `components/parse/NodeRail.jsx`.
- [ ] Delete `components/parse/InspectSheet.jsx`.
- [ ] Delete `components/parse/DitherField.jsx`.
- [ ] Delete `components/parse/StillTree.jsx`.
- [ ] Delete `data/tree.js`.

**Build.**

- [ ] Make `/` render the operator's picked mode. Delete the parse tree and the lab route. Keep skip link, facts, and fonts other than Garamond. The other mode may live at `/inspect` or `/scroll` only if the operator asked for a second route. Default is one homepage.

**You see.**

- [ ] `/` is the melt. There is no parse node rail and no numbered Discipline heading.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run build` exits 0 and the build output contains no `ParseApp` string. Run `npm run build` then search the output.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Open `/`. Save `chrome-cutover-first.png`. Pass when the first viewport is mercury and AMIEL type, not the parse tree.
- [ ] Lane 2. Confirm `/parse-lab` is gone. Save `chrome-cutover-parse-lab.png`. Pass when that route 404s.
- [ ] Lane 3. Confirm `/melt-lab` is gone. Save `chrome-cutover-melt-lab.png`. Pass when that route 404s.
- [ ] Lane 4. Kit marks on `/`. Save `chrome-cutover-kit.png`. Pass when Figma or Flutter is a mark.
- [ ] Lane 5. Work on `/`. Save `chrome-cutover-work.png`. Pass when KitaKo is present as a form or freeze.
- [ ] Lane 6. Email. Save `chrome-cutover-email.png`. Pass when mailto is usable.
- [ ] Lane 7. CV. Save `chrome-cutover-cv.png`. Pass when the PDF downloads.
- [ ] Lane 8. Skip link. Save `chrome-cutover-skip.png`. Pass when Skip to content exists.
- [ ] Lane 9. GitHub. Save `chrome-cutover-github.png`. Pass when Emyol opens.
- [ ] Lane 10. No vermilion. Save `chrome-cutover-palette.png`. Pass when sampled UI pixels are black, white, or grey.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Largest Contentful Paint on `/`.
- [ ] Probe. Chrome Performance cold load, trunk parse `/` then head melt `/`, interleaved.
- [ ] Baseline. Record the trunk LCP first.
- [ ] Rule. Head LCP more than 2 times trunk fails. Orbit or scroll FPS below 30 fails.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 screenshots into `docs/media/chrome-cutover-review-first.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `docs/media/chrome-cutover-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Finish motion, phone, and reduced motion (chrome-finish)

**Depends on.** chrome-cutover.

**Files.**

- [ ] Edit `components/melt/MeltCanvas.jsx`.
- [ ] Edit `components/melt/MeltScroll.jsx`.
- [ ] Edit `components/melt/MeltInspect.jsx`.
- [ ] Edit `app/globals.css`.

**Build.**

- [ ] Interruptible pour. Phone layout that keeps AMIEL and kit marks tappable. `prefers-reduced-motion` stills each job. Focus rings on sheet and marks. Contrast on sheet body white on black.

**You see.**

- [ ] First load pours then holds. Reduced motion shows stamped stills. Phone keeps 44px hits.

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] `npm run build` exits 0. Run `npm run build`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes on `grok-4.6-fast-xhigh` at the PR head, per the boot recipe.

- [ ] Lane 1. Cold load `/`. Save `chrome-finish-pour.png`. Pass when the metal writes itself then holds.
- [ ] Lane 2. Click during pour. Save `chrome-finish-interrupt.png`. Pass when input is accepted before the intro ends.
- [ ] Lane 3. Reduced motion. Save `chrome-finish-reduced.png`. Pass when labels are visible at t=0 and the field is still.
- [ ] Lane 4. Viewport 390x844. Save `chrome-finish-phone.png`. Pass when kit marks are visible and tappable.
- [ ] Lane 5. Hit size. Save `chrome-finish-hits.png`. Pass when marks are at least 44px tall.
- [ ] Lane 6. Focus ring. Save `chrome-finish-focus.png`. Pass when Tab shows a visible focus.
- [ ] Lane 7. Contrast. Save `chrome-finish-contrast.png`. Pass when sheet body is white or near-white on black.
- [ ] Lane 8. Kitako still slot. Save `chrome-finish-still.png`. Pass when an empty work frame does not show a fake screenshot.
- [ ] Lane 9. Portrait. Save `chrome-finish-portrait.png`. Pass when `hero-profile.png` can appear in inspect or identity, not as a fashion hero on first viewport unless the operator later asks.
- [ ] Lane 10. Identity without a sheet. Save `chrome-finish-name.png`. Pass when AMIEL is readable without opening a sheet and RANK 2 is absent.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. Average FPS during pour plus a 10 s orbit or scroll, and JS heap after 60 s idle.
- [ ] Probe. Chrome Performance plus Memory, head only, after cutover baseline FPS.
- [ ] Baseline. Record chrome-cutover FPS first.
- [ ] Rule. Average FPS below 30 fails. Heap growth above 20 MB over 60 s idle fails.

**Review gate.** The operator reviews before merge.

- [ ] Copy lane 1 screenshots into `docs/media/chrome-finish-review-pour.png`.
- [ ] Record a 30 to 60 second video of the change on a lane VM. Save it as `docs/media/chrome-finish-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] The root appends the PR to the Graphite stack. The operator lands it.

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

`_scratch/chrome-lab/` on 2026-08-29. Inspect and Scroll behind a switcher. Stills at `_scratch/chrome-lab/inspect.png` and `_scratch/chrome-lab/scroll.png`. Served at `http://localhost:4173/`.

That lab proved labeled chrome spheres are still a node graph. It failed next to [Xander Dacillo](https://xanderdacillo.vercel.app/) and [Ralph Andrei](https://ralphandrei.dev/). Xander invents letter physics, photo cards, and a new idea almost every screen. Ralph invents a shader void, a pauseable timeline, and a product-complete scroll. The lab copied neither their photos nor that density. Unproven until chrome-matter. Whether extruded chrome type reads as metal on a real GPU. Whether kit coins read as minted, not as a footer chip row. Whether four work forms stay distinct at 390px.

Operator picks the homepage after chrome-scroll and chrome-inspect review. Default pick if she says nothing at cutover is scroll.

## Appendix B. Alternatives rejected

Keep the parse tree and dress it in chrome. Failed. The blob lab was that idea. Xander and Ralph do not layout a career as equal satellites.

Two separate websites in production. Rejected unless the operator asks. She already said she will pick a winner.

Copy Xander's light photo cards or Ralph's service grid. Rejected. Steal density of invention, not their content.

8bitcn retro. Rejected by the chrome brief.

Shadcn default cards. Rejected. That is a dashboard.

## Appendix C. Risks

This repo has no `pstack/` on trunk. `git show origin/main:pstack/...` will fail. Owners read those skills from the local Cursor plugin cache and note that in the PR body.

This repo has no Graphite setup. If `gt` is missing, open ordinary GitHub PRs in the same order and the operator lands them. Do not invent a Graphite install.

WebGL on low-end phones. chrome-finish owns the still-job fallback.

Fake product shots. chrome-scroll fails if a work form shows invented UI. Empty frames until the operator drops stills.

Creativity regression. chrome-matter fails if AMIEL is an HTML label on a sphere. chrome-scroll fails if five sections are the same card with different titles.

## Appendix D. Links and reading list

Facts at `data/site.js`. Current homepage at `components/parse/ParseApp.jsx` until cutover. Moodboard from the operator on 2026-08-29. Tool list from [the operator spreadsheet](https://docs.google.com/spreadsheets/d/1WQba7DmRnI4rljrriiFNICBpI8zGV8YVUH56ql0goBw/edit?usp=sharing) (Motion.dev, GSAP, ShaderGradient, Reactbits, Rotato, Lucide, 21st.dev). Use those as craft levers inside The melt, not as a component zoo.

chrome-matter and chrome-scroll get `pstack/skills/how/SKILL.md` before the scene API is named. chrome-cutover gets `pstack/skills/interrogate/SKILL.md` if the delete list fights a leftover parse import.

Trail per `pstack/skills/show-me-your-work/SKILL.md`, local `decisions.tsv`, never committed.
