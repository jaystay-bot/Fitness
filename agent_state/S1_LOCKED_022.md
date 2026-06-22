# S1_LOCKED_022

N_ID: N_022

Intent:
Mission logic. Three deterministic-engine changes that deliver the core of the
Commander's request:
1. Unify the protein target — today it is computed three different ways
   (×1.6 supplement card, ×1.4/×1.8 daily target, ×1.4 30-day plan) so the
   screen shows contradictory numbers. One `proteinTargetGrams(input)` everywhere.
2. Inflammation-aware protein + anti-inflammatory emphasis. New optional
   `inflammation` field; elevated/high raises protein and ensures omega-3 +
   anti-inflammatory foods.
3. Underweight → healthy weight gain (NO peptides/hormones). New `gain-weight`
   goal AND auto-detect BMI < 18.5 to surface a whole-food calorie surplus +
   creatine/protein, with an explicit food-first / no-peptides note.

Scope / Allowed files:
- lib/types.ts            (add gain-weight goal + InflammationLevel + optional field)
- lib/engine.ts           (proteinTargetGrams, underweight + inflammation logic)
- lib/nutrition.ts        (gain-weight foods + inflammation food overrides)
- lib/verdict.ts          (gain-weight phrase)
- lib/slug.ts             (encode/decode the new optional field + goal)
- app/api/recommend/route.ts (validate new goal + optional inflammation)
- components/AssessmentForm.tsx (Gain weight option + inflammation control)
- components/VoiceInput.tsx (type-forced: exhaustive Record<keyof UserInput> label)
- agent_state/*           (trail)

Forbidden files:
- any other component, plugin, or lib file
- package.json / lock (no dependency change)

PRIMITIVE IMPACT (Commander-authorized):
- recommend() output INTENTIONALLY changes (unified protein number + new logic).
  The engine stays pure + synchronous + JSON-stable across calls on the same
  input. New optional fields keep every existing UserInput construction valid.

Deliverables:
- Same protein number on card, daily target, and 30-day plan.
- Elevated inflammation raises protein + adds omega-3 / anti-inflammatory foods.
- Underweight or gain-weight goal surfaces weight-gain support + no-peptides note.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus Judge-phase live evidence against the built server: POST the same input to
`/api/recommend` twice and assert byte-identical JSON (determinism), for a
legacy input AND a new inflammation/gain-weight input; and confirm the protein
number matches across the supplement card, daily target, and 30-day plan.

Parallel safe: false (shared engine).
Stop conditions: tsc/build non-zero; determinism check fails; forbidden file changed.
