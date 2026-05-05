# CURRENT_012.md

**N:** 012 **Hat:** COMMANDER (Jay) **Date:** 2026-05-05 **Status:** ACTIVE **Predecessor:** N=011 (PASS, merged via PR #16; reconstructed N=009/N=010/N=011 entries are sealed)

---

## INTENT

N=012 establishes the **signal stack foundation** in the engine. No external integrations ship in this cycle. The user-facing flow is byte-identical to N=011. The cycle prepares the engine to consume input from multiple data sources (labs, wearables, behavior) against a stable contract that downstream plugin cycles (Apple Health, Oura, LabCorp, Quest, Amazon, telehealth) will conform to.

Three foundational additions, all internal:

**A — Tagged input system.**
Any value flowing into the engine can carry a triplet that names its provenance: a `layer` tag from the closed enum `behavior | wearable | lab`, a `confidence` score in `[0, 1]`, and an ISO 8601 `timestamp` recording when the value was observed. The wrapper type is generic (`TaggedValue<T>`) so it composes against any field shape — a number, a string, an enum value.

**B — Priority resolution function.**
A pure function `resolveTaggedInputs(tagged)` consumes an array of `TaggedUserInput` entries (each binding a `keyof UserInput` field to a `TaggedValue`) and produces the engine's effective input set. When two layers provide the same field, the higher-priority layer wins — `lab` (weight 3) overrides `wearable` (weight 2) overrides `behavior` (weight 1). When two entries share the same layer, the more recent ISO timestamp wins. Fields nobody provides return `undefined` (the engine still receives the original `UserInput` as a base, so unprovided fields fall through to the behavior-layer value the assessment form already collects).

**C — Plugin normalization contract.**
A typed `PluginNormalization` interface defines the shape an external plugin must implement before submitting data: a unique plugin name, a layer assignment (one of the three enum values), a `normalize(raw)` function that maps the plugin's raw output into `TaggedUserInput[]`, a `calibrateConfidence(raw)` function that returns a `[0, 1]` score, and a `recencyThresholdMs` describing the staleness threshold above which the plugin's data should be treated as stale. A typed `pluginRegistry` module starts empty; future cycles register plugins against the same contract without touching the engine.

The existing user-facing flow is unchanged. The assessment form continues to feed the engine via the prior `recommend(input)` signature; conceptually those inputs are now treated as the behavior layer, but no surface change is needed because `recommend` retains its single-argument backward-compatible call site.

## SCOPE BOUNDARY

Four new `lib/*` modules. Two surgical type extensions in `lib/types.ts`. One backward-compatible signature extension in `lib/engine.ts`. Nothing else moves. No new components, routes, migrations, or dependencies. No external API calls. No `localStorage`, `sessionStorage`, or analytics. No plugin registrations because no plugin implementations exist yet.

## SUCCESS DEFINITION

- `recommend(input)` (single-argument call) produces byte-identical output to N=011 for every input (regression must hold).
- `recommend(input, tagged)` with an empty array OR `undefined` is identical to single-argument behavior.
- `recommend(input, tagged)` with `lab`-layer entries for fields also present in `input` selects the lab values.
- `resolveTaggedInputs(tagged)` is pure, synchronous, deterministic.
- `pluginRegistry.getActivePlugins()` returns `[]` (length zero) at all times this cycle.
- TypeScript correctly rejects a registration object missing any required `PluginNormalization` field.
- All N=011 behaviors regress green (three-tier pricing, sticky CTA, progressive reveal, scanner graceful errors, InteractiveTimeline 30 s scrubber).

## CONSTRAINTS (Commander level)

- Engine purity preserved. `recommend` remains synchronous, deterministic, no I/O, no async, no fetch.
- Backward compatibility preserved. Every existing caller (`recommend(input)`) keeps compiling and runs identically.
- Zero new runtime dependencies.
- No frozen file is modified.
- No surface change. Anonymous-form-to-result-to-shareable-URL flow byte-identical.
- No plugin implementations ship in this cycle. The registry starts empty and stays empty until N=014+.

## HANDOFF

→ Architect writes `/agent_state/S1_LOCKED_012.md`. All prior locked contracts remain binding.
