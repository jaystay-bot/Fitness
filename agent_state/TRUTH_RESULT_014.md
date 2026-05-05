# TRUTH_RESULT_014.md

**N:** 014 **Hat:** JUDGE **Date:** 2026-05-05 **Result:** PASS

---

## Verdict

**PASS — all 11 acceptance criteria satisfied.** Apple Health is the first plugin to register against the locked N=012 PluginNormalization contract. The signal flow is proven end-to-end: the iOS Health XML export parses through `parseAppleHealthExport`, normalizes through `normalizeAppleHealthRecords`, ships through `appleHealthPlugin.normalize`, gets exposed by `getActivePlugins()` as the first registered entry, rides the new `/api/plugins/apple-health` upload endpoint to the client, gets stored in the assessment form's local state, then flows alongside `UserInput` into `recommend(input, taggedInputs)` via the additively-extended `/api/recommend` route — all without modifying the locked engine, signal-stack core, plugin contract, or `UserInput` shape, and without adding a single new dependency.

## Per-test detail

- **T1: PASS** — `git diff main -- package.json package-lock.json` empty against N=013 head (`4481564`). Zero new dependencies. Regex-only XML extraction satisfies the no-XML-library constraint.
- **T2: PASS** — `npm run build` clean. All routes still compile, including the new `/api/plugins/apple-health` route (visible in build output).
- **T3: PASS** — `bash scripts/verify-audit-trail.sh` exits 0 with the success message: `verify-audit-trail [N=014]: OK — CURRENT, S1_LOCKED, A1_OUTPUT all committed (or A1_OUTPUT staged)`. The N=013 audit-trail guard is honored.
- **T4: PASS** — `parseAppleHealthExport(<fixture>)` returns 7 step records, 7 sleep records, and 5 resting-heart-rate records for a fixture containing exactly those counts. Verified.
- **T5: PASS** — `normalizeAppleHealthRecords(<parsed>, NOW)` returns 3 `TaggedUserInput` entries:
  - `{ field: "activityLevel", value: "high", layer: "behavior", confidence: 0.7 }`
  - `{ field: "sleepHours", value: 7.5, layer: "behavior", confidence: 0.7 }`
  - `{ field: "activityLevel", value: "high", layer: "wearable", confidence: 0.85 }`
- **T6: PASS** — `getActivePlugins()` returns an array of length 1 whose first entry has `name === "apple-health"`. The plugin is seeded into `registered` at module load time; no runtime `registerPlugin` call needed.
- **T7: PASS** — `POST /api/plugins/apple-health` with a valid multipart XML upload returns `200 { tagged: [3 entries], summary: { averageDailySteps: 10333, averageSleepHours: 8, restingHeartRate: 58 } }`. Verified via `curl -F "file=@fixture.xml"` against the live `npm run start` server.
- **T8: PASS** — `POST /api/plugins/apple-health` with malformed text body returns `200 { tagged: [], summary: {} }`. Empty body returns the same. NEVER 500. Fail-silently rule honored.
- **T9: PASS** — The home page (`/`) HTML contains `data-testid="apple-health-upload"` at byte offset `14360`, BEFORE the first `<input>` at byte offset `15259`. The card renders above the assessment form fields. Verified via DOM offset comparison.
- **T10: PASS** — `recommend(baseInput, [<applehealth tagged>])` produces JSON output that differs from `recommend(baseInput)` for `baseInput.activityLevel = "sedentary"` when the Apple Health wearable-layer entry sets `activityLevel: "high"`. The wearable-layer signal flows through the priority resolver into the engine's effective input. JSON-string inequality verified.
- **T11: PASS — N=013 regression intact:**
  - `recommend(input)` byte-identical to `recommend(input, [])` and `recommend(input, undefined)`. Verified via triple JSON-string equality.
  - `POST /api/recommend` without a `taggedInputs` body field returns a JSON Recommendation byte-identical to N=013 head for the same `UserInput` (2719 bytes, `diff` returns no output).
  - Live API integration: `POST /api/recommend` with the standard fixture returns the expected verdict beginning `Your stack leads with B12, Vitamin D3, ...` and 3 supplements.
  - The home page (`/`) renders cleanly. The Spear sections, the assessment form, the InteractiveTimeline (in result mode), `/pricing` three-tier copy — all unchanged.
  - `lib/subscription.ts` DEV MODE comment unchanged. `lib/proAccess.ts` allowlist unchanged. `app/admin/feedback/page.tsx` unchanged.

