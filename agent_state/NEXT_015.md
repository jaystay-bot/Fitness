# NEXT_015.md

**Proposed by:** Judge of N=014 **Date:** 2026-05-05 **Predecessors:** N=012 (signal stack), N=013 (audit-trail), N=014 (Apple Health plugin)

---

## INTENT

N=015 is the **second plugin integration** and the first one with an outbound action surface: an **Amazon action plugin**. Where Apple Health was a *read* surface (data flows IN to influence the recommendation), the Amazon plugin is the first *write* surface — it generates a one-tap shopping cart for the user's recommended supplements, with affiliate-attributed ASIN URLs.

Three objectives:

**A — Amazon ASIN catalog + URL builder.**
A new `lib/plugins/amazon/catalog.ts` maps the engine's canonical supplement ids (`creatine`, `vitamin-d3`, `magnesium-glycinate`, etc.) to a curated Amazon ASIN per supplement, prioritizing high-evidence brands (Thorne, Pure Encapsulations, Klean Athlete, NOW, Nordic Naturals where applicable). A pure URL builder generates the cart-deep-link in the form `https://www.amazon.com/dp/<ASIN>?tag=<AFFILIATE_TAG>` reading `process.env.AMAZON_AFFILIATE_TAG` (defaulting to no tag in dev / unconfigured environments).

**B — Plugin registration + outbound contract.**
A new `lib/plugins/amazon/index.ts` registers an `AmazonActionPlugin` against the existing `PluginNormalization` interface. Per the contract this cycle locks: the `normalize()` method emits zero `TaggedUserInput` entries (Amazon is action-only, not signal-providing); the plugin's value comes from a NEW outbound surface — `buildCart(picks: SupplementPick[]): AmazonCart` — that converts a recommendation into shoppable links. This requires an additive extension to `PluginNormalization` (or a sibling interface `PluginAction`) — to be specified in S1_LOCKED_015.

**C — Result-card "Buy this stack" surface.**
A new `components/AmazonCartButton.tsx` renders inside `ResultCard` as a Pro-feature-style row (DEV MODE makes it visible to everyone). On tap, it calls the Amazon plugin's `buildCart`, opens the resulting Amazon URL in a new tab. Non-affiliated environments still get working links — the affiliate tag is purely additive.

## SCOPE BOUNDARY

Two new plugin files (`catalog.ts`, `index.ts`), one new component, surgical extension to `pluginContract.ts` (or a new sibling contract module — TBD by Architect). No new dependencies. No persistence. No checkout flow on our domain — Amazon is the cart owner. Engine, signal-stack core, Apple Health plugin, and recommendation pipeline FROZEN.

## SUCCESS DEFINITION (Judge-binding for N=015)

- The Amazon plugin registers against the registry and `getActivePlugins()` returns 2 plugins (apple-health + amazon).
- Each canonical supplement id has a curated ASIN; missing-ASIN supplements gracefully skip the cart row.
- `buildCart(picks)` returns a `{ url: string, items: AmazonCartItem[] }` with a deep link tagged when `AMAZON_AFFILIATE_TAG` is set, untagged otherwise.
- `AmazonCartButton` renders inside `ResultCard` and links to the built cart.
- All N=014 behaviors pass as regression. The N=013 audit-trail verify script exits 0.
- The N=012 byte-identical engine regression still holds.

## CONSTRAINTS

- No engine modification.
- No `lib/types.ts` modification (UserInput shape stays frozen).
- No new runtime dependency.
- No persistence to Supabase, no analytics tracking on the click.
- Affiliate tag is opt-in via env var; the product still ships if the env var is missing.
- Locked palette only.

## HANDOFF

→ N=015 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_014.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_014.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_014.md`
  5. `agent_state/QUEUE.md` and `SESSION_LOG.md`
  6. `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`, `lib/plugins/appleHealth/index.ts`
  7. `components/ResultCard.tsx` (the integration target)
  8. `lib/types.ts`, `package.json`

If any file is missing, STOP and report.

The locked priority build order continues:
- N=015 — Amazon action plugin (this proposal)
- N=016 — Basic telehealth plugin
- N=017 — Lab placeholder plugin
- N=018+ — Additional wearables (Whoop, Oura, …)
