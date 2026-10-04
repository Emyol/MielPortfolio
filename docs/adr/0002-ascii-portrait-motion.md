# Preserve the ASCII portrait and refine motion

The implemented ASCII portrait is the recognizable Signature Material of the Craft Showcase, so we retain it instead of replacing it with Canvas UI Liquid. This supersedes ADR-0001?s liquid-hero requirement while retaining Silver Field ink, Fraunces/Public Sans, normal vertical Work scrolling, and the rejection of Operator Console decoration: ASCII portrait glyphs do not authorize terminal chrome or ASCII rain.

GSAP coordinates hero and once-only section entrances, Framer Motion handles interactive state transitions, and CSS handles control feedback, with one transform owner per element. Live reduced-motion preferences reveal final content immediately and stop decorative movement; the portrait also pauses offscreen and in background tabs. No new animation library or GPU effect is introduced.
