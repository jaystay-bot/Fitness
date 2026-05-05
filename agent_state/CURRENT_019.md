# CURRENT_019.md

**N:** 019 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=018 (PASS, PR #27 pending merge)

---

## INTENT

N=019 ships **Oura as the sixth plugin** — the **fourth signal plugin and third wearable signal source**. With Apple Health (N=014), Whoop (N=018), and now Oura, the wearable layer of the Signal Stack is fully populated by three independent plugins. The locked priority build order's wearable-expansion phase completes here before any layer additions or revenue surfaces ship.

The plugin uses **paste-the-token** integration matching the Whoop pattern from N=018 because Oura's developer portal at `cloud.ouraring.com` supports personal access tokens that users generate without OAuth approval. The honest connection state pattern locked in N=018 applies verbatim per the binding requirement in `NEXT_019.md`: `OuraConnect` gates "Connected" on `tagged.length > 0` and renders distinct empty / invalid states with `AlertCircle` icons in clinical orange.

Three objectives:

**A — Oura sleep + readiness normalizer.**
A pure deterministic generator (`lib/plugins/oura/normalizer.ts`) maps Oura's most-recent daily sleep score and daily readiness score to `TaggedUserInput[]` at the wearable layer with confidence 0.85 (matching Whoop). Score-to-bucket mapping per Oura's documented bands:
- `sleep_score < 60` (poor) → `symptomToFix: "poor-sleep"`.
- `sleep_score 60..69` (fair) → no override (confirms behavior).
- `sleep_score >= 70` (good / excellent) → no override (confirms behavior).
- `readiness_score < 60` (low) → `symptomToFix: "fatigue"`.
- `readiness_score 60..79` (moderate) → no override.
- `readiness_score >= 80` (high) → no override.

**B — Plugin registry sixth entry, fourth signal variant.**
`lib/plugins/oura/index.ts` registers an `OuraPlugin` against the existing `PluginNormalization` interface from N=012 (no contract change). `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin, whoopPlugin, ouraPlugin]`. The N=014/N=015/N=016/N=017/N=018 first-five-entry invariants are preserved.

**C — Three-way recency resolution within the wearable layer.**
With three wearable plugins (Apple Health, Whoop, Oura) coexisting in the registry, the priority resolver from N=012 now handles three-way recency tie-break for the first time. The locked `LAYER_WEIGHT.wearable=2` plus within-layer ISO-timestamp recency tie-break is sufficient for any number of plugins per layer — verified with two plugins in N=018, now verified with three.

The user-facing change is one new opt-in card on the assessment page. Users who skip it experience the form byte-identically to N=018.

## SCOPE BOUNDARY

Four new files (tokenAuth, normalizer, plugin index, OuraConnect component) plus one new API route under `/api/plugins/oura`. Three surgical modifications: `lib/pluginRegistry.ts` (sixth entry seed), `components/AssessmentForm.tsx` (mount card + thread tagged inputs through submit, identical pattern to N=014/N=017/N=018), `lib/types.ts` (additive `OuraToken` + `OuraMetrics`). Zero new dependencies. No new Supabase migrations. No engine modification. No Signal Stack core modification. No N=014/N=015/N=016/N=017/N=018 plugin code modification.

## SUCCESS DEFINITION

- `validateOuraToken("")` and `validateOuraToken("malformed")` return `{ valid: false, error: ... }`.
- `normalizeOuraMetrics({sleepScore: 50, readinessScore: 55, asOf: ...})` returns 2 `TaggedUserInput` entries, both at wearable layer, both confidence 0.85.
- `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder, whoop, oura]`; length 6.
- `<OuraConnect>` renders BELOW `<WhoopConnect>` on the assessment form.
- Honest connection state: `tagged.length > 0` gates "Connected"; empty / invalid render `AlertCircle` states with reset buttons.
- Three wearable plugins coexisting in the registry exercise three-way recency tie-break (Apple Health / Whoop / Oura at different timestamps on the same field).
- N=018 regression intact (Apple Health bug fix preserved, Whoop renders correctly, all prior plugins functional, recommend byte-identical without plugin tagged inputs).
- N=013 `verify-audit-trail.sh` exits 0.

## CONSTRAINTS (Commander level)

- Engine purity preserved (`lib/engine.ts` byte-identical).
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- N=014 Apple Health (including the N=018 bug fix), N=015 Amazon, N=016 telehealth, N=017 lab-placeholder, N=018 Whoop plugins FROZEN.
- N=015 `FulfillButton`, N=016 `SpeakToDoctorButton`, N=017 `LabValuesEntry`, N=014 `AppleHealthUpload` (N=018-fixed), N=018 `WhoopConnect` components FROZEN.
- Zero new runtime dependencies.
- No persistence of Oura tokens. No `localStorage` / `sessionStorage` of any plugin data.
- No new env vars (Oura API base URL is constant + publicly documented).
- Locked palette only.
- Honest connection state on the Oura card per the N=018 binding pattern.
- No medical-advice or AI-assistant framing.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_019.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
