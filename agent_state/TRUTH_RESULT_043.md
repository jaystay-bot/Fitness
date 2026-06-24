# TRUTH_RESULT_043
N_ID: N_043
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS
Evidence: tsc 0; build 0. Calorie target added to dailyTargets and rendered in
ResultCard ("Eat N kcal/day (maintain M)"); math verified sensible across goal
types. The Wire "Weight gain" filter now resolves to the 4 Strong-tier core
compounds (creatine, vitamin-d3, magnesium-glycinate, protein) — previously
empty. buildStack ignores entry.goals, so engine recommendations are unchanged
(feed/UX-only metadata change).
Files changed: lib/engine.ts, lib/types.ts, lib/supplements.ts,
components/ResultCard.tsx.
Caveat: live screenshot unavailable (sandbox blocks Playwright browser download).
