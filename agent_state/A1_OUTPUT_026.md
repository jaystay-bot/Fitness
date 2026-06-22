# A1_OUTPUT_026

N_ID: N_026

Files changed:
- tailwind.config.ts — Elite Apothecary palette (ink #0B0E0C, surface, elevate,
  paper #EFEDE4, lime→mint #5FE3A1, new gold #E4C896, clinical #EF8A63); glow
  shadow recolored to mint; motion keyframes + animations (fade-up, aurora-drift,
  shimmer, float-slow).
- app/globals.css — evergreen canvas, layered aurora (mint + gold + deep green),
  fixed SVG grain layer, z-index discipline, mint focus ring + selection,
  reduced-motion guard.
- app/layout.tsx — Clerk appearance vars updated to the new palette.
- tests/visual.spec.ts — locked colors re-frozen: body rgb(11,14,12),
  CTA rgb(95,227,161).

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0
- Live: body bg = rgb(11,14,12) confirmed; desktop screenshot saved.

Notes:
- Pure CSS motion — no dependency added (least friction).
- Components inherit the new palette via tokens; component-level motion lands N=027.

Out-of-scope noticed:
- /api/og image still old palette → fold into a later cycle.
