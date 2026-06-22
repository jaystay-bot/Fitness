# A1_OUTPUT_027

N_ID: N_027

Files changed:
- components/SpearHero.tsx — full rewrite into a kinetic hero:
  - aurora backdrop (mint + gold blurred blooms with aurora-drift / float-slow)
    + a concentric botanical SVG motif;
  - pill eyebrow with a pulsing mint dot;
  - headline with a champagne-gold italic emphasis ("settled by the science");
  - staggered fade-up entrance (animation-delay on eyebrow/headline/subhead/CTA);
  - primary "Build my protocol" CTA (mint pill, glow, arrow nudge on hover)
    anchored to #assessment-form;
  - trust line (Evidence-tiered / ~60 seconds / No email gate) with lucide icons;
  - "What you get" glass panel (backdrop-blur, mint check chips, gold label),
    gently floating on lg.

Commands run:
- emoji guard → none (lucide icons only)
- npx tsc --noEmit → 0 ; npm run build → 0
- screenshots: n027_hero_desktop.png, n027_hero_mobile.png

Notes:
- Pure CSS motion (N=026 keyframes); no dependency added; reduced-motion honored
  by the global guard.
- Only SpearHero.tsx changed.

Out-of-scope noticed:
- Could extend the same motion language to SymptomEntry / VaultDashboard cards
  and the result reveal — future polish cycle.
