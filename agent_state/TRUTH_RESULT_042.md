# TRUTH_RESULT_042
N_ID: N_042
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS
Evidence: tsc 0; build 0. README.md is now a case study with the live link,
the deterministic-engine story, The Wire, the Pro tools, a stack table, and a
demo-mode section; the stale "no auth/no DB" line is gone. isProUser() is gated
on NEXT_PUBLIC_DEMO_MODE (real tier === "pro" check otherwise). .env.example and
the QUEUE standing reminder document the flag + the Vercel operational note.
Files changed: README.md, lib/subscription.ts, .env.example, agent_state/*.
Out of scope this N (gated on Commander): publish clean main; strip process
artifacts from the tracked tree.
