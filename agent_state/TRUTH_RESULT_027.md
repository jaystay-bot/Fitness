# TRUTH_RESULT_027

N_ID: N_027
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS

Evidence:
- tsc 0; build 0; emoji guard clean (lucide icons only).
- Desktop screenshot (n027_hero_desktop.png): aurora + botanical motif, gold
  italic headline, mint "Build my protocol" CTA + trust line, glass panel.
- Mobile screenshot (n027_hero_mobile.png): clean single-column premium hero;
  no overlap.

Watcher: only components/SpearHero.tsx changed. Engine/routes/theme tokens
untouched → engine determinism + visual locked colors intact.
