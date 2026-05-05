// N=017: lab placeholder API endpoint. Validates manually entered
// biomarker values against physiological plausibility ranges, returns
// the corresponding TaggedUserInput[] at layer="lab". The route does
// not persist anything — values flow only into the active session's
// recommend call.
//
// Fail-silently rule (locked since N=014): unexpected internal errors
// produce 200 with an empty tagged array; range failures produce 400
// with a helpful message naming the offending biomarker.

import { NextResponse } from "next/server";

import {
  parseManualLabValues,
  validateManualLabValues,
} from "@/lib/plugins/labPlaceholder/manualEntry";
import type { ManualLabValue } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KNOWN_FIELDS: ReadonlyArray<keyof ManualLabValue> = [
  "ferritin_ng_ml",
  "vitamin_d_25oh_ng_ml",
  "b12_pg_ml",
  "magnesium_mg_dl",
  "tsh_uiu_ml",
];

// Coerces an arbitrary JSON body shape into a clean ManualLabValue.
// Accepts either { values: ManualLabValue } (per the contract's
// LabPlaceholderInput type) OR a flat ManualLabValue object directly.
// Unknown markers are silently dropped.
function coerceManualLabValue(body: unknown): ManualLabValue {
  if (!body || typeof body !== "object") return {};
  const record = body as Record<string, unknown>;
  const inner =
    record.values && typeof record.values === "object"
      ? (record.values as Record<string, unknown>)
      : record;
  const out: ManualLabValue = {};
  for (const field of KNOWN_FIELDS) {
    const v = inner[field];
    if (v === undefined || v === null || v === "") continue;
    const n = typeof v === "string" ? Number(v) : (v as number);
    if (typeof n !== "number" || !Number.isFinite(n)) continue;
    (out as Record<string, number>)[field] = n;
  }
  return out;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ tagged: [] });
  }

  const values = coerceManualLabValue(body);
  const validated = validateManualLabValues(values);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.message }, { status: 400 });
  }

  try {
    const tagged = parseManualLabValues(values);
    return NextResponse.json({ tagged });
  } catch {
    // Fail silently per the plugin layer contract.
    return NextResponse.json({ tagged: [] });
  }
}
