// N=012: pure priority resolver. No I/O, no clock reads, no randomness.
//
// Semantics:
//   1. Group tagged entries by `field`.
//   2. Within each group, sort by LAYER_WEIGHT descending; ties broken
//      by ISO timestamp descending (most recent wins).
//   3. The top entry's `value` becomes the resolved value for that field.
//   4. Fields with zero entries are absent in the returned partial.
//
// The caller (engine.ts) spreads the returned Partial<UserInput> over
// the user-supplied UserInput so unprovided fields fall through to the
// behavior-layer value the assessment form already collected.

import { LAYER_WEIGHT, type SignalLayer } from "./signalLayers";
import type { TaggedUserInput, UserInput } from "./types";

function compareDescending(
  a: TaggedUserInput,
  b: TaggedUserInput,
): number {
  const wa = LAYER_WEIGHT[a.layer as SignalLayer] ?? 0;
  const wb = LAYER_WEIGHT[b.layer as SignalLayer] ?? 0;
  if (wa !== wb) return wb - wa;
  // Lexicographic ISO 8601 comparison reproduces chronological order
  // for any two well-formed RFC 3339 timestamps with the same resolution.
  if (a.timestamp > b.timestamp) return -1;
  if (a.timestamp < b.timestamp) return 1;
  return 0;
}

export function resolveTaggedInputs(
  tagged: ReadonlyArray<TaggedUserInput>,
): Partial<UserInput> {
  if (!tagged || tagged.length === 0) return {};

  const byField = new Map<keyof UserInput, TaggedUserInput[]>();
  for (const entry of tagged) {
    const list = byField.get(entry.field);
    if (list) list.push(entry);
    else byField.set(entry.field, [entry]);
  }

  const out: Partial<UserInput> = {};
  for (const [field, entries] of byField) {
    if (entries.length === 0) continue;
    const winner = entries.reduce((best, current) =>
      compareDescending(current, best) < 0 ? current : best,
    );
    // The cast is sound because the constructor type of TaggedUserInput<K>
    // forces `value: UserInput[K]` for the field K it binds to.
    (out as Record<keyof UserInput, unknown>)[field] = winner.value;
  }

  return out;
}
