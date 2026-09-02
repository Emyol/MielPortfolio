---
name: Miel — Liquid Field
description: Silver Field craft showcase for Amiel Acuña
colors:
  field-bg: "#070707"
  field-ink: "#ececec"
  field-mute: "#9c9c9c"
  field-line: "rgba(236, 236, 236, 0.14)"
  field-plate: "#141414"
  shadcn-bg: "oklch(0.12 0 0)"
  shadcn-fg: "oklch(0.93 0 0)"
  shadcn-card: "oklch(0.16 0 0)"
  shadcn-muted-fg: "oklch(0.72 0 0)"
  shadcn-border: "oklch(1 0 0 / 14%)"
  shadcn-ring: "oklch(0.86 0 0)"
typography:
  display:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "clamp(2.8rem, 8vw, 5.6rem)"
    fontWeight: 500
    lineHeight: 0.92
    letterSpacing: "-0.04em"
    fontVariation: "\"SOFT\" 40, \"WONK\" 1, \"opsz\" 144"
  headline:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "clamp(2.2rem, 5vw, 4rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontVariation: "\"SOFT\" 35, \"WONK\" 1"
  title:
    fontFamily: "Fraunces, ui-serif, serif"
    fontSize: "1.35rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Public Sans, ui-sans-serif, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: "Public Sans, ui-sans-serif, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  hairline: "2px"
  none: "0px"
spacing:
  gutter: "clamp(1.25rem, 4vw, 4.5rem)"
  section: "clamp(5.5rem, 12vw, 9rem)"
  cluster: "1.5rem"
  tight: "0.75rem"
components:
  button-primary:
    backgroundColor: "{colors.field-ink}"
    textColor: "{colors.field-bg}"
    rounded: "{rounded.hairline}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "#d4d4d4"
    textColor: "{colors.field-bg}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.hairline}"
    padding: "0 1.25rem"
    height: "2.75rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.hairline}"
    padding: "0 1.25rem"
    height: "2.75rem"
  card-field:
    backgroundColor: "{colors.shadcn-card}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.hairline}"
    padding: "1.5rem"
---

# Design System: Liquid Field

## Overview

**Creative North Star: "Liquid Field"**

The Surface is a volume of silver fluid a visitor remembers. Near-black ground, white and silver ink, Fraunces display with Public Sans body, and 2px metal corners. Canvas UI Liquid lives only in the first viewport. After that, the page is typeset evidence: Work, leadership, CV, and a way to write.

Operator Console is discarded, not kept as texture. No terminal chrome, box-drawing, prompt copy, ASCII rain, custom cursor, or spinning preloader. No second hue. No rainbow fluid. No whole-page shader. shadcn Button and Card may appear on Work and contact only after they are restyled to Silver Field.

**Key Characteristics:**
- One material (Liquid) in the first viewport; one type voice (Fraunces + Public Sans) everywhere else
- Monochrome silver on near-black; hairline 2px corners
- Pin-and-typeset section titles; Work stays ordinary vertical scroll
- Field Components are metal plates, not Nova cards

## Colors

Silver Field is a two-ink system. Ground is near-black. Everything a visitor reads or stirs is white or silver. shadcn tokens map onto the same grayscale; they must not introduce a second hue.

### Primary
- **Field Ink** (`#ececec`): Display type, primary buttons, liquid trail, focus rings, scroll progress.
- **Field Ground** (`#070707`): Page, nav, overlay, and liquid container.

### Neutral
- **Field Mute** (`#9c9c9c`): Body supporting copy, labels, years, secondary nav.
- **Field Line** (`rgba(236, 236, 236, 0.14)`): Hairline rules, outlines, command chrome.
- **Field Plate** (`#141414`): Quiet lift behind the portrait and shadcn cards (`oklch(0.16 0 0)`).

## Typography

Two loaded faces. Fraunces is Signature Type for display, brand, pin titles, and card titles. Public Sans is body, UI, and measures. Do not substitute Inter, Space Grotesk, IBM Plex, Geist, or a system display face.

Tracking floor is `-0.04em`. Display never exceeds `5.6rem`. Body measure stays near `42–52ch` for ledes.

## Layout

Max width `1280px` with fluid gutters. Desktop hero is a two-column first viewport: typeset bottom-left, portrait plate right. Sections after the hero use a sticky pin column (title) plus a reading column. Work is a compact index rail plus one Field Card. Below `860px`, nav links hide (Find remains), pin titles go static, and most grids collapse; the hero keeps a tight two-column so the portrait stays in the first viewport.

## Elevation & Depth

The world is tonal, not shadowed. Separation comes from hairline borders, a slightly lifted plate, and the liquid overlay. Do not add drop shadows, glass blur as decoration, or hard offset blocks.

## Shapes

Every interactive corner is `2px`. No pills. No circles standing in for photographs. The portrait is a rectangular metal plate with a grayscale cut-out, not an organic mask.

## Components

### Buttons
- **Shape:** 2px corners; height 44px default, 36px small.
- **Primary:** Field ink fill, ground text.
- **Outline:** Transparent fill, hairline border; inverts to ink fill on hover.
- **Ghost:** Text only; 8% ink wash on hover.
- **Focus:** 2px field-ink ring, 3px offset.

### Cards / Containers
- **Corner Style:** 2px
- **Background:** Plate (`oklch(0.16 0 0)`)
- **Border:** Field line
- **Use:** Work detail and contact only. Not a page scaffold of identical cards.

### Navigation
- Fixed top bar. Brand “Miel” in Fraunces. Links mute until active. On scroll, a 88% ground wash and hairline. Mobile: brand + Find.

### Command palette
- Find / Ctrl K. Near-black dialog, hairline border, 2px corners. Destinations, not terminal commands.

### Signature: Liquid Field
- Canvas UI Liquid wraps the first viewport only. Trail color `[1, 1, 1]`. Rainbow off. The simulation stays alive while the hero is on screen so a still frame still reads as a silver volume. Pointer-stir and the overlay hide when `prefers-reduced-motion: reduce`.

### Signature: Pin-and-typeset
- Section titles clip-reveal with GSAP ScrollTrigger scrub. Sticky on desktop, static below 860px. Not a third GPU identity.

## Do's and Don'ts

### Do:
- **Do** keep Liquid in the first viewport only, silver, with `rainbow={false}`, and keep the volume moving at rest.
- **Do** set section titles in Fraunces and body in Public Sans.
- **Do** restyle shadcn Button/Card to Silver Field before using them on Work or contact.
- **Do** honor `prefers-reduced-motion`: no fluid stir, no pin-and-typeset transform.

### Don't:
- **Don't** reintroduce Operator Console chrome, ASCII, box-drawing, or `>` prompt copy.
- **Don't** add a second hue, rainbow fluid, or Liquid on Work images.
- **Don't** use kickers, section numbers as decoration, or dashboard-tile metrics as the hero template.
- **Don't** add Skiper UI, 21st.dev, or a third motion library as a visual identity.
