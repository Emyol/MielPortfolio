# Recognition: ASCII medals (design)

Date: 2026-11-26 · Status: awaiting owner approval

## Why
With 8 awards the Recognition header became a plain two-column list that read as underwhelming and pushed the certificate strip off the pinned screen. The owner reviewed five studies (session prototype `recognition-five.html`) and picked study 1: competition results as spinning medals drawn in the site's ASCII glyphs, after shadcn's "Medallion Flip Awards".

## Goals
- The four 2026 competition results read first, as four coins drawn in the same glyph language as the ocean.
- Each coin turns slowly; hovering a coin (mouse) brings it to rest face-on. The coins hold no action, so they are not made keyboard-focusable. Front: the placement numeral. Back: the year ("’26").
- Under each coin: label and year (mono), short event name, organiser.
- The other awards sit in one quiet glass "Also" row under the coins.
- The certificate strip gets its full screen back.

## Non-goals
- No change to certificates themselves, the admin editor, or the content schema.
- No 3D library; plain 2D canvas.

## Anti-goals
- Placements or event names invented or reworded beyond the owner's resume.
- A spinning canvas that costs frame rate while off screen (the 2026-11-20 performance pass must hold).

## Approaches considered
1. **ASCII medals (chosen by the owner).** Unique to the site's glyph language.
2. Glass trophy cabinet, 3. hover list, 4. scoreboard, 5. seabed sonar: studied and not chosen (4 needs real standings, 3 needs event photos).

## Layout (my call, for approval)
The Recognition section becomes two pinned screens instead of one:
1. **Medals screen:** "Recognition" title and a one-line lede on top, four coins in a row, the Also row beneath.
2. **Certificates screen:** the existing horizontal strip with a small "Certificates" label, unchanged in behaviour.
The section grows from 280svh to about 380svh. Phones (≤ 760 px): coins in a 2×2 grid at about 150 px each; both screens unpinned, as today.

## Data (my call, for approval)
- Which awards are medals: a new `AWARD_MEDALS` map in `lib/dive/extras.js`, keyed by award id (same pattern as `WORK_EXTRAS`, so stored Supabase content still validates): `{ place, label, short }`. Ids: entry-5 n8n (1, Track D Champion), entry-6 CyberXploit (1, Champion), entry-7 OpenAI (2, 2nd Place), entry-8 SEEN (2, 1st Runner-Up). Organiser and year come from the award item itself.
- Every other active award goes in the Also row as stored (title and year), in content order. The two Top Performing Student entries stay separate (no merging logic), so nothing is lost.
- An archived medal award disappears from the row; an award without a medal entry shows in Also.

## Behaviour
- Coins are drawn on the main thread at about 30 fps, only while the medals screen is on screen (IntersectionObserver); stopped otherwise.
- Reduced motion: coins drawn once, face-on, never spin.
- No JavaScript: each coin shows its placement as large text ("1st") instead of the canvas; all 8 awards stay readable in `#awards` as list items.
- Coins are decorative (`aria-hidden` canvas); each list item carries the full text for screen readers.

## Verification
- `tests/frontend.spec.ts`: no-JS count of `#awards li` stays 8; overflow tests at 1360 and 390 px pass with the taller section; reduced-motion test still passes.
- Typecheck; screenshot check at 1360 and 390 px; frame rate checked with the coins on screen.

## Left to the builder
Exact coin size per breakpoint, glyph ramp and lighting constants (start from the prototype), lede wording.
