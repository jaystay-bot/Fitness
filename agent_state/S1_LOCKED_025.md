# S1_LOCKED_025

N_ID: N_025

Intent:
Minimal-input mode. The mission is "least amount of information in." The form
asks ~12 questions; restructure so only the essentials are always visible and
the rest collapse into an optional "Fine-tune" section (defaults already exist
for every collapsed field, so the form submits with the essentials alone).

Essentials kept visible: voice quick-start, age, sex, units + height + weight,
primary goal. Collapsed (optional, defaulted): activity, sleep, diet, coffee,
alcohol, symptom, inflammation.

Scope:
- components/AssessmentForm.tsx — wrap the non-essential fields in a styled
  <details> "Fine-tune (optional)" block. No change to state, validation, units,
  payload, or submit logic; DEFAULTS already populate the collapsed fields.
- components/Hero.tsx — copy: "Answer nine questions" → "Answer a few quick
  questions" (honesty with the new minimal flow).

Allowed files:
- components/AssessmentForm.tsx
- components/Hero.tsx
- agent_state/* (trail)

Forbidden files:
- lib/** ; app/api/** ; any other component ; package.json/lock

Constraint — protect the visual tripwire:
The unit fields (#feet/#inches/#pounds and the metric #heightCm/#weightKg toggle)
MUST stay in the always-visible essentials so tests/visual.spec.ts invariants
still hold. Only activity/sleep/diet/coffee/alcohol/symptom/inflammation collapse.

Deliverables:
- Core form is short; advanced fields are one tap away and still submit by default.
- Build + typecheck green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus a screenshot of the collapsed (minimal) form state at 390px.

Parallel safe: false (shared form component).
Stop conditions: tsc/build non-zero; unit fields collapsed; forbidden file changed.
