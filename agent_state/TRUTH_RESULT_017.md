# TRUTH_RESULT_017.md

**N:** 017 **Hat:** JUDGE **Date:** 2026-05-05 **Result:** PASS

---

## Verdict

**PASS — all 12 acceptance criteria satisfied.** Lab placeholder is the fourth plugin to register against the locked Plugin Layer contract, and the **second signal plugin** (after Apple Health, N=014). It is the **first plugin to operate at the lab layer** — the highest priority weight in the Signal Stack. With this cycle, the Signal Stack priority resolver from N=012 is exercised across all three layers (`behavior` < `wearable` < `lab`) for the first time. Lab values manually entered through the new `LabValuesEntry` card override Apple Health wearable signals, which override the assessment form's behavior signals — exactly per the locked priority weights.

The locked engine, Signal Stack core (`signalLayers` / `signalPriority` / `pluginContract`), N=014 Apple Health plugin, N=015 Amazon plugin, N=016 telehealth plugin, N=015 `FulfillButton`, N=016 `SpeakToDoctorButton`, N=014 `AppleHealthUpload`, and N=007 PDF flow (`labParser`, `labMapping`, `LabUpload`) are all byte-identical against `main`. Zero new dependencies. Zero new Supabase migrations. The fail-silently rule extends to lab placeholder.

## Per-test detail

- **T1: PASS** — `git diff main -- package.json package-lock.json` empty. Zero new dependencies. Pure parser uses TypeScript built-ins only.
- **T2: PASS** — `npm run build` clean. All routes still compile, including the new `/api/plugins/lab-placeholder` route.
- **T3: PASS** — `bash scripts/verify-audit-trail.sh` exits 0 with success message. The N=013 audit-trail guard is honored.
- **T4: PASS** — `parseManualLabValues({ ferritin_ng_ml: 18 }, NOW)` returns one `TaggedUserInput`: `{ field: "symptomToFix", value: "fatigue", layer: "lab", confidence: 0.95, timestamp: NOW.toISOString() }`.
- **T5: PASS** — Validator behavior verified across four cases: `{ferritin_ng_ml: 99999}` → out-of-range with field name; `{ferritin_ng_ml: -5}` → out-of-range; `{ferritin_ng_ml: 50}` → ok; unknown fields → ok (validator only checks known fields).
- **T6: PASS** — `parseManualLabValues({ heart_rate: 80 })` and `parseManualLabValues({})` both return `[]`. Unknown markers and empty input produce empty arrays.
- **T7: PASS** — `getActivePlugins()` returns `[apple-health, amazon, telehealth, lab-placeholder]`; length 4. The N=014/N=015/N=016 first/second/third-entry invariants are preserved.
- **T8: PASS** — `<LabValuesEntry>` renders BELOW `<AppleHealthUpload>` on the assessment form. DOM offset verified: lab at byte 16310, apple-health at byte 14359. Mobile 390 screenshot at `/tmp/n017_lab_entry_mobile_390.png` confirms visual placement: the card with `TestTube` icon + "ENTER LAB VALUES" heading + 5 numeric inputs (Ferritin / Vitamin D 25-OH / Vitamin B12 / Magnesium / TSH, each with optimal-range placeholder) + lime "APPLY LAB VALUES" button renders directly below the "Connect Apple Health" card and directly above the assessment form's "QUICK START" header.
- **T9: PASS** — `POST /api/plugins/lab-placeholder` verified across three valid shapes:
  - `{ ferritin_ng_ml: 18 }` → `200 { tagged: [<one entry, layer=lab, confidence=0.95>] }`.
  - Multi-marker `{ ferritin_ng_ml: 18, vitamin_d_25oh_ng_ml: 22, b12_pg_ml: 250 }` → `200 { tagged: [<3 entries, all layer=lab>] }`.
  - Nested `{ values: { ferritin_ng_ml: 18 } }` → `200 { tagged: [<one entry>] }` — route accepts both flat and nested body shapes.
