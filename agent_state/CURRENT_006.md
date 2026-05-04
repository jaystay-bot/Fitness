# CURRENT_006.md

**N:** 006 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=005 PASS

---

## INTENT

N=006 ships the launch-readiness commercial layer. Six atomic additions: (1) shareable result page at `/r/[slug]` reconstructing the recommendation from the URL with no database lookup; (2) Clerk email-only sign-up and sign-in (no social providers, no passwords beyond Clerk's defaults); (3) Stripe Checkout integration for $5/month or $48/year subscription; (4) minimal Supabase table storing only user identifier, subscription status, period end, and Stripe customer reference; (5) post-result email capture that sends a confirmation email containing the user's shareable result link; (6) `/pricing` page with clear tier comparison and a Pro gate component that wraps future Pro features. The free recommendation experience is unchanged. Account creation and payment are both optional. The product is fully usable with zero sign-up. This cycle prepares the product for paying users while preserving the current zero-friction first-time experience.

## SCOPE BOUNDARY

Six atomic additions. No seventh feature. The 30-day check-in, clinician PDF export, and account history are deferred to N=007 and labeled "coming soon" on `/pricing`. This labeling is ethically required so paying day-one users are not misled.

## SUCCESS DEFINITION

- Anonymous user can complete the form and see a recommendation without ever signing in.
- After submission, `window.location.pathname` matches `/^\/r\/[A-Za-z0-9_-]+$/`.
- `/r/<slug>` renders the same recommendation in any session, including when opened in a new browser.
- Sign-up via Clerk creates a `subscriptions` row with `tier='free'`.
- Stripe checkout returns a session URL for an authenticated user.
- Stripe webhook upgrades a row to `tier='pro'`.
- `/pricing` lists only currently-shipped Pro features without "coming soon"; everything not yet shipped is explicitly labeled.

## CONSTRAINTS (Commander level)

- Engine, supplements, conflicts, variation, confidence, units modules are **frozen**. No LLM additions, no engine retraining.
- One Supabase table only: `subscriptions`. No user inputs or recommendations stored server-side.
- Email-only authentication. No social providers.
- Webhooks must verify signatures (Stripe and Clerk).
- "Coming soon" labels are mandatory on `/pricing` for any feature not in this cycle's PR.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_006.md`. Prior locked contracts remain binding.
