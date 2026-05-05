# S1_LOCKED_012.md

**N:** 012 **Hat:** ARCHITECT **Status:** LOCKED — NO DRIFT ALLOWED **Predecessors:** S1_LOCKED.md · S1_LOCKED_002..S1_LOCKED_011.md (all still binding)

This document is *additive*. Prior locked contracts remain in force, except where this document explicitly unfreezes a single file for surgical edit.

---

## SCOPE

Establish the signal stack foundation. Four new `lib/*` modules. Two surgical extensions in `lib/types.ts`. One backward-compatible signature extension in `lib/engine.ts`. Nothing else moves. The user-facing flow is byte-identical to N=011.

## NEW FILES ALLOWED THIS CYCLE (no others)

```
lib/signalLayers.ts        SignalLayer enum + LAYER_WEIGHT + TaggedValue<T> generic
lib/signalPriority.ts      pure resolveTaggedInputs(tagged) -> Partial<UserInput>
lib/pluginContract.ts      PluginNormalization interface + helper guards
lib/pluginRegistry.ts      typed registry (starts empty) + getActivePlugins()
agent_state/CURRENT_012.md
agent_state/S1_LOCKED_012.md
agent_state/A1_OUTPUT_012.md
agent_state/TRUTH_RESULT_012.md
agent_state/NEXT_013.md     written by the Judge if all 8 criteria PASS
```

No new components. No new routes. No new migrations. No new Python files. No new dependencies.

## FILES MODIFIED THIS CYCLE (only these)

```
lib/types.ts        additive: TaggedUserInput<K> interface re-exporting
                    SignalLayer/TaggedValue from lib/signalLayers.ts so the
                    engine surface stays self-contained. No existing type
                    field changes shape. UserInput is byte-identical.
lib/engine.ts       backward-compatible signature extension on `recommend`.
                    Replaces the existing reserved-but-unused `labValues?`
                    second parameter (added in N=007 as `void labValues;`)
                    with `taggedInputs?: TaggedUserInput[]`. The change is
                    safe because zero callers in the codebase pass the old
                    `labValues` arg — `applyLabOverrides` runs on the input
                    BEFORE recommend is invoked. Single-argument behavior
                    is byte-identical to N=011.
agent_state/SESSION_LOG.md   append the N=012 cycle entries
```

## FROZEN — DO NOT TOUCH

- `lib/supplements.ts`, `lib/conflicts.ts`, `lib/variation.ts`, `lib/confidence.ts`, `lib/units.ts`, `lib/slug.ts`, `lib/timeline.ts`, `lib/timelineData.ts`, `lib/labParser.ts`, `lib/labMapping.ts`, `lib/scanner.ts`, `lib/voice.ts`, `lib/voiceParser.ts`, `lib/bodySystems.ts`, `lib/svgPositions.ts`, `lib/subscription.ts`, `lib/spearCopy.ts`, `lib/feedback.ts`, `lib/stripe.ts`, `lib/proAccess.ts`, `lib/supabase.ts`, `lib/email.ts`, `lib/nutrition.ts`, `lib/verdict.ts`
- All API routes from N=001..N=011 (`/api/recommend`, `/api/og`, `/api/checkout`, `/api/webhooks/stripe`, `/api/webhooks/clerk`, `/api/subscription`, `/api/email/result`, `/api/labs/parse`, `/api/labs/recompute`, `/api/scanner/identify`, `/api/feedback/submit`)
- All components (every `.tsx` file under `components/`), including `InteractiveTimeline`, `TimelineDayDetail`, `BottleScanner`, `LabUpload`, `ResultCard`, `AssessmentForm`, `Hero`, `SpearHero`, `SymptomEntry`, `VaultDashboard`, `UninsuranceThesis`, `FeedbackWidget`, `FeedbackForm`
- All app routes (`app/page.tsx`, `app/layout.tsx`, `app/r/[slug]/page.tsx`, `app/pricing/page.tsx`, `app/account/page.tsx`, `app/admin/feedback/page.tsx`, sign-in / sign-up)
- `tailwind.config.ts`, `app/globals.css`, `postcss.config.js`, `next.config.js`, `tsconfig.json`, `middleware.ts`, `vercel.json`, `package.json`, `package-lock.json`
- All Supabase migrations (0001 + 0002 + 0003), all Python services in `python/`

## SIGNAL LAYERS CONTRACT — `lib/signalLayers.ts`

