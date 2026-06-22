# NEXT_021.md

**Proposed by:** Judge of N=020 **Date:** 2026-06-22

## INTENT

Mission logic — the core of Jay's request. Two evidence-based additions plus one
correctness fix, all in the deterministic engine:

1. **Unify the protein target.** Today `engine.ts` computes protein three ways
   (`×1.6` on the supplement card, `×1.4`/`×1.8` in daily targets, `×1.4` in the
   30-day plan). On screen these disagree — a direct cause of the "misconstrued"
   complaint. Replace with one `proteinTargetGrams(input)` used everywhere.

2. **Inflammation-aware protein + anti-inflammatory emphasis.** Add optional
   `inflammation: "unknown" | "low" | "elevated" | "high"` to UserInput. Elevated
   /high raises the protein target and ensures omega-3 + anti-inflammatory foods.

3. **Underweight → healthy weight gain (NO peptides).** Add a `gain-weight`
   primary goal AND auto-detect BMI < 18.5 to surface a whole-food calorie
   surplus + creatine/protein support, with an explicit "food-first, no peptides
   or hormones" warning.

## SCOPE (Architect will lock)

Allowed files: lib/types.ts, lib/engine.ts, lib/nutrition.ts, lib/verdict.ts,
lib/slug.ts, app/api/recommend/route.ts, components/AssessmentForm.tsx (new
inflammation + gain-weight controls). New optional fields must keep every
existing UserInput construction site valid.

## PRIMITIVE IMPACT (Commander-authorized)

This INTENTIONALLY changes engine output, so the byte-identical engine
regression baseline (`scripts/verify-audit-trail.sh`) must be **re-frozen** to
the new deterministic output, not bypassed. The engine stays pure + synchronous.

Verify command: `npx tsc --noEmit && npm run build` plus a fixture assertion
that `recommend()` is still JSON-stable across two calls on the same input.

## AFTER N=021

- N=022 — Minimal-input mode (fewest questions).
- N=023 — Real PubMed study counts (build-time fetch script).