## Watcher summary

12/12 drift checks clean against N=013 head (`4481564`):

1. `package.json` + `package-lock.json` diff EMPTY (zero new deps)
2. 29 frozen `lib/*` files (engine, signalLayers, signalPriority, pluginContract, types, supplements, conflicts, …) — diffs EMPTY
3. API routes: only `/api/recommend` (additive `taggedInputs` parsing) and the new `/api/plugins/apple-health` route diff — every other route EMPTY
4. Components: only `AssessmentForm` (mount card + thread tagged inputs) and the new `AppleHealthUpload` diff — every other component EMPTY
5. App pages + middleware + 7 config files + `.gitignore` — diffs EMPTY
6. `supabase/` + `python/` + `scripts/` — diffs EMPTY
7. `agent_state/AUDIT_TRAIL_PROTOCOL.md` — unchanged
8. Banned-string scan in new code (`localStorage` / `sessionStorage` / `document.cookie` / `AI-powered` / `from-purple` / `to-purple`) → 0 hits
9. No external `fetch` in plugin code — parser + normalizer pure; route uses `request.formData()` / `request.text()` only
10. `bash scripts/verify-audit-trail.sh` → exit 0
11. Byte-identical engine regression: `recommend(FIXTURE)` produces 2719 bytes of JSON identical to N=013
12. `npm run build` clean

## End-to-end signal flow proof

1. **Upload** — User picks `export.xml` in `AppleHealthUpload`, taps "Upload export".
2. **Route** — Client `POST`s `multipart/form-data` to `/api/plugins/apple-health`. Route reads file in memory (5 MB cap), passes raw text to `appleHealthPlugin.normalize`.
3. **Parser** — `parseAppleHealthExport(xml)` regex-extracts step / sleep / resting-HR record tags.
4. **Normalizer** — `normalizeAppleHealthRecords(parsed)` collapses 7-day windows + filters by 30-day recency, emits `TaggedUserInput[]` at correct layers / confidences.
5. **Response** — Route returns `{ tagged, summary }` JSON. The card flips to "Connected" with the three values displayed.
6. **State** — `AssessmentForm` holds the `tagged` array via `setTaggedInputs`.
7. **Submission** — On form submit, `AssessmentForm` includes `taggedInputs` in the `POST /api/recommend` body (only when non-empty).
8. **Route** — `/api/recommend` validates and shapes the `taggedInputs` field via the additive `parseTaggedInputs` helper, calls `recommend(input, tagged)`.
9. **Engine** — `recommend()` (unchanged from N=012) calls `resolveTaggedInputs(taggedInputs)`, merges higher-priority layers over the user's behavior-layer input, computes the recommendation.
10. **Result** — The recommendation reflects the wearable-layer signal: a user who self-reported "sedentary" but has a 56 bpm resting heart rate gets the "high" activity signal honored at the wearable layer (priority weight 2 > behavior 1), shifting verdict, supplement variation, and nutrition targets accordingly.

The contract proves end-to-end. No engine modification. No new dependency. No signal-stack core change. The first plugin works.

## Required env vars

No additions this cycle.

## Outcome

→ Open PR `N=014: Apple Health plugin integration, first plugin against locked contract`.
→ Write `NEXT_015.md` proposing N=015 as the Amazon action plugin per the locked priority build order.
