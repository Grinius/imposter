---
name: imposter-visual-design
description: Design and implement Imposter artwork, tabletop presentation, card reveals, responsive game screens, motion, and visual quality checks.
---

# Imposter visual design

Read `docs/PROJECT.md` for the distinction between reference and approved direction, and `docs/QUALITY.md` for relevant checks. Inspect existing components/assets first.

Aim for a coherent crafted game: consistent materials, lighting, type, illustration, and motion. The reference's strength is its cohesive composition and detail; do not copy its game branding or assets. Establish a small palette, type hierarchy, spacing system, and card/control treatment before expanding screens.

Design the full round on a narrow phone first. Keep secrets, player identity, phase, and next action legible. Use desktop space for atmosphere and the social table. Use semantic HTML for controls and essential text; decorative 3D should enhance rather than gate gameplay.

Use available image-generation skills for original bitmap art when useful; record prompts/provenance and optimize outputs. Prefer existing SVG/code assets for ordinary icons. Avoid adding heavy 3D dependencies solely for simple card flips or shadows.

Make dealing, reveal, vote, and result animations communicate state. Input and secret visibility must remain correct during transitions. Provide reduced-motion behavior and optional sound.

Inspect actual rendered screens across mobile and desktop, including long names, crowded rooms, errors, and replay. Capture and examine screenshots; correct clipping, weak contrast, inconsistent materials, and performance problems before calling the design complete. Report when browser validation is unavailable.
