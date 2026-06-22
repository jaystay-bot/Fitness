# S1_LOCKED_040

N_ID: N_040

Intent:
Curate The Wire so users see only GOOD research by default — Strong-tier
compounds and the ones with a curated study breakdown + model — and can click
"View others" to reveal the lighter-evidence rest. The daily "Today's read" is
always drawn from the good pool.

Definition of "good": tier === "Strong" OR has a curated StudyBreakdown (our
model + cited facts). Everything else is hidden behind an explicit toggle.

Scope / Allowed files:
- components/research/ResearchFeed.tsx
- agent_state/* (trail)

Forbidden files:
- everything else.

Deliverables:
- Default feed shows only good items; "View N more compounds (lighter evidence)"
  reveals the rest; Today's read is a good item.
- Build + typecheck green; screenshot.

Verify command:
```bash
npx tsc --noEmit && npm run build
```
Plus a screenshot of the curated default + the expanded "others".

Parallel safe: false (shared feed). Stop: tsc/build non-zero; forbidden edit.