```ts
export type SignalLayer = "behavior" | "wearable" | "lab";

// Higher weight overrides lower weight when two layers provide the same field.
export const LAYER_WEIGHT: Readonly<Record<SignalLayer, number>> = Object.freeze({
  behavior: 1,
  wearable: 2,
  lab: 3,
});

export interface TaggedValue<T = unknown> {
  value: T;
  layer: SignalLayer;
  confidence: number;     // [0, 1] inclusive
  timestamp: string;      // ISO 8601 (e.g., "2026-05-05T12:00:00Z")
}

export function isValidConfidence(v: unknown): v is number;
export function isValidTimestamp(v: unknown): v is string;
```

Pure module. No I/O, no imports outside TypeScript built-ins, no `'use client'`.

## PRIORITY RESOLUTION CONTRACT — `lib/signalPriority.ts`

```ts
import type { TaggedUserInput } from "./types";

// Pure deterministic resolver. No I/O, no clock reads, no randomness.
//
// Semantics:
//   1. Group tagged entries by `field`.
//   2. Within each group, sort by LAYER_WEIGHT descending; ties broken by
//      ISO timestamp descending (most recent wins).
//   3. The top entry's `value` becomes the resolved value for that field.
//   4. Fields with zero entries are absent in the returned partial.
//
// Returns a Partial<UserInput> so the caller (engine.ts) can spread it
// over the original UserInput to produce the effective input set.
export function resolveTaggedInputs(
  tagged: ReadonlyArray<TaggedUserInput>,
): Partial<UserInput>;
```

Pure module. Imports only types. No `'use client'`.

## PLUGIN CONTRACT — `lib/pluginContract.ts`

```ts
import type { SignalLayer } from "./signalLayers";
import type { TaggedUserInput } from "./types";

// Every plugin (Apple Health, Oura, Whoop, LabCorp, Quest, telehealth, …)
// must implement this exact interface before its data may flow into the
// engine. Required fields are non-optional so a TypeScript registration
// missing any field produces a compile-time error.
export interface PluginNormalization<TRaw = unknown> {
  /** Stable identifier, e.g. "apple-health", "oura", "labcorp". */
  readonly name: string;

  /** Which layer this plugin's data is tagged with at ingestion time. */
  readonly layer: SignalLayer;

  /**
   * Pure function. Maps the plugin's raw output (whatever shape the
   * upstream service emits) into a list of TaggedUserInput entries
   * binding UserInput fields to their tagged values.
   */
  normalize(raw: TRaw): TaggedUserInput[];

  /** Pure function. Returns a confidence in [0, 1] for a given raw payload. */
  calibrateConfidence(raw: TRaw): number;

  /**
   * Maximum age, in milliseconds, that the upstream payload's own
   * timestamp may have before it is treated as stale. Plugins use this
   * to drop wearable data older than the configured window.
   */
  readonly recencyThresholdMs: number;
}

// Pure type-guard helper exported for tests + future plugin authors.
export function isPluginNormalization(value: unknown): value is PluginNormalization;
```

Pure module. No I/O, no `'use client'`.

## PLUGIN REGISTRY CONTRACT — `lib/pluginRegistry.ts`

```ts
import type { PluginNormalization } from "./pluginContract";

// Mutable registry. Starts EMPTY and stays empty in N=012; future cycles
// (N=014+) call `registerPlugin` to wire concrete adapters. The engine
// does NOT import this module — registries are read by API routes that
// orchestrate plugin ingestion in later cycles. Keeping the registry
// out of the pure engine preserves engine purity.
const registered: PluginNormalization[] = [];

export function registerPlugin(plugin: PluginNormalization): void;
export function getActivePlugins(): ReadonlyArray<PluginNormalization>;
export function clearRegistry(): void; // test-only helper
```

Module-scoped state is intentional and acceptable: the registry is a build-time/runtime singleton, not user state. No persistence. No `'use client'`.

## TYPE EXTENSIONS — `lib/types.ts`

Append the following at the bottom of the file. No existing line moves.

```ts
// N=012: signal-stack tagged input types — additive only.

// Re-exported here so engine consumers don't need to import from
// `signalLayers.ts` separately. The canonical definitions live in
// `lib/signalLayers.ts`.
export type { SignalLayer, TaggedValue } from "./signalLayers";

/**
 * A tagged binding of one UserInput field to a value carrying its
 * source layer, confidence, and timestamp. The generic parameter K
 * preserves type safety at construction sites — e.g. a TaggedUserInput<"age">
 * has `value: number` automatically.
 */
export interface TaggedUserInput<K extends keyof UserInput = keyof UserInput> {
  field: K;
  value: UserInput[K];
  layer: import("./signalLayers").SignalLayer;
  confidence: number;     // [0, 1]
  timestamp: string;      // ISO 8601
}
```

