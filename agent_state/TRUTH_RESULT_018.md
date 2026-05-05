# TRUTH_RESULT_018.md

**N:** 018 **Hat:** JUDGE **Date:** 2026-05-05 **Result:** PASS

---

## Verdict

**PASS — all 16 acceptance criteria satisfied.** The production Apple Health bug Jay reported on `fitness-iota-azure.vercel.app` is resolved: the false-Connected blank-dash state is replaced with an honest "No recent data found · Apple Health" state when the export is empty, and real numbers when the export has any record within the last 30 days. Whoop is registered as the **fifth plugin overall, third signal plugin, second wearable signal source** — the wearable layer is now exercised by two plugins simultaneously, and the priority resolver's within-layer recency tie-break selects the more-recent reading when both target the same UserInput field.

The locked engine, Signal Stack core, N=015 / N=016 / N=017 plugins and their components are byte-identical against `main`. Zero new dependencies. The honest-connection-state pattern locked this cycle applies retroactively to Apple Health and forward to Whoop; both plugins gate "Connected" on `tagged.length > 0` and render distinct empty / invalid states with `AlertCircle` icons.

## Per-test detail

- **T1: PASS** — `git diff main -- package.json package-lock.json` empty.
- **T2: PASS** — `npm run build` clean.
- **T3: PASS** — `bash scripts/verify-audit-trail.sh` exits 0.
- **T4: PASS** — Diagnosis documented in both `CURRENT_018.md` and `A1_OUTPUT_018.md`. Two compounding failure modes: (A) `setConnected(true)` fired unconditionally; (B) the 7-day window was anchored to `nowMs` instead of the most-recent record.
- **T5: PASS** — Stale 15+-day-old fixture produces 2 TaggedUserInput entries via live API: steps→activityLevel=high (behavior) + HR→activityLevel=high (wearable). Summary: `averageDailySteps=20500, restingHeartRate=58`. Pre-fix: empty. Smoke harness with 14-day-old fixture: 3 entries with `steps=10229 / sleep=7.4hrs / bpm=56`.
- **T6: PASS** — Empty `<HealthData/>` returns `200 { tagged: [], summary: {} }`. Mobile screenshot at `/tmp/n018_apple_no_data_390.png` confirms the new "NO RECENT DATA FOUND · APPLE HEALTH" state with `AlertCircle` icon, explanation text, and "TRY ANOTHER EXPORT" reset button.
- **T7: PASS** — `setConnected(true)` is gated on `tagged.length > 0`. The `aria-label="Apple Health connected"` only appears in the DOM when the API returned a non-empty array.
- **T8: PASS** — `/api/plugins/apple-health` route logs `console.log(JSON.stringify({event: "apple_health_normalize", taggedCount, summary, recordCounts: {steps, sleep, restingHeartRate}, xmlBytes}))` after every request. Visible in Vercel function logs in production.
- **T9: PASS** — Live API verification:
  - `validateWhoopToken("")` → invalid with helpful error.
  - `validateWhoopToken("malformed")` → invalid: `"Token format does not match Whoop's expected shape."` (rejected before network call by JWT-shape check).
  - `validateWhoopToken("   ")` → invalid (whitespace handling).
  - JWT-shaped fake token → invalid via network failure path: `"Could not validate token against Whoop's API."`.
