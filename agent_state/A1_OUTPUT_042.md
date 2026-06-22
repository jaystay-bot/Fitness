# A1_OUTPUT_042
N_ID: N_042
Files changed:
- README.md — rewritten as a case study (problem, differentiation, the pure
  deterministic `recommend()` engine story, The Wire live-PubMed feed, Pro
  clinical tools, stack table, layout table, run/build, demo mode, production
  config). Fixed the stale "no auth / no DB / no external APIs" contradiction.
- lib/subscription.ts — replaced the bare `return true` Pro bypass with a
  deliberate gate: `isProUser()` returns `tier === "pro"` unless
  `NEXT_PUBLIC_DEMO_MODE === "true"` (then all users get Pro for the demo).
- .env.example — documented NEXT_PUBLIC_DEMO_MODE.
- agent_state/QUEUE.md — updated the standing reminder (DEV MODE → DEMO_MODE,
  RESOLVED) with the Vercel operational note.
Commands run: tsc 0; build 0.
Notes: pure docs + a single deliberate entitlement gate; no engine/route/
component behavior change. OPERATIONAL: live Vercel deploy must set
NEXT_PUBLIC_DEMO_MODE=true to keep Pro features visible after this lands.
Out of scope (needs Commander go): publishing a clean `main`; removing the
process artifacts (agent_state/, *.pdf, 8HAT_SYSTEM.md, AGENTS.md) from the
tracked tree.
