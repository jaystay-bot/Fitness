# A1_OUTPUT_017.md

**N:** 017 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n017-aYZje` **Predecessor:** main @ `7de6d21` (post N=016 merge)

---

## SUMMARY

Eight atomic operator commits + Commander/Architect/Sentinel state commits. Four new files (manual-entry parser, plugin index, LabValuesEntry card, API route). Three surgical modifications: `lib/types.ts` (additive `ManualLabValue` + `LabPlaceholderInput`), `lib/pluginRegistry.ts` (fourth entry seed), `components/AssessmentForm.tsx` (mount card below `AppleHealthUpload`, second tagged-input state slot, concatenate on submit). Zero new dependencies. No new Supabase migration. Engine + Signal Stack core + N=014 / N=015 / N=016 plugins + N=007 LabUpload (PDF flow) + FulfillButton + SpeakToDoctorButton + AppleHealthUpload all FROZEN and untouched.

## COMMITS

```
0ef2034  N=017 commander: define lab placeholder plugin integration cycle
2202a5a  N=017 architect: lock lab placeholder plugin integration contract
0bd196a  N=017 operator: add ManualLabValue + LabPlaceholderInput to lib/types.ts
6ea43d8  N=017 operator: add lib/plugins/labPlaceholder/manualEntry.ts (pure parser + range validator)
20f6fbd  N=017 operator: add lib/plugins/labPlaceholder/index.ts (PluginNormalization at lab layer)
5ca11f5  N=017 operator: add components/LabValuesEntry.tsx (opt-in lab-entry card)
bece2eb  N=017 operator: add app/api/plugins/lab-placeholder/route.ts (range-validated POST endpoint)
d57a7fb  N=017 operator: register lab-placeholder as 4th entry in lib/pluginRegistry.ts
e31c1c8  N=017 operator: mount LabValuesEntry below AppleHealthUpload + thread tagged inputs in AssessmentForm
(this)   N=017 operator: write A1_OUTPUT_017.md manifest
```

## FILES TOUCHED

```
A  lib/plugins/labPlaceholder/manualEntry.ts        pure parser + validator (168 lines)
A  lib/plugins/labPlaceholder/index.ts              PluginNormalization at lab layer (61 lines)
A  components/LabValuesEntry.tsx                    opt-in card with 5 biomarker inputs (237 lines)
A  app/api/plugins/lab-placeholder/route.ts         POST endpoint, range-validated (73 lines)

M  lib/types.ts                                     +16 lines additive: ManualLabValue + LabPlaceholderInput
M  lib/pluginRegistry.ts                            +8 lines: import + 4th entry seed + comment
M  components/AssessmentForm.tsx                    +10 lines: import, second tagged state, mount, concatenate