- **T10: PASS** — `normalizeWhoopMetrics({recoveryScore: 30, dayStrain: 18, ...})` returns 2 entries: `{symptomToFix=fatigue, layer=wearable, conf=0.85}` + `{activityLevel=high, layer=wearable, conf=0.85}`.
- **T11: PASS** — `getActivePlugins()` returns 5 plugins in order `[apple-health, amazon, telehealth, lab-placeholder, whoop]`. The N=014/N=015/N=016/N=017 first-four-entry invariants are preserved.
- **T12: PASS** — DOM offsets confirm card mounting order: apple-health-upload (14359) < lab-values-entry (16310) < whoop-connect (20502). Mobile screenshot at `/tmp/n018_three_cards_390.png` shows all three cards stacked.
- **T13: PASS** — `POST /api/plugins/whoop { token: "<jwt-shaped>" }` returns `200 { tagged: [], summary: null, error: "..." }` via the network-error path in this sandbox. Route never returns 500.
- **T14: PASS** — `POST /api/plugins/whoop { token: "" }` returns `200 { tagged: [], summary: null, error: "Invalid token. Please paste your Whoop personal access token from developer.whoop.com." }`. Mobile screenshot at `/tmp/n018_whoop_invalid_390.png` confirms the "INVALID TOKEN · WHOOP" state with `AlertCircle` icon.
- **T15: PASS** — Within-layer recency tie-break verified: an Apple Health wearable entry timestamped 2026-05-01 and a Whoop wearable entry timestamped 2026-05-04, both targeting `activityLevel`, resolve to the more-recent (Whoop) value. Two wearable plugins coexist; the resolver disambiguates by recency per the locked N=012 weighting rule.
- **T16: PASS — N=017 regression intact:**
  - `recommend(input)` byte-identical to `main` (2719 bytes, 0-byte diff).
  - LabValuesEntry still renders below AppleHealthUpload (and now WhoopConnect renders below LabValuesEntry).
  - Amazon FulfillButton renders on each supplement card (5 buttons on routine 5-supplement page).
  - SpeakToDoctorButton conditional rendering still works (0 on routine, 1 on escalation).
  - DEV MODE comment unchanged.
  - `lib/plugins/{amazon,telehealth,labPlaceholder}/*` and `components/{FulfillButton,SpeakToDoctorButton,LabValuesEntry}.tsx` diffs against `main` empty.
  - `bash scripts/verify-audit-trail.sh` exits 0.

## Bug-fix verification (the critical regression test)

Smoke harness designed specifically for the failure scenario Jay reported. Pre-fix, a 15+-day-old export produced empty `TaggedUserInput[]` and empty summary, leading to the false-Connected blank-dash state. Post-fix:

```
PASS  Stale export (15+ days old) produces 3 TaggedUserInput entries (PRE-FIX: empty)
PASS  Summary has averageDailySteps=10229 / averageSleepHours=7.4 / restingHeartRate=56
PASS  Empty export → empty TaggedUserInput[] + empty summary
PASS  All-stale export (>30 days old) → empty TaggedUserInput[] (recency cutoff still applies)
```

The 30-day recency cutoff is preserved. The fix shifts the inner 7-day window to anchor on the most-recent-record-in-export, with a 30-day fallback when sparse.

## End-to-end signal flow (5 plugins, 4 layers exercised)

1. **Behavior** — assessment form + Apple Health steps + sleep.
2. **Wearable** — Apple Health resting HR + Whoop recovery + Whoop strain. Within-layer recency tie-break picks the most-recent reading on conflicting fields.
3. **Lab** — N=017 lab-placeholder.
4. **Action layers** — N=015 Amazon, N=016 telehealth.

The fifth plugin, Whoop, is the first plugin to share a layer with another plugin. The priority resolver from N=012 handles this without modification.

## Watcher summary

14/14 drift checks clean against `main` (`ce1438e`). Every other plugin's code, the engine, the Signal Stack core, and 24 frozen `lib/*` files are byte-identical. Apple Health files unfrozen for the bug fix only — diff scope limited to the 4 implicated files. Byte-identical engine regression: `recommend(FIXTURE)` 2719-byte JSON identical between branch and `main`. Banned-string scan in new code: 0 hits.

## Required env vars

No additions this cycle. Whoop API base URL is constant + publicly documented.

## Outcome

→ Open PR `N=018: Apple Health bug fix + Whoop plugin integration, fifth plugin and second wearable signal source`.
→ Write `NEXT_019.md` proposing the Oura wearable plugin as the next cycle, completing the wearable layer expansion.
