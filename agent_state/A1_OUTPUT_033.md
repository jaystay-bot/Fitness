# A1_OUTPUT_033

N_ID: N_033

Files changed:
- middleware.ts — added to isPublicRoute: "/shop", "/api/fulfillment/click",
  "/api/plugins/(.*)". These must work for anonymous users; previously
  clerkMiddleware().protect() would gate them on deploys with Clerk keys set.

Commands run:
- npx tsc --noEmit → 0 ; npm run build → 0

Notes:
- No behavior change on deploys without Clerk keys (middleware passthrough).
- Does NOT address a Vercel Deployment Protection 403 (platform setting).
