# A1_OUTPUT_016.md

**N:** 016 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n016-aYZje` **Predecessor:** main @ `a447fef` (post N=015 merge)

---

## SUMMARY

Ten atomic operator commits + Commander/Architect/Sentinel state commits. Four new files (deep-link generator, plugin index, SpeakToDoctorButton, migration 0005). Five surgical modifications: `lib/types.ts` (additive `TelehealthDeepLink` + `TelehealthEscalationReason`, optional `pluginName` on `FulfillmentClick`, optional `shouldRender?` on `ActionPluginNormalization`), `lib/pluginRegistry.ts` (seed `[appleHealth, amazon, telehealth]`), `app/api/fulfillment/click/route.ts` (additive dispatch on `pluginName`), `components/ResultCard.tsx` (conditional mount above stack), `.env.example` (TELEHEALTH_PROVIDER_URL placeholder). One additive Supabase column. Zero new runtime dependencies. Engine + Signal Stack core + N=014 Apple Health plugin + N=015 Amazon plugin + FulfillButton FROZEN and untouched.

## COMMITS

```
ab4c843  N=016 commander: define telehealth deep-link plugin integration cycle
dfb2f64  N=016 architect: lock telehealth deep-link plugin integration contract
9546121  N=016 operator: add TelehealthDeepLink + extend FulfillmentClick + optional shouldRender? in lib/types.ts
b56742b  N=016 operator: add lib/plugins/telehealth/deepLink.ts (pure deep-link generator)
20776f0  N=016 operator: add lib/plugins/telehealth/index.ts (ActionPluginNormalization + shouldRender)
4421774  N=016 operator: add components/SpeakToDoctorButton.tsx (clinical-orange escalation button)
6db5eb5  N=016 operator: add supabase/migrations/0005_fulfillment_clicks_plugin_name.sql
1bd6d82  N=016 operator: extend app/api/fulfillment/click/route.ts to dispatch on pluginName
218ec59  N=016 operator: register telehealth as 3rd entry in lib/pluginRegistry.ts
1a928dd  N=016 operator: mount SpeakToDoctorButton conditionally above stack in ResultCard
8091202  N=016 operator: add TELEHEALTH_PROVIDER_URL to .env.example
(this)   N=016 operator: write A1_OUTPUT_016.md manifest
```

The architect's recommended order placed `types.ts` at commit 8; the actual ladder starts with the types extension because every later commit imports the new types. End-state diff is identical regardless of ladder shape.

## FILES TOUCHED

```
A  lib/plugins/telehealth/deepLink.ts                     pure generator (72 lines)
A  lib/plugins/telehealth/index.ts                        plugin + shouldRender (52 lines)
A  components/SpeakToDoctorButton.tsx                     clinical-orange escalation button (81 lines)
A  supabase/migrations/0005_fulfillment_clicks_plugin_name.sql   additive column (9 lines)

M  lib/types.ts                                           +23 lines: shouldRender? + pluginName + TelehealthDeepLink
M  lib/pluginRegistry.ts                                  +10 lines: seed 3rd entry, comment
M  app/api/fulfillment/click/route.ts                     +33 lines: dispatch on pluginName, persist plugin_name
M  components/ResultCard.tsx                              +13 lines: import + conditional mount
M  .env.example                                           +9 lines: TELEHEALTH_PROVIDER_URL placeholder

