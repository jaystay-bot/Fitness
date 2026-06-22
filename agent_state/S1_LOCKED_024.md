# S1_LOCKED_024

N_ID: N_024

Intent:
Re-point the top-of-page messaging from the "Project Spear / un-insurance /
vault" narrative to the app's actual mission: minimal-input, evidence-backed
supplement + nutrition guidance. The insurance framing is what reads as
"misconstrued / saying the wrong thing." Content + presentation only; no engine,
data, route, or logic change.

Scope:
- Rewrite lib/spearCopy.ts to mission copy: hero eyebrow/headline/subhead, a
  "what you get" panel, a protocol-output preview (replacing the fabricated
  vault financials), thesis bullets + closer. Keep the SymptomEntry three-button
  keys and ASSESSMENT_FORM_ANCHOR.
- SpearHero.tsx: replace the insurance "You keep $2,400 / Traditional insurance
  $0" aside with the mission "what you get" panel. Remove the currency formatter.
- VaultDashboard.tsx: replace the fabricated "$2,400 vault balance / health
  score 87" cards + the funding disclosure with an honest preview of what the
  protocol produces. Remove the USD formatter.
- UninsuranceThesis.tsx: re-point bullets + closer + aria-label.
- app/page.tsx: re-point the openGraph/twitter metadata off the insurance copy.

Allowed files:
- lib/spearCopy.ts
- components/SpearHero.tsx
- components/VaultDashboard.tsx
- components/UninsuranceThesis.tsx
- app/page.tsx
- agent_state/* (trail + QUEUE standing-reminder update)

Forbidden files:
- lib/** except spearCopy.ts; any engine/data/route/other component
- package.json / lock

STANDING-REMINDER HANDLING (honesty-critical):
QUEUE flags the vault disclosure as mandatory *while vault funding claims are
shown* — removing it alone is a chargeback risk. This N removes the funding
CLAIMS themselves ($2,400 balance, "kept by you, not the insurer", health score),
so there is no funding promise left to disclose. Removing claims + disclosure
together is MORE honest, not less. The QUEUE reminder is updated to reflect that
the vault dashboard no longer makes a funding claim.

Deliverables:
- No insurance/vault financial claims remain in the rendered top-of-page.
- Top of page coherently describes the supplement/nutrition tool.
- Build + typecheck green; positioning banned-pattern scan clean.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus a banned-pattern grep (streak|unlock|achievement|level up|limited time|
people viewing|earn xp) over the changed files, and a screenshot of the new top.

Parallel safe: false (shared positioning copy).
Stop conditions: tsc/build non-zero; banned pattern present; forbidden file changed.
