# CURRENT_008.md

**N:** 008 **Hat:** COMMANDER (Jay) **Date:** 2026-05-04 **Status:** ACTIVE **Predecessor:** N=007 PASS

---

## INTENT

N=008 ships three additional interactive features and temporarily disables Pro tier gating for development and testing purposes. The features are: a voice-reactive protocol generation flow using browser-native Web Speech API for hands-free input, a generative anatomical stack visualization rendering each supplement as a labeled SVG element mapped to its target body system, and an enhanced interactive timeline that expands on the N=007 timeline projection with hoverable daily details, filterable by supplement, and a play-through animation showing the thirty-day cumulative effect curve. Pro tier gating is disabled by modifying only the `isProUser` evaluation function in `lib/subscription.ts` to return `true` unconditionally during development. The subscription infrastructure, the database tables, the Stripe integration, and the `<ProGate>` component code all remain unchanged so the gating can be re-enabled in a future cycle by reverting a single function. The free recommendation experience is unchanged for users who do not interact with the new features.

## SCOPE BOUNDARY

Three additive interactive features (`VoiceInput`, `BodyVisualization`, `InteractiveTimeline`) plus one surgical line change in `lib/subscription.ts`. No engine changes. No new dependencies. No database migration. No analytics. No payment-flow modifications.

## SUCCESS DEFINITION

- Anonymous user (no Clerk, no Stripe) can complete the form by voice, see a body-systems visualization in the result, and explore the interactive timeline — all without signing in.
- A standard form submission still works and produces the same recommendation as N=007.
- The `isProUser` function carries the mandatory `DEV MODE` comment block so the temporary nature of the gate relaxation is visible in code review.
- Re-enabling Pro gating is a one-function revert.

## CONSTRAINTS (Commander level)

- Engine, supplement table, conflict logic, variation, confidence, units, slug, timeline data — all frozen.
- All N=001..N=007 API routes frozen.
- Tailwind config, globals.css, postcss config — all frozen.
- No new dependencies. Web Speech API is browser-native; SVG is pure markup.
- The `DEV MODE` comment block is mandatory and reverting the function is a one-edit operation.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_008.md`. Prior locked contracts remain binding except the explicit one-function gate relaxation.
