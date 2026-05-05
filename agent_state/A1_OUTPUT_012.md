# A1_OUTPUT_012.md

**N:** 012 **Hat:** OPERATOR **Date:** 2026-05-05 **Branch:** `claude/apex-protocol-n012-aYZje` **Predecessor:** main @ `56c13d4` (post-N=011 + email allowlist)

---

## SUMMARY

Six atomic source commits + Commander/Architect/Sentinel/Operator state commits, implementing the signal stack foundation. Four new pure `lib/*` modules. Two surgical extensions to `lib/types.ts`. One backward-compatible signature swap on `recommend`. Zero new dependencies. Zero frozen-file modifications. The user-facing flow is byte-identical to N=011.

## COMMITS

```
aef646a  N=012 commander: define signal stack foundation cycle
2b6151e  N=012 architect: lock signal stack foundation contract
1288c9b  N=012 operator: add lib/signalLayers.ts (SignalLayer enum + LAYER_WEIGHT + TaggedValue<T>)
e34f31c  N=012 operator: add lib/signalPriority.ts (pure resolveTaggedInputs)
905cf1f  N=012 operator: add lib/pluginContract.ts (PluginNormalization interface + guard)
4ef14ee  N=012 operator: add lib/pluginRegistry.ts (typed singleton registry, starts empty)
10f990f  N=012 operator: extend lib/types.ts with TaggedUserInput (additive)
65b1387  N=012 operator: wire taggedInputs into recommend() with byte-identical fallback
(this)   N=012 operator: write A1_OUTPUT_012.md manifest
```

## FILES TOUCHED

```
A  lib/signalLayers.ts          SignalLayer enum + LAYER_WEIGHT + TaggedValue<T> + validators
A  lib/signalPriority.ts        pure resolveTaggedInputs(tagged) -> Partial<UserInput>
A  lib/pluginContract.ts        PluginNormalization interface + isPluginNormalization guard
A  lib/pluginRegistry.ts        registerPlugin / getActivePlugins / clearRegistry (starts empty)
M  lib/types.ts                 +18 lines additive: re-export SignalLayer/TaggedValue, declare TaggedUserInput<K>
M  lib/engine.ts                +1 import line, signature change (labValues? -> taggedInputs?), body uses `effective`
A  agent_state/CURRENT_012.md
A  agent_state/S1_LOCKED_012.md
A  agent_state/A1_OUTPUT_012.md  (this file)
M  agent_state/SESSION_LOG.md   append N=012 entries
```

Diff against `main` (`56c13d4`) is empty for every other tracked file. Verified by `git diff main --name-only` + manual cross-check.

## CONTRACT-SPIRIT-HONORING NOTES

1. The contract specified the `recommend` second parameter become `TaggedUserInput[]`. The function previously had `labValues?: LabValues` as second parameter (introduced in N=007 with `void labValues;` and unused by every caller in the repo). Replacing it preserves the "second parameter" wording and is runtime-safe because zero callers pass `labValues` — `applyLabOverrides` runs on the input BEFORE `recommend` is invoked. The `LabValues` type itself is preserved in `lib/types.ts` and remains used by `lib/labParser.ts` and `lib/labMapping.ts`.
2. Backward compatibility verified by direct snapshot comparison: `recommend(FIXTURE)` on `main` produces byte-identical JSON to `recommend(FIXTURE)` on this branch (2720 bytes, 0-byte diff).
3. `pluginRegistry.ts` is intentionally not imported by `lib/engine.ts`. Engine purity is preserved: the registry is read by future cycles' API routes that orchestrate plugin ingestion, transforming raw plugin output into `TaggedUserInput` entries that are then passed into `recommend(input, taggedInputs)`. The pure recommendation pipeline never sees the registry directly.
4. `lib/signalPriority.ts` is fully deterministic: no clock reads, no randomness, no I/O. Tied timestamps within the same layer break consistently via lexicographic ISO 8601 comparison.

## VERIFICATION

- `npx tsc --noEmit` clean (zero errors).
- Engine smoke (executed against the live `lib/engine.ts` via `tsx`):
  - `recommend(input) === recommend(input, undefined) === recommend(input, [])` — all three produce identical JSON (string-equal).
  - `recommend(input, [{field:'primaryGoal', value:'muscle', layer:'lab', confidence:0.95, timestamp:...}])` produces a different recommendation, with the supplement stack changing from energy-core (B12, Vitamin D3, Magnesium glycinate) to muscle-core (Vitamin D3, B12, Creatine, Whey/plant protein, Magnesium glycinate, Citrulline malate).
  - Lab-vs-behavior priority resolves the lab value: when both layers tag `sleepHours` with different values, the lab value flows through to `nutrition.dailyTargets.sleepHours` (verified at `7.5` for goal `energy`).
  - Recency tie-break works within the same layer: when two `behavior`-layer entries set `primaryGoal` at different ISO timestamps, the more-recent timestamp's value wins (verified by checking the resulting supplement stack matches `fat-loss` rather than `muscle`).
- Byte-identical regression: `recommend(FIXTURE)` on `main` (`56c13d4`) produces JSON identical to `recommend(FIXTURE)` on this branch (2720 bytes, `diff` returns no output).

## HANDOFF

→ Watcher reads this file and runs the drift gauntlet against `56c13d4`.
→ Judge reads `S1_LOCKED_012.md` and verifies the 8 acceptance criteria, runs the full N=011 regression, writes `TRUTH_RESULT_012.md` and (if PASS) `NEXT_013.md`, and opens the N=012 PR.
