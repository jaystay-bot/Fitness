# A1_OUTPUT_014.md

**N:** 014 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n014-aYZje` **Predecessor:** N=013 (`4481564` head)

---

## SUMMARY

Eight atomic operator commits + Commander/Architect/Sentinel state commits. Five new files (parser, normalizer, plugin index, API route, upload component). Three surgical modifications: `lib/pluginRegistry.ts` (seed `[appleHealthPlugin]`), `components/AssessmentForm.tsx` (mount upload card + thread tagged inputs through submit), `app/api/recommend/route.ts` (additively accept optional `taggedInputs` body field). Zero new dependencies. Engine + Signal-Stack core + plugin contract + UserInput shape FROZEN and untouched.

## COMMITS

```
6dc4210  N=014 commander: define Apple Health plugin integration cycle
e15900c  N=014 architect: lock Apple Health plugin integration contract
5c368e8  N=014 operator: add lib/plugins/appleHealth/parser.ts
8fcbdf8  N=014 operator: add lib/plugins/appleHealth/normalizer.ts
6f95f65  N=014 operator: add lib/plugins/appleHealth/index.ts (PluginNormalization implementation)
a423ca2  N=014 operator: add app/api/plugins/apple-health/route.ts
efa9af7  N=014 operator: add components/AppleHealthUpload.tsx (opt-in upload card)
270961e  N=014 operator: mount AppleHealthUpload + thread tagged inputs in AssessmentForm
172743c  N=014 operator: register appleHealth plugin in lib/pluginRegistry.ts + accept taggedInputs in app/api/recommend/route.ts
(this)   N=014 operator: write A1_OUTPUT_014.md manifest
```

## FILES TOUCHED

```
A  lib/plugins/appleHealth/parser.ts          regex-only XML extractor (131 lines)
A  lib/plugins/appleHealth/normalizer.ts      pure normalizer + summary helper (259 lines)
A  lib/plugins/appleHealth/index.ts           PluginNormalization implementation (56 lines)
A  app/api/plugins/apple-health/route.ts      POST endpoint, multipart upload, never throws (76 lines)
A  components/AppleHealthUpload.tsx           opt-in upload card with idle/connected states (180 lines)

M  components/AssessmentForm.tsx              mount AppleHealthUpload + thread taggedInputs through submit
M  lib/pluginRegistry.ts                      seed `[appleHealthPlugin]`; engine still does NOT import this file
M  app/api/recommend/route.ts                 additive parseTaggedInputs + recommend(input, tagged) call

A  agent_state/CURRENT_014.md
A  agent_state/S1_LOCKED_014.md
A  agent_state/A1_OUTPUT_014.md   (this file)
A  agent_state/TRUTH_RESULT_014.md  (Judge will write)
A  agent_state/NEXT_015.md          (Judge will write on PASS)
M  agent_state/SESSION_LOG.md       N=014 cycle entries appended
```

## CONTRACT-SPIRIT-HONORING NOTES

1. **`/api/recommend` micro-extension.** The architect's contract requires "the assessment form passes both the existing UserInput and the TaggedValue array to the recommend function." The form submits via `fetch("/api/recommend")`. Without modifying that route, the only paths to honor the contract were (a) bypass the API and run `recommend()` client-side (which violates regression #11 — "the assessment form submission flow"), or (b) extend the route's body schema to optionally accept `taggedInputs`. The chosen path is (b): a new pure helper `parseTaggedInputs` validates and shapes the field, then `recommend(input, tagged)` is called. When the field is absent or empty, the call site is `recommend(input, undefined)` — byte-identical to N=013 by the N=012 backward-compat guarantee. Verified by smoke test: `JSON.stringify(recommend(input, []))` equals `JSON.stringify(recommend(input))`.
2. **Plugin layer is `"wearable"` despite emitting both `behavior` and `wearable` entries.** The `PluginNormalization.layer` field is a single value, not a list. It serves as the plugin's "dominant layer" label; per-entry layer tags inside the returned `TaggedUserInput[]` are what the priority resolver actually consumes. `appleHealthPlugin.layer = "wearable"` is the higher-priority of the two layers this plugin emits.
3. **Resting heart rate maps to `activityLevel`, not a new field.** `lib/types.ts` is FROZEN this cycle, so adding a `restingHeartRate` field to `UserInput` was not in scope. Resting HR is mapped to `activityLevel` via fitness bands (low HR → high activity) at the wearable layer with confidence 0.85. This satisfies acceptance criterion #10 (the wearable signal flows into `recommend()` and changes its output) and remains forward-compatible: a future cycle can add a dedicated UserInput field and re-target the HR tag without breaking the plugin's public surface.
4. **Engine purity preserved.** `lib/pluginRegistry.ts` is imported only by `app/api/plugins/apple-health/route.ts` (indirectly via `appleHealthPlugin`) and any future plugin orchestration layer. `lib/engine.ts` does NOT import the registry. The recommendation pipeline never sees plugin objects — it only sees the explicit `taggedInputs` array passed by the route.

## VERIFICATION

- `npx tsc --noEmit` clean (zero errors).
- Smoke harness exercised end-to-end:
  - Parser parsed 7 step records, 7 sleep records, 5 HR records from a fixture.
  - Normalizer produced 3 `TaggedUserInput` entries: `activityLevel="high" layer=behavior conf=0.7`, `sleepHours=7.5 layer=behavior conf=0.7`, `activityLevel="high" layer=wearable conf=0.85`.
  - `summarizeAppleHealth(parsed)` returned `{averageDailySteps: 10229, averageSleepHours: 7.4, restingHeartRate: 56}` — the three values the upload card renders in its "Connected" state.
  - `appleHealthPlugin.calibrateConfidence(fixture) === 0.9`; `calibrateConfidence("") === 0`.
  - `appleHealthPlugin.normalize("garbage")` returns `[]` — fail-silently rule honored.
  - `getActivePlugins().length === 1`, `getActivePlugins()[0].name === "apple-health"`.
  - `recommend(baseInput, tagged)` differs from `recommend(baseInput)` in JSON output when `baseInput.activityLevel = "sedentary"` and the wearable-layer tag emits `"high"`.
  - `recommend(baseInput, [])` is byte-identical to `recommend(baseInput)` — N=012/N=013 byte-identity preserved.
- Frozen-file regression: `git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts lib/types.ts` empty. `git diff main -- package.json package-lock.json` empty.

## HANDOFF

→ Watcher reads this file, runs the drift gauntlet against `4481564`, and invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
→ Judge reads `S1_LOCKED_014.md` and verifies the 11 acceptance criteria, runs the N=013 regression, writes `TRUTH_RESULT_014.md` and (on PASS) `NEXT_015.md`, and opens the N=014 PR.
