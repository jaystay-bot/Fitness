# CURRENT_017.md

**N:** 017 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=016 (PASS, merged via PR #25)

---

## INTENT

N=017 ships the **lab placeholder plugin** — the fourth plugin to register against the locked Plugin Layer contract from N=012, and the **second signal plugin** (after Apple Health, N=014). The cycle exercises the Signal Stack priority resolver across all three layers (`behavior` < `wearable` < `lab`) for the first time. Lab values manually entered by the user override Apple Health wearable signals, which override the assessment form's behavior signals.

The plugin is intentionally **manual** rather than API-integrated. Real LabCorp / Quest API integration with auto-sync, PDF auto-parsing beyond the existing N=007 surface, and HIPAA-compliant data storage are deferred. This cycle lights up the priority hierarchy and the lab-tier plugin slot without requiring partnership approval or compliance review.

Three objectives:

**A — Manual lab entry parser at the lab layer.**
A pure deterministic parser (`lib/plugins/labPlaceholder/manualEntry.ts`) accepts an object mapping biomarker names to numeric values, validates each against the physiological ranges from `lib/labParser.ts` (re-used as reference data), and emits `TaggedUserInput[]` entries at `layer: "lab"` with `confidence: 0.95`. Mapping rules mirror the N=007 `applyLabOverrides` logic so PDF-parsed and manually-entered values converge on the same engine signal:

- `ferritin_ng_ml < 30` → `symptomToFix: "fatigue"`
- `vitamin_d_25oh_ng_ml < 30` → `symptomToFix: "fatigue"`
- `b12_pg_ml < 300` → `symptomToFix: "brain-fog"`
- `magnesium_mg_dl < 1.7` → `symptomToFix: "poor-sleep"`
- `tsh_uiu_ml > 4.5` → `symptomToFix: "fatigue"` (hypothyroid signal, additive to N=007's set)

**B — Plugin registry fourth entry, second signal variant.**
`lib/plugins/labPlaceholder/index.ts` registers a `LabPlaceholderPlugin` against the existing `PluginNormalization` interface from N=012 (no contract change). `lib/pluginRegistry.ts` is extended to seed `[appleHealthPlugin, amazonPlugin, telehealthPlugin, labPlaceholderPlugin]`. The N=014/N=015/N=016 first/second/third entry invariants are preserved.

**C — Opt-in `LabValuesEntry` card + range-validated API route.**
A new `components/LabValuesEntry.tsx` mounts BELOW the existing `AppleHealthUpload` card on the assessment form. The card displays five numeric inputs (ferritin, vitamin D 25-OH, B12, magnesium, TSH) with placeholders showing the optimal range. On submit, the card POSTs to `app/api/plugins/lab-placeholder/route.ts`, which validates each value against `lib/labParser.ts`'s `PHYSIOLOGICAL_RANGES`, returns the resulting `TaggedUserInput[]`, and rejects out-of-range values with a `400` and a clear message. The card holds the array in state and `AssessmentForm` concatenates it with any Apple Health tagged inputs before submission. The locked priority resolver takes care of the rest.

The user-facing change is a single new opt-in card. Users who skip it experience the form byte-identically to N=016. The N=007 `LabUpload` PDF flow remains in place — both paths produce the same `TaggedUserInput`-shaped output and converge in the same engine call.

## SCOPE BOUNDARY

Four new files (manual-entry parser, plugin index, LabValuesEntry card, API route). Three surgical modifications: `lib/types.ts` (additive `ManualLabValue` + `LabPlaceholderInput`), `lib/pluginRegistry.ts` (fourth entry seed), `components/AssessmentForm.tsx` (mount card + thread tagged inputs through submit). Zero new dependencies. No new Supabase migration. No engine modification. No Signal Stack core modification. No N=014 / N=015 / N=016 plugin code modification. The N=007 lab parser, lab mapping, and `LabUpload` component are FROZEN.

## SUCCESS DEFINITION

- `parseManualLabValues({ ferritin_ng_ml: 18 })` returns one `TaggedUserInput<"symptomToFix">` with `value: "fatigue"`, `layer: "lab"`, `confidence: 0.95`, and a current ISO timestamp.
- `parseManualLabValues({})` returns `[]`.
- `parseManualLabValues({ irrelevant_marker: 42 })` returns `[]` (unknown markers ignored).
- `validateManualLabValues({ ferritin_ng_ml: 99999 })` returns `{ ok: false, outOfRange: "ferritin_ng_ml" }` (physiologically implausible).
- `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder]`; length 4.
- `POST /api/plugins/lab-placeholder { ferritin_ng_ml: 18 }` returns `200 { tagged: [<one entry>] }`.
- `POST` with out-of-range value returns `400 { error: "..." }` naming the field.
- `POST` with empty body returns `200 { tagged: [] }`.
- `recommend(input, [apple_health_wearable_symptom, lab_layer_symptom])` resolves to the lab value (priority weight 3 > 2).
- `recommend(input)` and `recommend(input, [])` byte-identical to N=016 (engine pipeline untouched).
- `<LabValuesEntry>` renders BELOW `<AppleHealthUpload>` on the assessment form.
- N=016 regression intact (`<SpeakToDoctorButton>` conditional, Amazon `<FulfillButton>` per pick, Apple Health upload card, three-tier `/pricing`).
- N=013 `verify-audit-trail.sh` exits 0.

## CONSTRAINTS (Commander level)

- Engine purity preserved (`lib/engine.ts` byte-identical).
- Signal Stack core (`lib/signalLayers.ts`, `lib/signalPriority.ts`, `lib/pluginContract.ts`) FROZEN.
- N=014 Apple Health, N=015 Amazon, N=016 telehealth plugins FROZEN. `FulfillButton` and `SpeakToDoctorButton` FROZEN.
- N=007 `lib/labParser.ts`, `lib/labMapping.ts`, and `components/LabUpload.tsx` FROZEN. Their PDF parsing flow is byte-identical and continues to serve users who upload reports as PDFs.
- Zero new runtime dependencies.
- No new Supabase tables or migrations. No persistence — the manually entered values flow only into the active session's recommend call.
- Locked palette only.
- No PDF parsing logic in this cycle — that's still the N=007 surface.
- No HIPAA-protected data persistence. No PII beyond what's in component state for the duration of the session.
- No chatbot or AI-assistant framing of the entry card.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_017.md`. All prior locked contracts remain binding. The N=013 `AUDIT_TRAIL_PROTOCOL.md` Watcher-phase amendment is binding for this cycle.
