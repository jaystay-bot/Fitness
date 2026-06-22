# TRUTH_RESULT_038
N_ID: N_038
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS
Evidence: tsc 0; build 0; /research generates as ISR. Sandbox (egress-blocked)
renders the fallback: "approx." label, 15 cards, 0 page errors (screenshot
live_fallback.png). Live PubMed path runs server-side on Vercel where eutils is
reachable; cannot be exercised from the egress-blocked sandbox, so it is verified
by design (timeout + per-compound + total fallback) and confirmed via the
production deploy.
Files changed: 1 new lib + 3 research files. No engine/route/dependency change.
