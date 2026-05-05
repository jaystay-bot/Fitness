# CURRENT_014.md

**N:** 014 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=013 (PASS, this branch builds on N=013)

---

## INTENT

N=014 ships **Apple Health as the first registered plugin** against the locked Signal Stack contract from N=012. The plugin reads the iOS Health app XML export, extracts steps / sleep / resting heart rate, and emits `TaggedUserInput[]` entries that flow through the priority resolver into `recommend()`. The cycle proves the contract works end-to-end against real external data without modifying the locked engine, signal-stack core, or plugin contract.

Three objectives:

**A — Apple Health parser + normalizer.**
A pure regex-driven parser (`lib/plugins/appleHealth/parser.ts`) extracts the three target record types from the iOS Health export XML. The Apple Health export is a single `export.xml` file containing `<Record type="HKQuantityTypeIdentifierStepCount" .../>`, `<Record type="HKCategoryTypeIdentifierSleepAnalysis" .../>`, and `<Record type="HKQuantityTypeIdentifierRestingHeartRate" .../>` elements. The normalizer (`lib/plugins/appleHealth/normalizer.ts`) collapses 7-day windows to `activityLevel` (behavior, conf 0.7) and `sleepHours` (behavior, conf 0.7), and the most recent restingHR reading to `activityLevel` (wearable, conf 0.85, mapped via fitness-band thresholds). All functions are pure and synchronous.

**B — First plugin registered against the locked contract.**
`lib/plugins/appleHealth/index.ts` exports a `PluginNormalization` implementation that satisfies the N=012 contract: `name: "apple-health"`, `layer: "wearable"` (the dominant layer; per-entry layers come from `normalize`), `normalize(rawXmlString) → TaggedUserInput[]`, `calibrateConfidence(raw) → number`, `recencyThresholdMs: 30 days`. `lib/pluginRegistry.ts` is modified to seed the `registered` array with this plugin so `getActivePlugins()` returns it as the first entry — no `registerPlugin` runtime call needed in product code.

**C — Opt-in upload card + end-to-end signal flow.**
A new `components/AppleHealthUpload.tsx` mounts above the assessment form. Users tap a `.xml` file picker, the file is POSTed to a new `app/api/plugins/apple-health/route.ts` route which calls the plugin's `normalize`, the route returns the resulting `TaggedUserInput[]`, the upload card transforms to "Connected" with the three parsed values displayed (avg steps, avg sleep hours, resting HR), and the array is held in `AssessmentForm` component state. On form submit, the tagged inputs ride alongside the existing `UserInput` body to `/api/recommend`, which passes them to `recommend(input, taggedInputs)`. Users who skip the upload experience the form byte-identically to N=013.

The plugin **fails silently** per the locked Plugin Layer rule. Malformed XML, empty exports, missing record types, or upload failures yield an empty `TaggedUserInput[]` and the card stays in its idle state — no toast, no modal, no thrown error, no surfaced complexity.

## SCOPE BOUNDARY

Five new files: parser, normalizer, plugin index, API route, upload component. Two surgical modifications: `pluginRegistry.ts` (one-line seed import + array literal extension) and `AssessmentForm.tsx` (mount card + thread tagged inputs through submit). One contract-spirit-honoring micro-extension to `app/api/recommend/route.ts` to optionally accept `taggedInputs` in the request body — strictly additive, backward-compatible. Zero new dependencies (regex-only XML parsing). No persistence to Supabase. No external API calls. No OAuth.

## SUCCESS DEFINITION

- Apple Health export fixture round-trips through parser + normalizer + plugin → TaggedUserInput[] with one entry per signal type at the expected layers + confidences.
- `getActivePlugins()` returns `[appleHealthPlugin]` (length 1, first entry).
- `POST /api/plugins/apple-health` with a valid XML file returns the parsed array as JSON.
- `POST /api/plugins/apple-health` with malformed input returns an empty array, NOT 500.
- `AssessmentForm` mounts `AppleHealthUpload` above the existing form fields without disturbing layout.
- A user who uploads a valid export sees the card transform to "Connected" with three values displayed and their recommendation reflects the wearable-layer signal.
- A user who skips the upload sees a recommendation byte-identical to N=013 (regression preserved).
- The N=013 audit-trail verify script exits 0 against this cycle's state files.

## CONSTRAINTS (Commander level)

- Engine purity preserved. `recommend()` signature byte-identical to N=012.
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- Zero new runtime dependencies. No `xml2js`, no `fast-xml-parser`, no DOMParser polyfill — regex only on the three target record types.
- The plugin honors the privacy posture: raw XML never persists to disk or DB in this cycle. The route reads the upload, parses in memory, returns the normalized array, and discards the raw bytes.
- The upload card must be opt-in; the form submission flow regresses byte-identically when no export is uploaded.
- Apple Health is iOS-only; the card must not surface any iOS-specific complexity to non-iOS users (they see the card but can simply skip it).

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_014.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
