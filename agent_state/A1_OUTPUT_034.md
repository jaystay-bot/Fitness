# A1_OUTPUT_034
N_ID: N_034
Files changed:
- app/api/subscription/route.ts — guard with CLERK_ENABLED; return {tier:"free"}
  when Clerk keys are absent (auth() would otherwise throw → 500).
Commands run: tsc 0; build 0; live GET /api/subscription → 200 {"tier":"free"}.
Evidence: full-page result capture (v_result_clean.png) shows 0 5xx responses;
the whole result flow renders (verdict, 3D bottle, body map, stack + where-to-buy,
timeline chart, nutrition, plan, warnings).
Notes: behavior unchanged on deploys WITH Clerk keys. Console 404 seen earlier is
favicon-class, not app logic.
