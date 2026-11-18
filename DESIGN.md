---
name: Miel — Dive
description: One ocean of characters behind the page, scroll scenes and liquid-glass panels, for Amiel Acuña's portfolio
colors:
  bg: "#070707"
  ink: "#ececec"
  mute: "#9d9d9d"
  line: "rgba(236, 236, 236, 0.16)"
  rule: "#474747"
  surface: "#0e0e0e"
  accent: "#2997ff"
  case-bg: "#d9d9d5"
  case-ink: "#0b0b0b"
  case-accent: "#0058b8"
  case-surface: "#e6e6e2"
  case-mute: "#4f4f4a"
  case-rule: "#8c8c88"
  case-line: "rgba(11, 11, 11, 0.2)"
  glass-label: "#a9a9a9"
  glass-tint-top: "rgba(255, 255, 255, 0.075)"
  glass-tint-bottom: "rgba(255, 255, 255, 0.025)"
  glass-edge: "rgba(255, 255, 255, 0.05)"
  glass-divider: "rgba(255, 255, 255, 0.06)"
  glass-hairline: "rgba(255, 255, 255, 0.08)"
  glass-glow: "rgba(255, 255, 255, 0.12)"
  glass-inner-top: "rgba(255, 255, 255, 0.16)"
  glass-rim-soft: "rgba(255, 255, 255, 0.36)"
  glass-rim: "rgba(255, 255, 255, 0.7)"
  glass-rim-clear: "rgba(255, 255, 255, 0)"
  glass-fallback: "rgba(20, 20, 20, 0.82)"
  glass-inset: "rgba(0, 0, 0, 0.35)"
  profile-inset: "rgba(0, 0, 0, 0.28)"
  shadow-deep: "rgba(0, 0, 0, 0.95)"
  shadow-window: "rgba(0, 0, 0, 0.9)"
  shadow-case: "rgba(0, 0, 0, 0.22)"
  shadow-cert: "rgba(0, 0, 0, 0.18)"
  clash: "#e5484d"
  white: "#fff"
  black: "#000"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 7.5vw, 7.5rem)"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.045em"
    fontVariation: "\"SOFT\" 0, \"WONK\" 1, \"opsz\" 144"
  fitted:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "fitted by script to the line width"
    fontWeight: 800
    lineHeight: 0.88
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.68rem"
    fontWeight: 500
    letterSpacing: "0.12em"
    textTransform: uppercase
  label-small:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.6rem"
  label-large:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
  # The rest of the ramp, smallest to largest, as used in app/dive.css
  small: { fontSize: "0.84rem" }
  small-plus: { fontSize: "0.86rem" }
  secondary: { fontSize: "0.88rem" }
  secondary-plus: { fontSize: "0.9rem" }
  caption: { fontSize: "0.92rem" }
  compact: { fontSize: "0.95rem" }
  base: { fontSize: "1rem" }
  button-large: { fontSize: "1.02rem" }
  lead: { fontSize: "1.1rem" }
  cert-title: { fontSize: "1.2rem" }
  verdict: { fontSize: "1.6rem" }
  brand-mark: { fontSize: "1.7rem" }
  bio: { fontSize: "clamp(1.15rem, 1.5vw, 1.35rem)" }
  case-lede: { fontSize: "clamp(1.05rem, 1.6vw, 1.35rem)" }
  work-header: { fontSize: "clamp(1.4rem, 2vw, 1.8rem)" }
  piece-title: { fontSize: "clamp(1.4rem, 2.4vw, 2rem)" }
  motto: { fontSize: "clamp(1.5rem, 2.3vw, 2.1rem)" }
  discipline: { fontSize: "clamp(1.9rem, 3.4vw, 3.1rem)" }
  project-phone: { fontSize: "clamp(2.6rem, 11vw, 4rem)" }
  project: { fontSize: "clamp(2.6rem, 5.2vw, 5.4rem)" }
  figure: { fontSize: "clamp(3rem, 6.4vw, 6rem)" }
  case-title: { fontSize: "clamp(3rem, 10vw, 9rem)" }
rounded:
  pill: "999px"
  glass: "30px"
  card: "24px"
  inset: "16px"
  frame: "6px"
spacing:
  gutter: "clamp(1.25rem, 5vw, 5rem)"
  pane: "clamp(1.25rem, 2.6vw, 2.4rem)"
  section: "18svh"
  frame-margin: "clamp(5px, 0.55vw, 8px)"
motion:
  ease-out: "cubic-bezier(0.23, 1, 0.32, 1)"
  press: "scale(0.97), 140ms ease-out"
---

# Dive

Approved by the owner on 2026-11-18 from the published prototype; see `docs/adr/0003-dive.md`. Source: `app/dive.css`, `components/dive/`.

## Overview

The page is one dive from the surface to the floor. A single fixed canvas of characters (`.:-=+*#%@`) sits behind everything and drifts with scroll; specks rise past the reader; a whale shark, drawn from the same characters, swims the whole page and darts from a click. A thin ink frame and a depth gauge on the right edge (40 m) hold the page. Each section is a scene rather than a box: the headline is written in the water and breaks into bubbles, the work stage is pinned while projects change, the timeline draws itself, certificates slide past sideways.

## Colors

Near-black ground, off-white ink, one grey for secondary text. The water is ink at 0.34 alpha; the headline and shark are full ink; ripple crests are the blue accent. Case pages flip to the silver side (`case-*`).

## Typography

Fraunces 800 at poster scale for section titles and fitted lines; Geist for reading; Geist Mono for every small label, date and stack line. Titles rise word by word; fitted lines fill their width exactly.

## Liquid glass

Every block of text sits on a glass panel instead of cutting a hole in the water. The canvas does the lensing: under each `[data-glass]` rect it samples the water through a convex-squircle bezel with Snell refraction at n = 1.5 (after kube.io's web recreation of Apple's Liquid Glass), bright and bent at the edge, frosted and dim in the middle. CSS adds a 1.4px blur, a white tint and a specular rim (`--spec`) that turns toward the pointer. Apple's guidance reserves the material for controls; using it on content panels is the owner's choice.

## Shapes

Pills for buttons and chips; 30px glass panels; 24px certificate cards with a 16px inset; 6px window frames around screenshots.

## Motion

Strong ease-out for entrances; press feedback `scale(0.97)`; hover effects only under `(hover: hover) and (pointer: fine)`. Reduced motion stops the canvas, shows every scene finished, and turns the certificate strip into a scrollable row.

## Do's and Don'ts

- Do attach each skill to the project that proves it (About index); don't list chips without evidence.
- Do keep one sentence per project on the home page; detail belongs on the case page.
- Don't cut rectangles out of the water; put text on glass.
- Don't animate keyboard-driven actions; arrow keys step case pages instantly apart from a short cross-fade.
