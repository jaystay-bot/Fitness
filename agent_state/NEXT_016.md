# NEXT_016.md

**Proposed by:** Judge of N=015 **Date:** 2026-05-05 **Predecessors:** N=012 (signal stack), N=013 (audit-trail), N=014 (Apple Health), N=015 (Amazon action)

---

## INTENT

N=016 is the **third plugin integration** and the second **action plugin**: a basic **telehealth deep-link plugin**. Where Amazon (N=015) routed the user to a fulfillment URL on a third-party retailer, telehealth routes the user to a clinical-care booking surface (e.g., Sesame Care, Hims, Maven, Ro) when the recommendation surfaces a warning that requires clinician oversight (e.g., long-term zinc supplementation needing copper monitoring; high-iron supplementation in non-deficient men; melatonin use in users with sleep apnea risk factors; any supplement contraindicated against current medications).

Three objectives:

**A — Telehealth provider catalog + URL builder.**
A new `lib/plugins/telehealth/catalog.ts` maps recommendation **warning categories** (the strings emitted by `lib/engine.ts`'s `buildWarnings`) to an appropriate telehealth provider deep link. Each provider entry includes a name, a base URL, and a query template for pre-filling the booking subject. The URL builder is pure and deterministic, identical inputs always producing identical URLs. Reads `process.env.TELEHEALTH_DEFAULT_PROVIDER` at call time to select the active provider; falls back to a generic `https://www.sesamecare.com/` URL when unset.

**B — Plugin registration as third entry, second action variant.**
A new `lib/plugins/telehealth/index.ts` registers a `TelehealthPlugin` against the existing `ActionPluginNormalization` interface from N=015 (no contract change required). `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin]`. `getActivePlugins()` now returns three plugins in deterministic order. The N=014 + N=015 first/second entry invariants are preserved.

**C — Warning-card "Talk to a clinician" surface.**
A new `components/ClinicianButton.tsx` renders inside `ResultCard` next to each warning that maps to a telehealth-eligible category. On tap, opens the telehealth deep-link in a new tab using the same synchronous-`window.open` + deferred-redirect pattern as `FulfillButton`. POSTs a click event to a new `app/api/telehealth/click/route.ts` (additive Supabase migration `0005_telehealth_clicks.sql`). Fail-silently rule applies.

The user-facing change is one new clinician button per warning row that maps to a telehealth-eligible category. Users whose recommendations don't surface any of the mapped warnings see no change — those warnings render byte-identically to N=015.

## SCOPE BOUNDARY

Three new plugin files (`catalog.ts`, `index.ts`, `ClinicianButton.tsx`), one new API route, one additive Supabase migration. Surgical modifications to `pluginRegistry.ts` (third entry seed) and `ResultCard.tsx` (mount `<ClinicianButton>` next to each eligible warning). No changes to engine, signal-stack core, plugin contract, Apple Health plugin, Amazon plugin, or `UserInput` shape. No new dependencies. No actual telehealth bookings — the cycle ships deep-links only; OAuth and partner integrations are deferred.

## SUCCESS DEFINITION (Judge-binding for N=016)

- `getActivePlugins()` returns `[appleHealthPlugin, amazonPlugin, telehealthPlugin]` in that order; length 3.
- `mapWarningToTelehealthProvider(<known warning>)` returns the curated provider name; unmapped warnings return `null`.
- `generateTelehealthUrl(<warning>, <provider>)` returns a deep-link with the warning subject pre-filled where the provider supports it.
- `POST /api/telehealth/click { warningCategory, provider }` returns `200 { ok: true, url }` with optional Clerk userId capture.
- `<ClinicianButton>` renders next to each telehealth-eligible warning in the rendered `ResultCard`.
- All N=015 behaviors regress green — Amazon Fulfill button still renders, Apple Health upload card still mounts, recommend pipeline byte-identical.
- The N=013 `verify-audit-trail.sh` exits 0.
- The N=012 byte-identical engine regression still holds.

## CONSTRAINTS

- No engine modification.
- No `lib/pluginContract.ts` modification (the existing `ActionPluginNormalization` from N=015 covers this plugin).
- No `lib/types.ts` modification beyond adding a small `TelehealthClick` type at most (additive; UserInput shape stays frozen).
- No new runtime dependencies.
- No persistence to Supabase beyond the new `telehealth_clicks` table with anonymous-insert RLS.
- No partner OAuth, no actual booking execution, no PII beyond Clerk userId.
- Locked palette only.
- No changes to N=014 / N=015 plugin code or tests.

## HANDOFF

→ N=016 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_015.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_015.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_015.md`
  5. `agent_state/QUEUE.md` and `SESSION_LOG.md`
  6. `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`
  7. `lib/plugins/appleHealth/index.ts`, `lib/plugins/amazon/index.ts` (reference patterns)
  8. `components/ResultCard.tsx`, `components/FulfillButton.tsx` (mount + click pattern)
  9. `lib/types.ts`, `package.json`

If any file is missing, STOP and report.

The locked priority build order continues:
- N=016 — Basic telehealth plugin (this proposal)
- N=017 — Lab placeholder plugin
- N=018+ — Additional wearables (Whoop, Oura, Garmin)