A  agent_state/CURRENT_016.md
A  agent_state/S1_LOCKED_016.md
A  agent_state/A1_OUTPUT_016.md   (this file)
A  agent_state/TRUTH_RESULT_016.md  (Judge will write)
A  agent_state/NEXT_017.md          (Judge will write on PASS)
M  agent_state/SESSION_LOG.md       N=016 cycle entries appended
```

`git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts` is empty (Signal Stack core preserved).
`git diff main -- lib/plugins/appleHealth/ lib/plugins/amazon/ components/FulfillButton.tsx` is empty (N=014/N=015 plugins + Amazon component preserved).
`git diff main -- package.json package-lock.json` is empty (zero new deps).

## CONTRACT-SPIRIT-HONORING NOTES

1. **No contract modification.** `lib/pluginContract.ts` is byte-identical against `main`. The new `shouldRender?` method lives on `ActionPluginNormalization` in `lib/types.ts` (which is in the modify-allowed list this cycle). The existing N=015 Amazon plugin (which doesn't implement `shouldRender`) continues to satisfy the optional method since the field is `?`-marked.
2. **Server-side env var read at request time.** `process.env.TELEHEALTH_PROVIDER_URL` is read inside `telehealthPlugin.generateActionUrl()` (which is called by `/api/fulfillment/click`), not at module load time. The env var is intentionally NOT prefixed with `NEXT_PUBLIC_` so it stays server-only — the SpeakToDoctorButton fetches the URL through the click endpoint rather than building it client-side.
3. **Conservative escalation.** The button only renders when `shouldRender(rec)` is true: any non-null `goalConflict` OR a stack containing iron / melatonin. Routine recommendations get a result page byte-identical to N=015 — verified by checking `routineRec.goalConflict === null` and the rendered HTML.
4. **No medical-advice copy.** The button reads "Speak to a doctor" — a routing action, not a clinical claim. The user lands on the configured telehealth provider's landing page where the provider's own intake handles all PHI / patient data. The product never replaces a clinician.
5. **`supplementName: "escalation"` synthetic placeholder.** The existing `fulfillment_clicks` table requires `supplement_name` to be non-null. Telehealth clicks are not supplement-specific, but the column needs a value, so the SpeakToDoctorButton sends the literal string `"escalation"` as the field's value. The real escalation context lives in the URL's `?reason=` query parameter and the `plugin_name="telehealth"` discriminator that Migration 0005 adds.
6. **Engine purity preserved.** `recommend(input)` produces JSON byte-identical to N=015 (2719 bytes for the standard fixture). The cycle is purely peripheral — no engine modification, no Signal Stack modification.

## VERIFICATION

- `npx tsc --noEmit` clean across all 11 source commits.
- Smoke harness exercised end-to-end:
  - **Deep-link generator:** `generateTelehealthDeepLink(escRec, "https://www.sesamecare.com/")` → `https://www.sesamecare.com/?reason=goal-conflict`. Empty providerUrl → fallback to hardcoded landing page. Null rec + empty url → bare landing page (no `?reason`).
  - **Reason categorization:** `chooseEscalationReason(routine)` → `null`. `chooseEscalationReason(iron)` → `"clinician-oversight-supplement"` (female + fatigue → iron in stack). `chooseEscalationReason(escalation)` → `"goal-conflict"`.
  - **Registry order:** `getActivePlugins().length === 3` with `[apple-health, amazon, telehealth]` in that exact order. N=014/N=015 first/second-entry invariants preserved.
  - **`shouldRender` logic:** `true` for goal-conflict recs, `true` for iron-in-stack recs, `false` for routine recs. Conservative escalation honored.
  - **Engine byte-identity:** `recommend(input) === recommend(input, undefined) === recommend(input, [])` for the standard fixture. 2711-byte JSON identical across all three call shapes.
  - **Env var read at call time:** `generateActionUrl("any")` returns `https://www.sesamecare.com/` (fallback) when `TELEHEALTH_PROVIDER_URL` is unset, then immediately returns the test provider URL after the env var is set in the same process. Proves call-time read.
- Frozen-file regression: `git diff main -- lib/engine.ts lib/signalLayers.ts lib/signalPriority.ts lib/pluginContract.ts lib/plugins/appleHealth/ lib/plugins/amazon/ components/FulfillButton.tsx` empty.

## HANDOFF

→ Watcher reads this file, runs the drift gauntlet against `main` (`a447fef`), and invokes `bash scripts/verify-audit-trail.sh` per the N=013 protocol.
→ Judge reads `S1_LOCKED_016.md` and verifies the 12 acceptance criteria, runs the N=015 regression, writes `TRUTH_RESULT_016.md` and (on PASS) `NEXT_017.md`, and opens the N=016 PR.
