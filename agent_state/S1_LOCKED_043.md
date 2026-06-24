# S1_LOCKED_043

N_ID: N_043

Intent:
Make the underweight → healthy weight-gain path excellent and genuinely useful
(the Commander's own use case). The engine logic (N=021/022) already detects
underweight, sets a unified protein target, gives food-first warnings and a
gain-weight food protocol. This N closes two real usability gaps:

1. CALORIE TARGET. Add a deterministic daily calorie number — the #1 figure a
   weight-gain user needs. Mifflin-St Jeor BMR × activity factor = estimated
   maintenance (TDEE); goal-adjusted (gain-weight +400, muscle +200, fat-loss
   -400, else maintenance; underweight forces a +400 surplus regardless of
   goal). Rounded to a clean 50 kcal. Surfaced in the result summary row as
   "Eat N kcal/day (maintain M)".

2. WEIGHT-GAIN FILTER FIX. The Wire exposes a "Weight gain" goal filter, but no
   supplement carried `gain-weight` in its goals[], so the filter returned an
   empty feed. Tag the four gain-weight core compounds (protein, creatine,
   vitamin-d3, magnesium-glycinate) so the filter resolves to the evidence-
   backed core. NOTE: buildStack() uses hardcoded GOAL_CORE id-lists and never
   reads entry.goals, so this changes ZERO engine recommendations — feed/UX only.

Honesty: calories are an explicit estimate (Mifflin-St Jeor is an estimator);
no peptides/hormones; food-first framing retained.

Scope / Allowed files:
- lib/engine.ts        (bmr/maintenance/calorie-target helpers + nutrition wire-up)
- lib/types.ts         (dailyTargets += calorieTarget, maintenanceCalories)
- lib/supplements.ts   (tag gain-weight on the 4 core compounds)
- components/ResultCard.tsx (show the calorie line)
- agent_state/* (trail)

Forbidden files:
- app/api/**, package.json/lock, unrelated components.

Deliverables:
- Calorie target computed + displayed; Weight-gain filter populated; tsc/build green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
(Screenshot unavailable — sandbox blocks Playwright browser download; verified via
build + calorie-math sanity check across goal types.)

Parallel safe: false (shared engine/types). Stop: tsc/build non-zero; engine recs change.
