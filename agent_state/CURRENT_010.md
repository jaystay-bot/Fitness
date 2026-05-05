# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash 89780428988132cc3d6c02954d54fc7685c5a513 on 2026-05-04.

---

# CURRENT_010.md

**N:** 010 **Hat:** COMMANDER (reconstructed) **Date:** 2026-05-04 **Status:** PASS (post-hoc)

---

## INTENT

Hotfix for Clerk middleware public-route gap discovered immediately after N=009 merged.

**Root cause:** Clerk's `auth().protect()` returns HTTP 404 (not 401) for unauthenticated API routes. The `UpgradeButton` component only handles 401 responses, so checkout was silently failing — the button appeared to do nothing for logged-out users because the middleware intercepted the request with a 404 before the route's own 401 guard could fire.

**Fix:** Add `/api/checkout` and `/api/subscription` to the middleware public routes list so Clerk passes requests through. Both routes perform their own auth check and return 401 correctly. The middleware does not need to protect them.

## DELIVERABLE FOR THIS N

Single-file middleware.ts patch: two public-route entries added to the Clerk matcher.

## CONSTRAINTS

All files other than `middleware.ts` are frozen.

## SUCCESS DEFINITION

Anonymous user clicking the Upgrade button receives a 401 from the route's own guard rather than a silent 404 from middleware. Authenticated user proceeds to Stripe Checkout normally.

## HANDOFF

→ N=011 pricing page overhaul to 3-tier structure.
