# A1_OUTPUT_022

N_ID: N_022

Files changed:
- lib/types.ts — PrimaryGoal += "gain-weight"; new InflammationLevel; optional
  UserInput.inflammation.
- lib/engine.ts — proteinTargetGrams() single source of truth (used by the
  protein card, daily target, and 30-day plan); GOAL_CORE["gain-weight"];
  underweight (BMI<18.5)/gain-weight → protein+creatine; elevated/high
  inflammation → omega-3; inflammation food override threaded into buildNutrition;
  food-first/no-peptides + inflammation warnings.
- lib/nutrition.ts — GOAL_NUTRITION["gain-weight"]; exported INFLAMMATION_OVERRIDE.
- lib/verdict.ts — GOAL_PHRASE["gain-weight"] = "built to add healthy weight".
- lib/slug.ts — GOAL += gain-weight; encode/decode optional inflammation.
- app/api/recommend/route.ts — validate gain-weight goal + optional inflammation.
- components/AssessmentForm.tsx — "Gain weight" option; inflammation select;
  DEFAULTS.inflammation = "unknown".
- components/VoiceInput.tsx — type-forced exhaustive label for the new key.

Commands run:
- npx tsc --noEmit → exit 0
- npm run build → exit 0
- Live /api/recommend evidence (see TRUTH_RESULT_022).

Notes:
- recommend() remains pure + deterministic (double-POST byte-identical for both
  a legacy and a new input).
- Output INTENTIONALLY changes for existing inputs at the protein number (now
  unified) — Commander-authorized; documented as the planned primitive change.

Out-of-scope items noticed:
- studyCount values are still hand-typed round numbers → N=023.
- Form is now 12 fields → minimal-input mode still wanted (queued separately).
