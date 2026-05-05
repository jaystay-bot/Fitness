import { LAYER_WEIGHT, type TaggedValue } from "./signalLayers";
import type { UserInput } from "./types";

export type TaggedUserInput = {
  [K in keyof UserInput]?: TaggedValue<UserInput[K]>;
};

/**
 * Resolves an array of tagged input objects into the effective UserInput
 * the engine will consume.
 *
 * For each UserInput field:
 *   - Selects the value from the highest LAYER_WEIGHT source.
 *   - Within a layer, the most recent ISO timestamp wins.
 *   - Fields absent from all sources are absent from the returned object.
 *
 * Pure, synchronous, no side effects.
 */
export function resolveTaggedInputs(
  taggedInputs: TaggedUserInput[],
): Partial<UserInput> {
  const resolved: Partial<UserInput> = {};

  if (taggedInputs.length === 0) return resolved;

  // Collect all (field, TaggedValue) pairs across all tagged inputs
  type FieldEntry = { tagged: TaggedValue<unknown>; field: keyof UserInput };
  const entries: FieldEntry[] = [];

  for (const tagged of taggedInputs) {
    for (const key of Object.keys(tagged) as (keyof UserInput)[]) {
      const tv = tagged[key];
      if (tv !== undefined) {
        entries.push({ tagged: tv as TaggedValue<unknown>, field: key });
      }
    }
  }

  // Group by field
  const byField = new Map<keyof UserInput, TaggedValue<unknown>[]>();
  for (const { field, tagged } of entries) {
    const arr = byField.get(field) ?? [];
    arr.push(tagged);
    byField.set(field, arr);
  }

  // For each field, pick highest layer weight; break ties by recency
  for (const [field, candidates] of byField) {
    let best = candidates[0];
    for (let i = 1; i < candidates.length; i++) {
      const c = candidates[i];
      const bestWeight = LAYER_WEIGHT[best.layer];
      const cWeight    = LAYER_WEIGHT[c.layer];
      if (cWeight > bestWeight) {
        best = c;
      } else if (cWeight === bestWeight && c.timestamp > best.timestamp) {
        best = c;
      }
    }
    (resolved as Record<string, unknown>)[field] = best.value;
  }

  return resolved;
}

// ---------------------------------------------------------------------------
// Unit tests — run with: npx ts-node --esm lib/signalPriority.ts
// (Only executed when this file is the entry point, not during Next.js build)
// ---------------------------------------------------------------------------
if (typeof require !== "undefined" && require.main === module) {
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(`FAIL: ${msg}`);
    console.log(`PASS: ${msg}`);
  };

  // T1: lab overrides behavior for the same field
  const t1: TaggedUserInput[] = [
    { age: { value: 30, layer: "behavior", confidence: 0.9, timestamp: "2026-01-01T00:00:00Z" } },
    { age: { value: 32, layer: "lab",      confidence: 0.99, timestamp: "2026-01-02T00:00:00Z" } },
  ];
  const r1 = resolveTaggedInputs(t1);
  assert(r1.age === 32, "lab value (32) overrides behavior value (30)");

  // T2: wearable overrides behavior
  const t2: TaggedUserInput[] = [
    { sleepHours: { value: 6, layer: "behavior", confidence: 0.7, timestamp: "2026-01-01T00:00:00Z" } },
    { sleepHours: { value: 7.5, layer: "wearable", confidence: 0.95, timestamp: "2026-01-01T00:00:00Z" } },
  ];
  const r2 = resolveTaggedInputs(t2);
  assert(r2.sleepHours === 7.5, "wearable value (7.5) overrides behavior (6)");

  // T3: within same layer, recency wins
  const t3: TaggedUserInput[] = [
    { weightKg: { value: 80, layer: "behavior", confidence: 0.8, timestamp: "2026-01-01T00:00:00Z" } },
    { weightKg: { value: 82, layer: "behavior", confidence: 0.8, timestamp: "2026-01-02T00:00:00Z" } },
  ];
  const r3 = resolveTaggedInputs(t3);
  assert(r3.weightKg === 82, "more recent behavior value (82) beats older (80)");

  // T4: empty input returns empty object
  const r4 = resolveTaggedInputs([]);
  assert(Object.keys(r4).length === 0, "empty input → empty resolved object");

  // T5: uncontested field passes through
  const t5: TaggedUserInput[] = [
    { primaryGoal: { value: "muscle", layer: "behavior", confidence: 0.9, timestamp: "2026-01-01T00:00:00Z" } },
  ];
  const r5 = resolveTaggedInputs(t5);
  assert(r5.primaryGoal === "muscle", "uncontested field passes through");

  console.log("\nAll signalPriority unit tests PASS");
}