`UserInput` itself does NOT change shape. The 11 fields are byte-identical. No new field is added. No field type widens or narrows.

## ENGINE INTEGRATION — `lib/engine.ts`

The current signature is:

```ts
export function recommend(
  input: UserInput,
  labValues?: import("./types").LabValues,
): Recommendation
```

The N=007 `labValues` parameter has always been a no-op (`void labValues;`) and is never invoked by any caller in this codebase (`grep -n "recommend("` confirms 5 call sites, all single-argument). Replacing it with the tagged-inputs parameter is therefore safe.

New signature:

```ts
export function recommend(
  input: UserInput,
  taggedInputs?: ReadonlyArray<import("./types").TaggedUserInput>,
): Recommendation
```

Body change (additive only — every existing line beneath the merge step is byte-identical):

```ts
const effective: UserInput = (taggedInputs && taggedInputs.length > 0)
  ? { ...input, ...resolveTaggedInputs(taggedInputs) }
  : input;
const variationSeed = hashInput(effective);
const baseStack    = buildStack(effective);
const variedStack  = applyVariation(baseStack, variationSeed, effective);
// … remainder of the body uses `effective` everywhere `input` was used.
```

Backward compatibility:

- When `taggedInputs` is `undefined` or an empty array, `effective === input` (same reference, no allocation), and every downstream computation is byte-identical to N=011.
- The five existing call sites (`recommend(input)`) compile unchanged.
- No new types are required at any call site.

## ACCEPTANCE CRITERIA (Judge will verify all 8)

1. `npm install` succeeds. Zero new dependencies. `git diff main -- package.json package-lock.json` is empty.
2. `npm run build` succeeds with zero errors.
3. `recommend(input)` for a fixed sample input produces output byte-identical to N=011 head (`56c13d4`). Verified by snapshotting the JSON.
4. `recommend(input, tagged)` where `tagged` contains both a `lab`-layer entry and a `behavior`-layer entry for the same field, with different values, produces a result computed against the lab-layer value (proven by hashing the input the engine actually used).
5. `resolveTaggedInputs(tagged)` with two `behavior`-layer entries for the same field, distinguished only by ISO timestamp, returns the more-recent-timestamp value.
6. `pluginRegistry.getActivePlugins()` returns an array of length 0 with no implementations registered this cycle.
7. A test that constructs a `PluginNormalization` registration object missing any required field FAILS to compile (`tsc --noEmit` rejects). Verified by a tracked file with the failure example commented out so the regular build stays green; the Judge uncomments it for the type-check verification.
8. All N=011 behaviors regress green: anonymous form-to-result flow renders, three-tier `/pricing` copy intact, sticky CTA on `/r/[slug]` intact, `BottleScanner` graceful-degradation path intact, `InteractiveTimeline` renders 30 s scrubber + Play/Pause/Rewind/Step controls.

## BANNED THIS CYCLE

- Modifications to any file in the FROZEN list
- Any new runtime dependency
- External API calls or `fetch` from any new module
- `localStorage`, `sessionStorage`, `document.cookie`
- Analytics SDKs (Segment, GA, Mixpanel, etc.)
- Plugin registrations (no concrete plugin implementations exist yet — the registry stays empty)
- Any change to user-facing flow
- The string `"AI-powered"`
- `from-purple-` / `to-purple-` Tailwind classes

## OPERATOR INSTRUCTIONS — Atomic commits per file group

```
1.  N=012 operator: add lib/signalLayers.ts (SignalLayer enum + LAYER_WEIGHT + TaggedValue<T>)
2.  N=012 operator: add lib/signalPriority.ts (pure resolveTaggedInputs)
3.  N=012 operator: add lib/pluginContract.ts (PluginNormalization interface + guard)
4.  N=012 operator: add lib/pluginRegistry.ts (typed singleton registry, starts empty)
5.  N=012 operator: extend lib/types.ts with TaggedUserInput (additive)
6.  N=012 operator: wire taggedInputs into recommend() with byte-identical fallback
7.  N=012 operator: write A1_OUTPUT_012.md manifest
```

## HANDOFF

→ Sentinel reads this file and emits GATE: OPEN or GATE: BLOCK.
