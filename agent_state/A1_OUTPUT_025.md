# A1_OUTPUT_025

N_ID: N_025

Files changed:
- components/AssessmentForm.tsx — wrapped activity, sleep, diet, coffee, alcohol,
  symptom, and inflammation in a styled <details> "Fine-tune (optional)" block.
  No change to state, validation, units, payload, or submit. DEFAULTS already
  populate every collapsed field, so the essentials submit alone.
- components/Hero.tsx — "Answer nine questions" → "Answer a few quick questions".

Commands run:
- npx tsc --noEmit → exit 0
- npm run build → exit 0
- Live 390px assertion: #activityLevel (optional) NOT visible; #feet (core unit
  field) visible; #primaryGoal (core) visible → collapse correct AND visual
  tripwire intact.

Notes:
- Essentials always visible: voice quick-start, age, sex, units+height+weight,
  primary goal. Everything else is one tap away.
- No engine/route/data change; results unchanged for the same inputs.

Out-of-scope items noticed:
- Could persist the open/closed state, or auto-open Fine-tune when voice fills a
  collapsed field. Minor UX polish, not required.
