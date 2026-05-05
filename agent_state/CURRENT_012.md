# CURRENT_012.md

**N:** 012 **Hat:** COMMANDER **Date:** 2026-05-04 **Status:** ACTIVE

---

## INTENT

Establish the Signal Stack and Plugin Layer foundation. This cycle adds no user-facing features. It creates the structural substrate that all future plugin cycles will build against.

Three foundational additions:

1. **Tagged input system** — any UserInput field may be marked with its source layer (behavior / wearable / lab), a confidence score [0,1], and an ISO recency timestamp. The assessment form continues to supply behavior-layer inputs. The layer tag travels with the value rather than being inferred after the fact.

2. **Priority resolution function** — a pure function that consumes an array of tagged inputs and produces the resolved UserInput the engine will use. Labs override wearables override behavior. Within a layer, recency wins. Fields with no tagged source return undefined and the engine falls back to its existing defaults. The function is deterministic and has no side effects.

3. **Plugin normalization contract** — an interface that every future plugin must implement before it may submit data to the engine. The contract requires: plugin name, layer assignment, a field-mapping function that converts the plugin's raw output into TaggedValue objects, a confidence calibration function, and a recency function that determines the staleness threshold. A typed registry holds all registered implementations; it starts empty in this cycle.

The existing user-facing flow is unchanged. The assessment form feeds UserInput tagged as behavior layer, which is the lowest priority and therefore matches current behavior exactly when no higher-priority data exists.

## DELIVERABLES

Four new lib files:
- `/lib/signalLayers.ts` — SignalLayer enum, priority weights, TaggedValue type
- `/lib/signalPriority.ts` — resolveTaggedInputs pure function
- `/lib/pluginContract.ts` — PluginNormalization interface
- `/lib/pluginRegistry.ts` — empty typed registry + getActivePlugins

Two modified lib files:
- `/lib/engine.ts` — optional TaggedUserInput[] second parameter; calls resolveTaggedInputs when provided; backward-compatible
- `/lib/types.ts` — TaggedUserInput, SignalLayer, PluginNormalization, PluginRegistration types added

## SUCCESS DEFINITION

npm run build passes with zero errors. `recommend(input)` with no tagged inputs produces byte-identical output to N=011. `recommend(input, taggedInputs)` where lab provides a higher-priority field uses the lab value. Plugin registry starts empty. A plugin missing required interface fields fails TypeScript compilation.

## HANDOFF

→ Architect (N=012) reads this file and writes S1_LOCKED_012.md.
