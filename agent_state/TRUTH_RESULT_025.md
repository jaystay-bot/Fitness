# TRUTH_RESULT_025

N_ID: N_025
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS

Evidence:
- tsc exit 0; build exit 0.
- Live 390px field-visibility assertion against the built server:
  activity(optional)=false, feet(core)=true, goal(core)=true. The non-essential
  fields collapse; the always-visible unit fields and goal remain, so
  tests/visual.spec.ts invariants (imperial fields visible by default) still hold.
- Screenshot saved: agent_state/screenshots/n025_minimal_form.png.

Watcher: verify-audit-trail recorded in SESSION_LOG. Only AssessmentForm.tsx and
Hero.tsx changed. Engine determinism + visual locked colors unaffected.
