# CURRENT_016.md

**N:** 016 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=015 (PASS, merged via PR #24)

---

## INTENT

N=016 ships the **telehealth deep-link plugin** — the third plugin to register against the locked Plugin Layer contract from N=012, and the **second action plugin** (after Amazon, N=015). The cycle proves the contract supports multiple action surfaces simultaneously and satisfies the Project Spear escalation-path requirement: the product must always offer a route to a real clinician when the engine flags a stop condition or escalation indicator.

Three objectives:

**A — Deep-link generator + plugin.**
A pure deterministic generator (`lib/plugins/telehealth/deepLink.ts`) maps the recommendation context (any goal conflict, any clinician-oversight supplement) to a deep-link URL on the configured telehealth provider's landing page. The URL appends a `?reason=…` query parameter naming the category (`goal-conflict`, `medical-clearance`, `clinician-oversight-supplement`) so the provider's landing page can surface the right intake. Wrapped in `lib/plugins/telehealth/index.ts` as an `ActionPluginNormalization` implementation: `name: "telehealth"`, `kind: "action"`, `generateActionUrl(_)` returns the deep-link, `shouldRender(rec)` returns true only when escalation is warranted.

**B — Plugin registry third entry, second action variant.**
`lib/pluginRegistry.ts` widens the `registered` array to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin]`. The N=014 first-entry and N=015 second-entry invariants are preserved. The locked plugin contract (`lib/pluginContract.ts`) stays FROZEN; the telehealth plugin reuses the existing `ActionPluginNormalization` interface from N=015 and an additive optional `shouldRender?` method on that interface (declared in `lib/types.ts`, the file in the modify-allowed list).

**C — Conservative escalation button + click logging.**
A new `components/SpeakToDoctorButton.tsx` renders inside `ResultCard` ABOVE the supplement list when `telehealthPlugin.shouldRender(result)` returns true. The button uses the locked clinical-orange color (`#FF6B35`) to distinguish it from the lime Amazon Fulfill button — clinical action vs. commerce action. On tap, the button (1) opens a new tab synchronously to avoid popup blockers, (2) `POST`s `{ pluginName: "telehealth" }` to the existing `/api/fulfillment/click` route, (3) the route dispatches on `pluginName`: telehealth → calls `telehealthPlugin.generateActionUrl()` reading `process.env.TELEHEALTH_PROVIDER_URL`; amazon (default) → calls `amazonPlugin.generateActionUrl(supplementName)`, (4) the route logs the click to the existing `fulfillment_clicks` table extended with a new `plugin_name` column (additive migration `0005_fulfillment_clicks_plugin_name.sql`), (5) the client redirects the new tab to the returned URL.

The button is conservative by design: routine recommendations (no goal conflict, no clinician-oversight supplement) never see the button. The product never replaces a clinician — it simply offers a route to one when warranted.

## SCOPE BOUNDARY

Four new files (deepLink generator, plugin index, SpeakToDoctorButton, migration 0005). Five surgical modifications: `pluginRegistry.ts` (third entry seed + union widen), `ResultCard.tsx` (conditional mount above stack), `app/api/fulfillment/click/route.ts` (additive dispatch on `pluginName`), `lib/types.ts` (additive `TelehealthDeepLink` type + `plugin_name` extension to `FulfillmentClick` + optional `shouldRender?` on `ActionPluginNormalization`), `.env.example` (TELEHEALTH_PROVIDER_URL placeholder). One additive Supabase column. Zero new runtime dependencies. No engine modification. No Signal Stack core modification. No N=014 (Apple Health) or N=015 (Amazon) plugin code modification.

## SUCCESS DEFINITION

- `generateTelehealthDeepLink(rec, providerUrl)` is pure and deterministic; identical inputs produce identical URLs.
- `getActivePlugins()` returns `[appleHealthPlugin, amazonPlugin, telehealthPlugin]` in that order; length 3.
- `telehealthPlugin.shouldRender(rec)` returns true when `rec.goalConflict !== null` OR a supplement requiring clinician oversight (iron, melatonin) is in the stack; false otherwise.
- `<SpeakToDoctorButton>` renders inside `ResultCard` above the stack section iff `shouldRender(rec)` is true.
- `POST /api/fulfillment/click { pluginName: "telehealth" }` returns `200 { ok: true, url }` with the URL containing the configured provider host (or the generic fallback when env unset).
- `POST /api/fulfillment/click { supplementName, pluginName: "amazon" }` and `POST /api/fulfillment/click { supplementName }` (no `pluginName`) both behave identically to N=015 — backward compatibility preserved.
- Migration 0005 adds `plugin_name text NOT NULL DEFAULT 'amazon'` so existing rows are correctly classified.
- `recommend(input)` and `recommend(input, taggedInputs)` outputs are byte-identical to N=015 — the cycle does not touch the recommendation pipeline.
- N=013 `verify-audit-trail.sh` exits 0.
- N=014 / N=015 regressions intact (Apple Health upload card, Amazon Fulfill button on each pick).

## CONSTRAINTS (Commander level)

- Engine purity preserved (`lib/engine.ts` byte-identical).
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- N=014 Apple Health plugin (`lib/plugins/appleHealth/*`) FROZEN.
- N=015 Amazon plugin (`lib/plugins/amazon/*`) FROZEN. The `FulfillButton` component is FROZEN.
- Zero new runtime dependencies.
- One additive Supabase column on the existing table; no new tables.
- Locked palette only — clinical-orange usage on the button is permitted because it is already in the palette.
- No medical-advice copy. The button reads "Speak to a doctor" — a routing action, not a clinical claim.
- No chatbot or AI-assistant framing.
- No telehealth API integration. No patient data transmission. The user lands on the provider's landing page where they complete intake themselves.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_016.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
