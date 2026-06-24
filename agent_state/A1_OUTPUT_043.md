# A1_OUTPUT_043
N_ID: N_043
Files changed:
- lib/engine.ts — added bmr() (Mifflin-St Jeor), ACTIVITY_FACTOR, maintenanceCalories()
  (TDEE rounded to 50 kcal), calorieTargetKcal() (goal-adjusted: gain-weight +400,
  muscle +200, fat-loss -400, underweight forces +400 surplus). Wired both into
  buildNutrition().dailyTargets.
- lib/types.ts — Recommendation.nutrition.dailyTargets += calorieTarget,
  maintenanceCalories.
- lib/supplements.ts — added "gain-weight" to goals[] of creatine, vitamin-d3,
  magnesium-glycinate, protein (the gain-weight core) so The Wire's "Weight gain"
  filter populates. buildStack ignores entry.goals → no engine rec change.
- components/ResultCard.tsx — summary row shows "Eat N kcal/day (maintain M)".
Commands run: tsc 0; build 0.
Verify: calorie math sanity-checked across 4 goal profiles (underweight male
gain-weight 2150→2550; female fat-loss 2300→1900; male muscle 3100→3300;
female longevity sedentary 1450 maintenance). Screenshot N/A (sandbox blocks
Playwright browser download).
Notes: no peptides; honest "estimate" math; no API/route/dependency change.