- **T10: PASS** — Out-of-range and edge cases:
  - `{ ferritin_ng_ml: 99999 }` → `400 { error: "Ferritin (ng/mL) must be between 1 and 2000." }`.
  - `{ vitamin_d_25oh_ng_ml: -5 }` → `400 { error: "Vitamin D 25-OH (ng/mL) must be between 1 and 200." }`.
  - `{}` (empty) → `200 { tagged: [] }`. Unknown markers only → `200 { tagged: [] }` — silent skip.
- **T11: PASS — three-layer priority hierarchy verified for the first time:**
  - `resolveTaggedInputs([behaviorTag, wearableTag, labTag])` where each targets `symptomToFix` with `"none"` / `"low-strength"` / `"brain-fog"` returns `{ symptomToFix: "brain-fog" }` (lab wins).
  - `recommend(input, [3-layer tagged])` produces output that differs from `recommend(input)` — the lab signal flows into the engine via `resolveTaggedInputs` per the N=012 contract.
- **T12: PASS — N=016 regression intact:**
  - `recommend(input)` byte-identical to N=016 (engine pipeline untouched). `POST /api/recommend` without `taggedInputs` returns 2719 bytes JSON identical to `main`.
  - Apple Health upload card still renders on `/` (1 `data-testid="apple-health-upload"`).
  - Amazon `<FulfillButton>` still renders on each supplement card (5 buttons on the routine 5-supplement page).
  - `<SpeakToDoctorButton>` still renders conditionally: 0 on routine pages, 1 on escalation pages (female + fatigue).
  - N=007 PDF flow: `lib/labParser.ts`, `lib/labMapping.ts`, `components/LabUpload.tsx` diffs against `main` empty.
  - `lib/subscription.ts` DEV MODE comment unchanged.
  - `bash scripts/verify-audit-trail.sh` exits 0.

## End-to-end signal flow proof (three-layer priority resolved)

The Plugin Layer is now exercised against four plugins simultaneously across three Signal Stack layers:

1. **Behavior (N=001 onward)** — assessment form → `recommend(input)`.
2. **Wearable (N=014, Apple Health)** — XML upload → 7-day-window normalize → `TaggedUserInput[]` at `layer="wearable"`.
3. **Lab (N=017, lab placeholder)** — manual entry → range validate → `TaggedUserInput[]` at `layer="lab"`.
4. **Action layers (N=015 Amazon, N=016 telehealth)** — recommendation rendered → buttons route the user out via `/api/fulfillment/click`.

When all three signal layers tag the same `UserInput` field, the priority resolver from N=012 (`LAYER_WEIGHT.lab=3, .wearable=2, .behavior=1`) selects the lab value. The N=007 PDF flow (`applyLabOverrides` → mutated UserInput) and the new manual-entry flow (`parseManualLabValues` → TaggedUserInput at lab layer) both terminate in the same engine call without interfering with each other.

## Watcher summary

13/13 drift checks clean against `main` (`7de6d21`):

1. `package.json` + `package-lock.json` diff EMPTY (zero new deps)
2. Engine + Signal Stack core diffs EMPTY
3. N=014/N=015/N=016 plugins + N=007 lab parser/mapping/LabUpload diffs EMPTY
4. 22 other frozen `lib/*` files diff EMPTY
5. API routes: only new `/api/plugins/lab-placeholder` diffs; every other route EMPTY
6. Components: only `AssessmentForm` (44 lines) and the new `LabValuesEntry` diff
7. App pages + middleware + 7 config files + `.gitignore` + `scripts/verify-audit-trail.sh` + `.env.example` diffs EMPTY
8. `agent_state/AUDIT_TRAIL_PROTOCOL.md` unchanged
9. Banned-string scan in new code → 0 hits
10. Prior 5 Supabase migrations diff EMPTY
11. Byte-identical engine regression: 2719-byte JSON identical to `main`
12. `bash scripts/verify-audit-trail.sh` → exit 0
13. `npm run build` clean

## Required env vars

No additions this cycle. Manual entry runs entirely server-side from the route handler — no provider configuration, no API keys.

## Outcome

→ Open PR `N=017: Lab placeholder plugin integration, fourth plugin and first lab-tier signal source`.
→ Write `NEXT_018.md` proposing N=018 as the Whoop wearable plugin per the locked priority build order.
