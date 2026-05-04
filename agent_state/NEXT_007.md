# NEXT_007.md

**Previous N:** 006 — PASS (launch-readiness commercial layer: Clerk auth + Stripe subscription + shareable URLs + email capture + pricing).

## N=007 — Pro feature unlock cycle

The four Pro features that `/pricing` advertises as **coming soon** must ship within two weeks of N=006's launch to honor the disclosure shown to paying users on day one:

1. **Account history with unlimited recommendations across visits** — store recommendation slugs (not raw inputs) keyed by `clerk_user_id` in a new `recommendation_history` table, additive to the schema. Render in `/account`.
2. **30-day protocol check-in** — magic-link flow that emails the user their original `/r/[slug]` after 30 days alongside one question: "did the engine's reasoning hold up?" Persists only the magic token, the original slug, and the response. Wire to the existing Resend integration.
3. **Clinician PDF export** — server-rendered PDF (using `@react-pdf/renderer` or similar) of the full ResultCard contents including PMID references, generated on demand at `/api/pdf?slug=<slug>`.
4. **Priority engine update notifications** — an opt-in flag on the user's row (`notify_engine_updates boolean default false`); send via Resend when the engine version bumps.

## Standing posture going forward

- Engine determinism (`recommend(input: UserInput): Recommendation` byte-identical for identical input) remains an inviolate invariant.
- Free experience must continue unchanged. New features are additive, gated via `<ProGate>`.
- Visual baseline test (`tests/visual.spec.ts`) and the positioning tripwire (no streaks, no scarcity, no gamification copy) remain part of the standard Judge phase.
- `subscriptions` is the master table; new persistence is additive only and cannot store user inputs or recommendations beyond slug references.

## Other QUEUE candidates (Commander to consider after N=007)

- Apify-based supplement price comparison.
- Wearable integration (Oura OAuth + Apple Health XML import) — would unlock measurably different recommendations for Pro users.
- Open-source release of the engine + supplement table + conflict logic under MIT license.
- WCAG 2.2 AAA accessibility remediation pass.
- Award-surface positioning packets (Webby, FastCo IxD, Communication Arts).
