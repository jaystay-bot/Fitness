# S1_LOCKED_012.md

**N:** 012 **Hat:** ARCHITECT **Date:** 2026-05-04 **Status:** LOCKED

---

## SCOPE

### NEW FILES

| File | Purpose |
|------|---------|
| `/lib/signalLayers.ts` | SignalLayer const enum, LAYER_WEIGHT map, TaggedValue<T> generic type |
| `/lib/signalPriority.ts` | resolveTaggedInputs pure function; takes TaggedUserInput[], returns Partial<UserInput> |
| `/lib/pluginContract.ts` | PluginNormalization interface; PluginRegistration type |
| `/lib/pluginRegistry.ts` | Empty typed registry array; getActivePlugins() → PluginNormalization[] |

### MODIFIED FILES

| File | Change |
|------|--------|
| `/lib/engine.ts` | Add optional `taggedInputs?: TaggedUserInput[]` second param to `recommend`; when provided, call `resolveTaggedInputs` and merge result over input before engine logic runs |
| `/lib/types.ts` | Add `SignalLayer`, `TaggedValue<T>`, `TaggedUserInput`, `PluginNormalization`, `PluginRegistration` types (additive only, no existing type modified) |

### FROZEN FILES

`/lib/supplements.ts`, `/lib/conflicts.ts`, `/lib/variation.ts`, `/lib/confidence.ts`, `/lib/units.ts`, `/lib/slug.ts`, `/lib/timeline.ts`, `/lib/timelineData.ts`, `/lib/labParser.ts`, `/lib/labMapping.ts`, `/lib/scanner.ts`, `/lib/voice.ts`, `/lib/voiceParser.ts`, `/lib/bodySystems.ts`, `/lib/svgPositions.ts`, `/lib/subscription.ts`, `/lib/stripe.ts`. All `/app/api/*` routes frozen. All `/components/*` frozen including ResultCard, AssessmentForm, InteractiveTimeline, TimelineDayDetail, BottleScanner, BodyVisualization. `/app/pricing/page.tsx` frozen. `/tailwind.config.ts` frozen. `/app/globals.css` frozen. `/postcss.config.js` frozen. `/supabase/*` frozen. `/package.json` frozen — zero new dependencies.

---

## SIGNAL LAYERS CONTRACT (`/lib/signalLayers.ts`)

```ts
export const SignalLayer = {
  behavior: "behavior",
  wearable: "wearable",
  lab:      "lab",
} as const;
export type SignalLayer = (typeof SignalLayer)[keyof typeof SignalLayer];

export const LAYER_WEIGHT: Record<SignalLayer, number> = {
  behavior: 1,
  wearable: 2,
  lab:      3,
};

export interface TaggedValue<T> {
  value:      T;
  layer:      SignalLayer;
  confidence: number;   // [0, 1]
  timestamp:  string;   // ISO 8601
}
```

No default exports. No external imports. No side effects.

---

## PRIORITY RESOLUTION CONTRACT (`/lib/signalPriority.ts`)

```ts
export type TaggedUserInput = {
  [K in keyof UserInput]?: TaggedValue<UserInput[K]>;
};

export function resolveTaggedInputs(
  taggedInputs: TaggedUserInput[],
): Partial<UserInput>;
```

Rules:
1. For each field in UserInput, collect all tagged values that supply that field.
2. Select the value from the highest `LAYER_WEIGHT`. On ties (same layer), select the most recent `timestamp` (ISO string comparison, later wins).
3. Fields with no tagged source are absent from the returned object (undefined, not null).
4. Function is pure and synchronous. No mutations, no I/O.

---

## PLUGIN CONTRACT (`/lib/pluginContract.ts`)

```ts
export interface PluginNormalization {
  readonly name:    string;
  readonly layer:   SignalLayer;
  mapFields(rawOutput: unknown): Partial<TaggedUserInput>;
  calibrate(field: keyof UserInput): number;    // returns confidence [0,1]
  maxAgeMs(field: keyof UserInput): number;     // staleness threshold ms
}

export interface PluginRegistration {
  plugin:      PluginNormalization;
  registeredAt: string;  // ISO 8601
}
```

---

## PLUGIN REGISTRY CONTRACT (`/lib/pluginRegistry.ts`)

```ts
const _registry: PluginRegistration[] = [];

export function registerPlugin(plugin: PluginNormalization): void { ... }
export function getActivePlugins(): PluginNormalization[] { ... }
```

`_registry` starts empty. `getActivePlugins()` returns a snapshot array (not the live reference). No plugins are registered in this cycle.

---

## ENGINE INTEGRATION CONTRACT (`/lib/engine.ts`)

The `recommend` signature becomes:

```ts
export function recommend(
  input: UserInput,
  labValues?: LabValues,
  taggedInputs?: TaggedUserInput[],
): Recommendation
```

When `taggedInputs` is provided and non-empty:
1. Call `resolveTaggedInputs(taggedInputs)` to get `Partial<UserInput>`.
2. Merge: `const effectiveInput: UserInput = { ...input, ...resolved }`.
3. Pass `effectiveInput` through all existing engine logic unchanged.

When `taggedInputs` is absent or empty, `input` flows through exactly as today — byte-identical output guaranteed.

The `labValues` parameter position (second) is preserved. `taggedInputs` is a new third parameter. All existing callers pass zero, one, or two args — all remain valid.

---

## TYPES CONTRACT (`/lib/types.ts`)

Additive additions only. No existing type is modified. New exports appended at the end of the file:

- `SignalLayer` (re-export from signalLayers or define inline — must match)
- `TaggedValue<T>`
- `TaggedUserInput` (map of optional TaggedValue per UserInput key)
- `PluginNormalization` (re-export or define inline)
- `PluginRegistration` (re-export or define inline)

---

## ACCEPTANCE CRITERIA

| # | Criterion |
|---|-----------|
| 1 | `npm install` — zero new packages in node_modules delta |
| 2 | `npm run build` — zero errors, zero type errors |
| 3 | `recommend(input)` → byte-identical output to N=011 baseline (same seed, same picks, same confidence) |
| 4 | `recommend(input, undefined, [labTaggedFerritin])` where lab supplies ferritin → lab value used in effectiveInput |
| 5 | Two behavior-layer tagged inputs for same field, different timestamps → more recent wins |
| 6 | `getActivePlugins()` returns `[]` |
| 7 | A `PluginNormalization` implementation missing `maxAgeMs` → TypeScript compilation error |
| 8 | N=011 regression: 3-tier pricing renders, sticky CTA present, BottleScanner graceful 401/403, InteractiveTimeline mounts |

---

## BANNED THIS CYCLE

- Modifications to any frozen file
- New runtime dependencies (devDependencies only if needed for types)
- External API calls in any new module
- localStorage or sessionStorage
- Plugin registrations (no plugins exist)
- Changes to user-facing flow or components
