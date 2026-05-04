# NEXT_009.md

**Previous N:** 008 — PASS (interactive expansion: voice input + body visualization + interactive timeline + DEV MODE gate relaxation).

## N=009 — Two parallel tracks for Commander to choose between

### Track A — Re-enable Pro gating with Stripe test-mode validation

The N=008 `DEV MODE` block on `isProUser` is intentional and temporary. Re-enabling production gating is a one-function revert. The cycle should:

1. Revert `isProUser` to `tier === "pro"` and remove the `DEV MODE` block.
2. Configure Stripe **test mode** keys in CI / preview deployments so the checkout flow can be exercised without live commerce.
3. Add a Playwright e2e that walks an anonymous user through `/pricing` → `/sign-in` (Clerk test mode) → `/api/checkout` → Stripe test card → success → `/account?upgraded=true` → row updated to `tier='pro'` in the test Supabase project → ResultCard renders the Pro features.
4. Validate the Clerk webhook end-to-end against a real test Clerk project (creates the row at sign-up).

This unblocks live commerce and removes the most visible "do not ship" marker in the codebase.

### Track B — Two more interactive features

If Track A is not yet ready (Stripe / Clerk test infra not configured), pick two from this short list:

- **Practitioner annotation layer** (B2B addition; from the prior `NEXT_008.md`). Multi-tenant role system; annotations on `/r/[slug]`. Adds at least one new table.
- **Wearable integration** (Pro-only). Oura OAuth + Apple Health XML import. Replaces self-reported sleep / activity / RHR with measured values, then re-runs the engine.
- **30-day check-in flow** (the remaining "coming soon" Pro feature). Magic-link landing that renders the original recommendation alongside one question — "did the engine's reasoning hold up?"
- **Open-source release** of the engine + supplement table + conflict logic under MIT license (mostly a packaging cycle; low risk).

## Standing posture (still binding)

- Engine determinism, free-tier preservation, no-raw-file-storage (N=007), locked palette, locked typography, locked positioning tripwire — all non-negotiable.
- The `/api/recommend` route, `lib/supplements.ts`, `lib/conflicts.ts`, the locked palette/typography are inviolate.
- The `DEV MODE` comment block in `lib/subscription.ts` is the visible reminder that Pro gating must be re-enabled before commercial launch.