A  agent_state/CURRENT_017.md
A  agent_state/S1_LOCKED_017.md
A  agent_state/A1_OUTPUT_017.md   (this file)
A  agent_state/TRUTH_RESULT_017.md  (Judge will write)
A  agent_state/NEXT_018.md          (Judge will write on PASS)
M  agent_state/SESSION_LOG.md       N=017 cycle entries appended
```

`git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts` is empty (Signal Stack core preserved).
`git diff main -- lib/plugins/appleHealth/ lib/plugins/amazon/ lib/plugins/telehealth/` is empty (N=014/N=015/N=016 plugins preserved).
`git diff main -- lib/labParser.ts lib/labMapping.ts components/LabUpload.tsx` is empty (N=007 PDF flow preserved).
`git diff main -- components/FulfillButton.tsx components/SpeakToDoctorButton.tsx components/AppleHealthUpload.tsx` is empty.
`git diff main -- package.json package-lock.json` is empty (zero new deps).

## CONTRACT-SPIRIT-HONORING NOTES

1. **No contract modification.** `lib/pluginContract.ts` is byte-identical against `main`. The lab-placeholder plugin satisfies the existing `PluginNormalization<TRaw>` generic from N=012 with `TRaw = ManualLabValue`. The discriminated union in `RegisteredPlugin` from N=015 already accommodates both signal and action plugins.
2. **Mapping rules mirror N=007.** The TaggedUserInput emission rules in `parseManualLabValues` reproduce the symptomToFix mappings established by N=007's `applyLabOverrides` for ferritin, vitamin D, and B12. Magnesium and TSH are additive — they extend the same vocabulary onto the symptomToFix enum that the engine already understands. PDF-parsed and manually-entered values converge on the same engine signal because the routing through symptomToFix is identical.
3. **Three-layer priority resolved for the first time.** With Apple Health (wearable) and lab-placeholder (lab) both able to tag UserInput fields the assessment form (behavior) sets, the priority resolver from N=012 now has a concrete test surface for the full hierarchy. Smoke harness verified: `resolveTaggedInputs([behavior, wearable, lab])` with all three targeting `symptomToFix` returns the lab value.
4. **No HIPAA persistence.** The lab-placeholder route does NOT touch Supabase. Manually entered values flow only into the active session's recommend call and live in component state. The N=007 LabUpload PDF flow's posture (no raw uploads on disk) is preserved; this cycle's posture is even tighter (no values on disk OR in DB).
5. **N=007 LabUpload coexistence.** Users who upload PDFs through the existing N=007 component (Pro-gated, inside `ResultCard`'s clinical companion section) continue to feed values via the original `applyLabOverrides` → mutated UserInput path. Users who type values into the new N=017 card (always-on, on the assessment form) feed values via the TaggedUserInput → priority-resolved path. Both paths terminate at the same recommend call. Neither path interferes with the other.
6. **Engine purity preserved.** `lib/engine.ts` is byte-identical against `main`. `recommend(input)` and `recommend(input, [])` produce JSON byte-identical to N=016 (2719 bytes for the standard fixture).

## VERIFICATION

- `npx tsc --noEmit` clean across all 9 source commits.
- Smoke harness exercised end-to-end:
  - Parser: ferritin=18 → 1 entry `{ field: "symptomToFix", value: "fatigue", layer: "lab", confidence: 0.95, timestamp: NOW.toISOString() }`. Multi-marker (5 markers below threshold) → 5 entries, all at `layer="lab"`. Empty / unknown markers → empty array.
  - Validator: `ferritin_ng_ml: 99999` → `{ ok: false, outOfRange: "ferritin_ng_ml" }`. Negative values rejected. In-range values accepted. Unknown fields silently allowed (validator only checks fields it recognizes).
  - Plugin shape: `name: "lab-placeholder"`, `layer: "lab"`, `recencyThresholdMs: 90 * 24 * 60 * 60 * 1000`, `calibrateConfidence({}) === 0`, `calibrateConfidence({ferritin_ng_ml: 50}) === 0.95`.
  - Registry: `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder]`; length 4; first three N=014/N=015/N=016 invariants preserved.
  - Three-layer priority: `resolveTaggedInputs([behaviorTag, wearableTag, labTag])` for `symptomToFix` returns the **lab** value ("brain-fog") even when the wearable and behavior entries are different ("low-strength" / "none") — confirming `LAYER_WEIGHT` (3 / 2 / 1) drives the resolution.
  - `recommend(input, [3-layer tagged])` produces output that differs from `recommend(input)` (the lab-layer signal flows into the engine).
  - Engine byte-identity: `recommend(input) === recommend(input, undefined) === recommend(input, [])` (2711-byte JSON identical across all three call shapes).
- Frozen-file regression: every diff against `main` for engine, signal stack core, prior plugins, prior components empty.

## HANDOFF

→ Watcher reads this file, runs the drift gauntlet against `main` (`7de6d21`), and invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
→ Judge reads `S1_LOCKED_017.md` and verifies the 12 acceptance criteria, runs the N=016 regression, writes `TRUTH_RESULT_017.md` and (on PASS) `NEXT_018.md`, and opens the N=017 PR.
