# RECONSTRUCTED FROM GIT HISTORY
# This cycle did not run through the full six-hat loop. State reconstructed post-hoc from commit hash 89780428988132cc3d6c02954d54fc7685c5a513 on 2026-05-04.

---

# A1_OUTPUT_010.md

**N:** 010 **Commit:** 89780428988132cc3d6c02954d54fc7685c5a513 **Date:** 2026-05-04 14:29:28 -0400

---

## FILES CHANGED

| File | Change |
|------|--------|
| middleware.ts | +2 lines — `/api/checkout` and `/api/subscription` added to public route matcher |

**Total:** 1 file changed, 2 insertions(+)

## COMMIT MESSAGE

```
fix: add /api/checkout and /api/subscription to public routes

Clerk auth().protect() returns 404 (not 401) for unauthenticated API
routes. UpgradeButton only handles 401, so checkout was silently failing.
Both routes do their own auth check and return 401 correctly — the
middleware just needs to pass them through.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
```

## NEW DEPENDENCIES

None.

## NEW FILES

None.
