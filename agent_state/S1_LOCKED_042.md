# S1_LOCKED_042

N_ID: N_042

Intent:
Portfolio-legibility pass. Make the repo and live link read as a polished,
professional product to a hiring manager / recruiter who spends ~90 seconds.
Two in-branch deliverables (a third, publishing a clean `main`, is gated on
Commander permission and NOT done here):

1. Rewrite README.md as a real case study — problem, what it does, the
   architecture story (deterministic pure `recommend(input)` engine,
   honesty/compliance constraints, live PubMed feed in The Wire), the stack,
   screenshots pointer, the live link, and run/build instructions. Fix the
   stale "no auth / no DB / no external APIs" contradiction (the app now has
   Clerk + Stripe + Supabase + Resend + a live PubMed integration).

2. Resolve the Pro-feature dev bypass deliberately: gate `isProUser()` behind
   an explicit `NEXT_PUBLIC_DEMO_MODE` flag instead of a bare `return true`.
   In demo mode every Pro feature is visible (good for a live portfolio demo);
   otherwise it falls back to the real `tier === "pro"` check. Clean code,
   no accidental-looking TODO.

Out of scope (needs Commander go): merging/publishing to `main`; deleting the
internal-process artifacts (agent_state/, *.pdf, 8HAT_SYSTEM.md, AGENTS.md)
from the tracked tree. Those stay on the working branch so the audit-trail
workflow keeps its memory; main is curated clean separately.

Scope / Allowed files:
- README.md
- lib/subscription.ts
- .env.example  (document NEXT_PUBLIC_DEMO_MODE)
- agent_state/* (trail)

Forbidden files:
- everything else. No engine/route/component behavior change beyond the gate.

Deliverables:
- Case-study README; DEMO_MODE-gated isProUser; build + typecheck green.

Verify command:
```bash
npx tsc --noEmit && npm run build
```

Parallel safe: false (shared subscription gate). Stop: tsc/build non-zero; forbidden edit.
