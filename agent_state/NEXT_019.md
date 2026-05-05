# NEXT_019.md

**Proposed by:** Judge of N=018 **Date:** 2026-05-05 **Predecessors:** N=012, N=013, N=014 (Apple Health), N=015 (Amazon), N=016 (telehealth), N=017 (lab placeholder), N=018 (Apple Health bug fix + Whoop)

---

## INTENT

N=019 is the **sixth plugin integration** and the **fourth signal plugin**: an **Oura wearable plugin**. With Apple Health (N=014), Whoop (N=018), and now Oura, the wearable layer of the Signal Stack is fully populated by three independent plugins — completing the wearable expansion before the locked priority build order moves to layer additions or revenue surfaces.

Oura is selected over Garmin / Fitbit for the third wearable because Oura's API has the cleanest documentation, the most stable token-based auth flow, and the strongest signal density for the metrics that matter to the engine: sleep score, readiness, HRV. Like Whoop, Oura is paste-the-token only this cycle; full OAuth is deferred.

Three objectives:

**A — Oura sleep + readiness normalizer.**
A pure deterministic normalizer (`lib/plugins/oura/normalizer.ts`) maps Oura's `/v2/usercollection/daily_sleep` and `/v2/usercollection/daily_readiness` endpoints into `TaggedUserInput[]` at the wearable layer:
- `daily_sleep.score < 60` (poor sleep, sustained over 7+ days) → `symptomToFix: "poor-sleep"`, confidence 0.85.
- `daily_readiness.score < 60` (low readiness) → `symptomToFix: "fatigue"`, confidence 0.85.
- `daily_sleep.contributors.total_sleep` averaged 7 days, converted to hours → `sleepHours` clamped to [3, 12], confidence 0.85.

**B — Honest connection state pattern (mandatory).**
Per the standard locked in N=018: Oura's `OuraConnect` component MUST gate "Connected" on `tagged.length > 0`. Empty / invalid / network-failure paths render distinct states with `AlertCircle` icons in clinical orange, mirroring `AppleHealthUpload` and `WhoopConnect`. This pattern is binding for ALL future plugin connection UIs.

**C — Plugin registration as sixth entry, fourth signal variant.**
`lib/plugins/oura/index.ts` registers an `OuraPlugin` against the existing `PluginNormalization` interface. `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin, whoopPlugin, ouraPlugin]`. The N=014 / N=015 / N=016 / N=017 / N=018 first-five-entry invariants are preserved.

## SCOPE BOUNDARY

Three new plugin files (`tokenAuth.ts`, `normalizer.ts`, `index.ts`), one new component (`OuraConnect.tsx`), one new API route (`app/api/plugins/oura/route.ts`). Surgical modifications to `pluginRegistry.ts` and `AssessmentForm.tsx`. No new dependencies. No persistence. No engine modification. No Signal Stack core modification.

## SUCCESS DEFINITION (Judge-binding for N=019)

- `getActivePlugins()` returns 6 plugins in order `[apple-health, amazon, telehealth, lab-placeholder, whoop, oura]`.
- `validateOuraToken("")` and `validateOuraToken("malformed")` return invalid with helpful error.
- `normalizeOuraMetrics(<sample>)` produces the expected `TaggedUserInput[]` at wearable layer.
- `<OuraConnect>` renders BELOW `<WhoopConnect>` on the assessment form.
- Honest connection state: empty/invalid responses render distinct AlertCircle states.
- All N=018 behaviors regress green.
- The N=013 `verify-audit-trail.sh` exits 0.
- The N=012 byte-identical engine regression still holds.
- Three wearable plugins (Apple Health + Whoop + Oura) coexist in the registry.

## CONSTRAINTS

- No engine modification.
- No `lib/pluginContract.ts` modification.
- No `lib/types.ts` modification beyond optional additive types.
- No new runtime dependencies.
- No persistence.
- Locked palette only.
- Honest connection state — no false-Connected on any path.
- No changes to N=014–N=018 plugin code.

## HANDOFF

→ N=019 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_018.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_018.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_018.md`
  5. `agent_state/QUEUE.md` and `SESSION_LOG.md`
  6. `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`
  7. `lib/plugins/whoop/{tokenAuth,normalizer,index}.ts` (closest reference pattern)
  8. `components/WhoopConnect.tsx` (honest connection state pattern — Oura must mirror)
  9. `components/AssessmentForm.tsx` (mount + concatenate pattern)
  10. `lib/types.ts`, `package.json`

The locked priority build order continues:
- N=019 — Oura wearable plugin (this proposal) — completes the wearable layer expansion
- N=020 — optional Garmin or Fitbit OR begin layer additions / revenue work
- N=021+ — Real LabCorp / Quest API integration with HIPAA review, Amazon partner approval, real telehealth API
