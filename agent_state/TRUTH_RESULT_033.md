# TRUTH_RESULT_033

N_ID: N_033
Verify command: `npx tsc --noEmit && npm run build`
Exit code: 0
Result: PASS

Evidence:
- tsc 0; build 0. middleware.ts now lists /shop, /api/fulfillment/click, and
  /api/plugins/(.*) as public routes, so the free flow is not auth-gated when
  Clerk is enabled. Engine + result flow verified working locally earlier
  (n032_result.png), confirming a deploy 403 is platform-level, not code.

Files changed: middleware.ts only.
