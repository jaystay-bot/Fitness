# CURRENT_004.md

**N:** 004 **Hat:** COMMANDER (Jay) **Date:** 2026-05-03 **Status:** ACTIVE **Predecessor:** N=003 PASS

---

## INTENT

N=004 inserts a US-first unit-system toggle into the Assessment Form. Default state is imperial (feet, inches, pounds). User can toggle to metric (centimeters, kilograms) with a single click. Conversion happens at the form boundary; the engine continues to receive `heightCm` and `weightKg` unchanged. No persistence — toggle resets on reload to maintain zero-storage architecture. The previously planned distribution + trust layer remains queued as N=005. Scope is strictly: toggle component, conversion logic, two new screenshot tests proving both modes render correctly.

## SCOPE BOUNDARY

- New: `components/UnitToggle.tsx`, `lib/units.ts`.
- Modified: `components/AssessmentForm.tsx`, `tests/visual.spec.ts`.
- Frozen: everything else, including `lib/engine.ts`, `lib/types.ts`, `app/api/recommend/route.ts`, all other components, all configs, `package.json`.

The engine NEVER sees imperial values. Conversion at the form boundary only.

## SUCCESS DEFINITION

- First page load shows three inputs (FT, IN, LB) and the FT/LB toggle active.
- One click on CM/KG flips to two inputs (CM, KG); inputs preserve the user's current entry via conversion.
- Submitting in imperial mode sends `heightCm=178`, `weightKg=82` for `5'10"` and `180 lb`.
- Visual baseline test from N=003 still passes (palette + typography unchanged).
- No `localStorage`, `sessionStorage`, or cookies introduced.

## CONSTRAINTS (Commander level)

- Zero new dependencies. No test framework adds.
- Distribution + trust layer (`/r/[slug]`, `SourcesPanel`, `EmailCapture`, `/api/subscribe`) remains queued as N=005; do not pull forward.
- Locked palette and typography stand.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_004.md`. Prior locked contracts remain binding.
