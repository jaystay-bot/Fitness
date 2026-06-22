# S1_LOCKED_033

N_ID: N_033

Intent:
Fix auth-gating gaps that can 403 the free experience on deploys where Clerk is
enabled. The /shop page and the anonymous fulfillment-click endpoint are not in
the middleware public-route list, so clerkMiddleware().protect() blocks them.
Add them (and the plugin signal routes, which must work for anonymous users).

Scope / Allowed files:
- middleware.ts
- agent_state/* (trail)

Forbidden files:
- everything else.

Deliverables:
- /shop, /api/fulfillment/click, and /api/plugins/(.*) are public routes.
- Build + typecheck green.

Note: This does NOT change behavior on deploys without Clerk keys (middleware is
a passthrough there). It also does not fix a Vercel *Deployment Protection* 403,
which is a platform setting, not code — flagged to Commander separately.

Verify command:
```bash
npx tsc --noEmit && npm run build
```

Parallel safe: false (auth/middleware — never parallelize). Stop: tsc/build non-zero.
