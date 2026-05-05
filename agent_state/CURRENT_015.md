# CURRENT_015.md

**N:** 015 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=014 (PASS, merged via PR #23)

---

## INTENT

N=015 ships the **Amazon action plugin** — the second plugin to register against the locked N=012 Signal Stack contract, and the first **outbound action surface**. Where Apple Health (N=014) was a *signal* plugin (data flows IN to influence the recommendation), Amazon is an *action* plugin (the recommendation flows OUT into a fulfillment URL the user can click). The cycle proves the plugin contract works for both directions.

Three objectives:

**A — Amazon affiliate URL plugin.**
A pure deterministic generator (`lib/plugins/amazon/affiliateUrl.ts`) maps a supplement name + Amazon Associates tag to a search URL of the form `https://www.amazon.com/s?k=<encoded-name>&tag=<tag>`. The generator is side-effect free, identical inputs produce identical URLs, and it falls back to a tag-only Amazon search URL when the supplement name is empty. Wrapped in `lib/plugins/amazon/index.ts` as an `ActionPluginNormalization` implementation: `name: "amazon"`, `kind: "action"` discriminator, `generateActionUrl(supplementName) → string`.

**B — Plugin registry second entry, action variant.**
`lib/pluginRegistry.ts` is extended to hold a discriminated union of `PluginNormalization | ActionPluginNormalization`. The `registered` array is seeded with `[appleHealthPlugin, amazonPlugin]` so `getActivePlugins()` returns Apple Health as the first entry (preserved from N=014) and Amazon as the second. The locked plugin contract (`lib/pluginContract.ts`) stays FROZEN; the action variant lives in `lib/types.ts` per the architect contract. The signal-plugin compile-time test from N=012 (T7: missing fields produce `TS2739`) still holds because the discriminator narrows the union at construction time.

**C — Per-supplement Fulfill button + click logging.**
A new `components/FulfillButton.tsx` renders inside `ResultCard` on every supplement card. The button reads "Fulfill on Amazon" with a `lucide-react` `ExternalLink` icon and locked-palette styling. On tap, the button (1) opens a new tab via `window.open` synchronously to avoid popup-blocker issues, (2) `POST`s to the new `app/api/fulfillment/click/route.ts` with `{ supplementName }` plus an optional Clerk `userId`, (3) the route logs the click to a new `fulfillment_clicks` Supabase table (additive migration 0004), generates the affiliate URL server-side using `process.env.AMAZON_ASSOCIATES_TAG`, and returns `{ ok: true, url }`, (4) the client redirects the new tab to the returned URL. The route fails silently per the locked Plugin Layer rule: any DB failure still returns 200 with the URL so the affiliate redirect never breaks.

The user-facing change is exactly one new button per supplement card. Users who never tap it experience the result page byte-identical to N=014.

## SCOPE BOUNDARY

Five new files (URL generator, plugin index, FulfillButton component, click API route, migration). Four surgical modifications: `pluginRegistry.ts` (seed array + union type), `ResultCard.tsx` (mount button on each pick), `types.ts` (additive types), `.env.example` (AMAZON_ASSOCIATES_TAG placeholder). One additive Supabase migration (`0004_fulfillment_clicks.sql`). Zero new runtime dependencies. No engine modification. No Signal Stack core modification (`signalLayers`, `signalPriority`, `pluginContract` remain byte-identical). No cart-building. No OAuth. No purchase execution. No PII beyond the optional Clerk userId.

## SUCCESS DEFINITION

- `generateAmazonAffiliateUrl("Creatine monohydrate", "apex-protocol-20")` returns `https://www.amazon.com/s?k=Creatine+monohydrate&tag=apex-protocol-20` (or equivalent URLSearchParams-encoded variant).
- `generateAmazonAffiliateUrl("", tag)` falls back to a tag-only search URL.
- `getActivePlugins()` returns `[appleHealthPlugin, amazonPlugin]` in that order; length 2.
- `POST /api/fulfillment/click { supplementName: "Creatine monohydrate" }` returns `200 { ok: true, url }` and inserts a row into `fulfillment_clicks`.
- The same POST returns `200 { ok: true, url }` even when Supabase env is absent (fail-silently).
- `<FulfillButton>` renders inside every supplement article in `ResultCard`.
- Tapping the button opens a new tab and POSTs to the click endpoint.
- `recommend(input)` and `recommend(input, taggedInputs)` outputs are byte-identical to N=014 — the cycle does not touch the recommendation pipeline.
- The N=013 `verify-audit-trail.sh` exits 0 against this cycle's state files.

## CONSTRAINTS (Commander level)

- Engine purity preserved (`lib/engine.ts` byte-identical).
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- N=014 Apple Health plugin (`lib/plugins/appleHealth/*`) FROZEN. Its registration order in `pluginRegistry` is preserved as the first entry.
- Zero new runtime dependencies.
- One new Supabase table only: `fulfillment_clicks`.
- RLS enabled with anonymous-insert + service-role-select.
- Locked palette only.
- No PII persisted beyond the optional Clerk `userId`.
- The Stripe checkout flow from N=011 is untouched.
- The pricing tier copy / sticky CTA / InteractiveTimeline / Spear sections are untouched.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_015.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
