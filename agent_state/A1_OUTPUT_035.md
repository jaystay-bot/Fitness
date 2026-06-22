# A1_OUTPUT_035
N_ID: N_035
Files changed:
- tailwind.config.ts — "Daylight" palette: ink #F7F9FC (light), surface #FFFFFF,
  elevate #EEF2F8, paper #0F1B2D (navy), lime #2563EB (blue), gold #047857
  (emerald), clinical #E11D48 (rose); light card/glow shadows.
- app/globals.css — white canvas + soft blue/amber/emerald washes; grain removed;
  blue focus ring; blue selection.
- app/layout.tsx + components/AccountMenu.tsx + app/sign-in + app/sign-up — Clerk
  appearance vars → light palette.
- tests/visual.spec.ts — locked colors re-frozen: body rgb(247,249,252), CTA
  rgb(37,99,235).
- components/commerce/BottleVisual.tsx — SVG bottle recolored for light (yellow
  cap, blue body, light label) — now reads like a real bottle.
- components/TimelineProjection.tsx, InteractiveTimeline.tsx — chart series now
  4-6 vibrant hues (blue/violet/amber/emerald/rose); axes/grid/legend navy on
  white; tooltips light. Removed old neon hexes (#D4FF3A/#FF6B35/#FAFAF7/#0A0A0A).
- components/BodyVisualization.tsx, SpeakToDoctorButton.tsx — old hexes mapped to
  the new palette.
Commands run: tsc 0; build 0; screenshots (hero, mobile, result+charts, shop).
Notes: charts previously used the original N=001 neon palette (never tokenized);
now consistent with the theme and legible on white. No engine/route/dep change.
