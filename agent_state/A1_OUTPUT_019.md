# A1_OUTPUT_019.md

**N:** 019 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n019-aYZje` **Predecessor:** N=018 head (`fa8631b`, PR #27 pending)

---

## SUMMARY

Sixth plugin integration. Oura is the **fourth signal plugin and third wearable signal source**, completing the wearable layer expansion per the locked priority build order. Five new files (tokenAuth, normalizer, plugin index, OuraConnect component, API route). Three surgical modifications: `lib/types.ts` (additive `OuraToken` + `OuraMetrics`), `lib/pluginRegistry.ts` (sixth entry seed), `components/AssessmentForm.tsx` (4th state slot + concatenate). Zero new dependencies. Engine + Signal Stack core + N=014–N=018 plugin code byte-identical.

The wearable layer now holds three coexisting plugins. **Three-way within-layer recency tie-break verified for the first time** — the locked N=012 resolver handles N plugins per layer without modification.

## COMMITS

```
946db4b  N=019 commander: define Oura plugin integration cycle
7e02c4e  N=019 architect: lock Oura plugin integration contract
3e6f63b  N=019 operator: add lib/plugins/oura/tokenAuth.ts (paste-token validation + minimal Oura API client)
fca73cc  N=019 operator: add lib/plugins/oura/normalizer.ts (sleep + readiness → wearable-layer TaggedUserInput[])
a39901f  N=019 operator: add lib/plugins/oura/index.ts (PluginNormalization at wearable layer)
1c4446d  N=019 operator: add components/OuraConnect.tsx (paste-token card with honest connection state)
b5cf019  N=019 operator: add app/api/plugins/oura/route.ts (POST endpoint validates + fetches + normalizes; never persists token)
5099c06  N=019 operator: register oura as 6th entry in lib/pluginRegistry.ts
298dce4  N=019 operator: mount OuraConnect below WhoopConnect + thread Oura tagged inputs in AssessmentForm
e47c61f  N=019 operator: add OuraToken + OuraMetrics to lib/types.ts (additive)
(this)   N=019 operator: write A1_OUTPUT_019.md manifest
```

## SMOKE-TEST VERIFICATION (26/26 PASS)

```
=== Oura plugin ===
PASS  validateOuraToken('') / 'malformed' / '   ' all return invalid with helpful error
PASS  normalizeOuraMetrics(poor sleep + low readiness) emits 2 wearable-layer entries
PASS  Oura entry 1: symptomToFix=poor-sleep at wearable layer
PASS  Oura entry 2: symptomToFix=fatigue at wearable layer
PASS  Oura entries carry confidence 0.85
PASS  normalizeOuraMetrics(good sleep + high readiness) emits 0 entries (confirms self-report)
PASS  normalizeOuraMetrics(nulls) → empty array
PASS  ouraPlugin shape: name=oura, layer=wearable, recency=7 days

=== Registry order ===
PASS  Registry length === 6
PASS  [0]=apple-health, [1]=amazon, [2]=telehealth, [3]=lab-placeholder, [4]=whoop, [5]=oura

=== Three-way wearable recency tie-break (T12) ===
PASS  Three-way wearable recency: Oura (newest 2026-05-04) wins → poor-sleep
PASS  Three-way wearable recency reordered: Whoop (now newest) wins → fatigue

=== Engine byte-identical regression ===
PASS  recommend(input) byte-identical to recommend(input, undefined) and recommend(input, [])
baseline_json_length=2711
```

## CONTRACT-SPIRIT-HONORING NOTES

1. **`app/api/plugins/oura/route.ts` is in the new-files list.** The architect contract specified four new files explicitly; the route slot was implicit since every plugin so far has its own route at `/api/plugins/<name>`. Documented here for transparency.
2. **`fetchOuraMetrics` returns `null` rather than throwing on any error path.** This matches the Whoop pattern from N=018 and the locked fail-silently rule.
3. **`OuraConnect` mirrors `WhoopConnect` verbatim per the N=018 binding pattern.** Five distinct states (idle / loading / connected / empty / invalid). The Connected state is gated on `tagged.length > 0`; empty data with valid token surfaces a distinct "No Oura data" state with `AlertCircle`; invalid token surfaces a distinct "Invalid token" state with `AlertCircle`.
4. **No new env vars.** The Oura API base URL `https://api.ouraring.com/v2` is publicly documented and constant. Token never persists server-side.

## VERIFICATION

- `npx tsc --noEmit` clean across all 10 source commits.
- 26/26 smoke tests PASS including three-way wearable recency tie-break.
- Engine byte-identical regression: `recommend(FIXTURE)` produces 2711-byte JSON identical when called with `undefined` / `[]` taggedInputs.
- Wearable layer now holds three plugins (Apple Health, Whoop, Oura) — verified via priority resolver tests.

## HANDOFF

→ Watcher reads this file, runs the drift gauntlet against N=018 head (`fa8631b`), invokes `bash scripts/verify-audit-trail.sh`.
→ Judge verifies all 14 acceptance criteria, runs live integration tests via curl + Playwright, captures mobile screenshots showing all four plugin cards stacked (Apple Health, lab, Whoop, Oura) on the assessment page, writes `TRUTH_RESULT_019.md` and `NEXT_020.md`.
