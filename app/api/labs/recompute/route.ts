import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { recommend } from "@/lib/engine";
import { applyLabOverrides, describeOverrides } from "@/lib/labMapping";
import { decodeSlug } from "@/lib/slug";
import { getSupabaseAdmin } from "@/lib/supabase";
import type {
  LabValues,
  Recommendation,
  SupplementPick,
} from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  slug?: unknown;
  labValues?: unknown;
}

function pickByName(supps: SupplementPick[], name: string): SupplementPick | undefined {
  return supps.find((s) => s.name === name);
}

function diff(original: Recommendation, adjusted: Recommendation) {
  const origNames = new Set(original.supplements.map((s) => s.name));
  const adjNames = new Set(adjusted.supplements.map((s) => s.name));
  const added = adjusted.supplements
    .filter((s) => !origNames.has(s.name))
    .map((s) => s.name);
  const removed = original.supplements
    .filter((s) => !adjNames.has(s.name))
    .map((s) => s.name);
  const confidenceDeltas: { name: string; before: number; after: number }[] = [];
  for (const a of adjusted.supplements) {
    const o = pickByName(original.supplements, a.name);
    if (o && o.confidence !== a.confidence) {
      confidenceDeltas.push({
        name: a.name,
        before: o.confidence,
        after: a.confidence,
      });
    }
  }
  return { addedSupplements: added, removedSupplements: removed, confidenceDeltas };
}

async function getUserId(): Promise<string | null> {
  try {
    return auth().userId ?? null;
  } catch {
    return null;
  }
}

async function getTier(
  clerkUserId: string,
): Promise<"free" | "pro"> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return "free";
  const { data } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  return ((data?.tier as "free" | "pro" | undefined) ?? "free");
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }
  const tier = await getTier(userId);
  if (tier !== "pro") {
    return NextResponse.json(
      { error: "Pro tier required.", upgrade_url: "/pricing" },
      { status: 403 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.slug !== "string" || !body.slug) {
    return NextResponse.json({ error: "slug is required." }, { status: 400 });
  }
  const decoded = decodeSlug(body.slug);
  if (!decoded) {
    return NextResponse.json(
      { error: "slug does not decode to a valid input." },
      { status: 400 },
    );
  }
  const labValues = (body.labValues ?? {}) as LabValues;

  const original = recommend(decoded);
  const overridden = applyLabOverrides(decoded, labValues);
  // The engine's optional `labValues` parameter is added in commit 11; the
  // override semantics are already produced by `applyLabOverrides` translating
  // lab values into the existing UserInput enum surface, so a single-arg call
  // is sufficient and forwards-compatible.
  const adjusted = recommend(overridden);

  return NextResponse.json({
    original,
    adjusted,
    overrides: describeOverrides(decoded, labValues),
    deltas: diff(original, adjusted),
  });
}
