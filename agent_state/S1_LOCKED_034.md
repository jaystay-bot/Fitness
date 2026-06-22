# S1_LOCKED_034
N_ID: N_034
Intent: Fix /api/subscription 500 — it called Clerk auth() even when Clerk is not
configured (passthrough middleware), crashing on every result mount on
non-commercial/local deploys. Return free tier when Clerk is disabled.
Allowed files: app/api/subscription/route.ts ; agent_state/*
Forbidden: everything else.
Verify: `npx tsc --noEmit && npm run build` + live GET /api/subscription == 200.
Parallel safe: false (auth-adjacent). Stop: build non-zero.
