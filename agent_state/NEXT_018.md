# NEXT_018.md

**Proposed by:** Judge of N=017 **Date:** 2026-05-05 **Predecessors:** N=012, N=013, N=014 (Apple Health), N=015 (Amazon), N=016 (telehealth), N=017 (lab placeholder)

---

## INTENT

N=018 is the **fifth plugin integration** and the **third signal plugin**: a **Whoop wearable plugin**. Where Apple Health emitted aggregate behavior-derived signals (steps → activityLevel, sleep → sleepHours, restingHR → activityLevel), Whoop emits **strain + recovery** signals derived from continuous-wear band measurement — a richer wearable surface than Apple Health's mostly-passive iOS Health export.

The plugin operates as **paste-the-token** in this cycle (no OAuth callback infrastructure yet). The user copies a Whoop personal access token from the developer dashboard into a textarea on the assessment form. The plugin server-side fetches the last 30 days of daily-summary data on submit. Real OAuth + automatic refresh + multi-day polling are deferred to a later cycle.

Three objectives:

**A — Whoop daily-summary normalizer.**
A pure deterministic normalizer (`lib/plugins/whoop/normalizer.ts`) maps Whoop's `/v1/cycle` and `/v1/recovery` daily-summary payloads to `TaggedUserInput[]` at the wearable layer:
- `recovery.recovery_score < 40` (red recovery, sustained over 7+ days) → `symptomToFix: "fatigue"`, confidence 0.85.
- `cycle.strain >= 18` averaged over 7 days → `activityLevel: "high"`, confidence 0.85.
- `recovery.hrv_rmssd_milli` consistently low → additive fatigue signal.

**B — Plugin registration as fifth entry, third signal variant.**
`lib/plugins/whoop/index.ts` registers a `WhoopPlugin` against the existing `PluginNormalization<TRaw>` interface with `TRaw` set to the daily-summary array shape. `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin, whoopPlugin]`. The N=014/N=015/N=016/N=017 first-four-entry invariants are preserved.

**C — Whoop token-paste card.**
A new `components/WhoopConnect.tsx` mounts on the assessment form between `LabValuesEntry` and the form fields. The user pastes their Whoop personal access token; the card POSTs `{ token }` to `app/api/plugins/whoop/route.ts`, which calls Whoop's API server-side, parses the daily summaries through the normalizer, and returns `TaggedUserInput[]`. The card flips to a "Connected" state showing the user's 7-day strain / recovery / sleep numbers.

## SCOPE BOUNDARY

Three new plugin files (`whoopApi.ts` for the API client, `normalizer.ts`, `index.ts`), one new component (`WhoopConnect.tsx`), one new API route. Surgical modifications to `pluginRegistry.ts` and `AssessmentForm.tsx`. **Optionally** one new runtime dependency for the API client (prefer plain `fetch` if possible — Whoop's API is small enough for a hand-written client).

## SUCCESS DEFINITION (Judge-binding for N=018)

- `getActivePlugins()` returns 5 plugins in order `[apple-health, amazon, telehealth, lab-placeholder, whoop]`.
- `normalizeWhoopRecovery(<sample API payload>)` produces the expected `TaggedUserInput[]` at wearable layer.
- `POST /api/plugins/whoop { token }` with a valid token returns `200 { tagged, summary }`.
- Invalid / expired / missing token → `200 { tagged: [], summary: {}, error: "..." }` (fail-silently — the user's redirect from the assessment form must not break on upstream auth issues).
- `<WhoopConnect>` renders BELOW `<LabValuesEntry>` on the assessment form.
- All N=017 behaviors regress green: lab placeholder still renders, Apple Health still renders, Amazon FulfillButton on each pick, telehealth conditional rendering, `recommend(input)` byte-identical without Whoop tagged inputs.
- The N=013 `verify-audit-trail.sh` exits 0.
- The N=012 byte-identical engine regression still holds.

## CONSTRAINTS

- No engine modification.
- No `lib/pluginContract.ts` modification (existing `PluginNormalization` from N=012 covers signal plugins).
- No `lib/types.ts` modification beyond optional additive types (e.g., `WhoopRecoveryRecord`, `WhoopCycleRecord`).
- No persistence of refresh tokens — paste-the-token only; no health record persistence beyond the active session.
- One new runtime dependency permitted only if absolutely required for the API client.
- Locked palette only.
- No PHI or PII transmission to non-Whoop hosts. Token never leaves the server route.
- No changes to N=014 / N=015 / N=016 / N=017 plugin code.

## HANDOFF

→ N=018 Commander reads:
  1. `agent_state/CURRENT_N.md` through `CURRENT_017.md`
  2. `agent_state/S1_LOCKED.md` through `S1_LOCKED_017.md`
  3. `agent_state/AUDIT_TRAIL_PROTOCOL.md` (binding since N=013)
  4. `agent_state/TRUTH_RESULT_017.md`
  5. `agent_state/QUEUE.md` and `SESSION_LOG.md`
  6. `lib/engine.ts`, `lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`, `lib/pluginRegistry.ts`
  7. `lib/plugins/appleHealth/index.ts` (reference pattern for wearable signal plugin)
  8. `lib/plugins/labPlaceholder/index.ts` (reference pattern for token/JSON entry pattern)
  9. `components/AppleHealthUpload.tsx`, `components/LabValuesEntry.tsx`, `components/AssessmentForm.tsx`
  10. `lib/types.ts`, `package.json`

The locked priority build order continues:
- N=018 — Whoop wearable plugin (this proposal)
- N=019 — Oura wearable plugin (parallel signal source)
- N=020+ — Garmin / Fitbit / additional wearables, real LabCorp / Quest API integration with HIPAA review, Amazon partner approval with cart building, real telehealth API with patient intake
