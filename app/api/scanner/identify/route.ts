import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { scanBottleImage } from "@/lib/scanner";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB cap on image uploads.

async function getUserId(): Promise<string | null> {
  try {
    return auth().userId ?? null;
  } catch {
    return null;
  }
}

async function getTier(clerkUserId: string): Promise<"free" | "pro"> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return "free";
  const { data } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("clerk_user_id", clerkUserId)
    .maybeSingle();
  return ((data?.tier as "free" | "pro" | undefined) ?? "free");
}

interface ProtocolPick {
  identified: string;
  name: string;
}

function parseProtocol(raw: unknown): ProtocolPick[] {
  if (typeof raw !== "string" || raw.length === 0) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p): p is ProtocolPick =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as ProtocolPick).identified === "string" &&
          typeof (p as ProtocolPick).name === "string",
      )
      .slice(0, 12);
  } catch {
    return [];
  }
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

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart body." },
      { status: 400 },
    );
  }
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "Missing 'file' field." },
      { status: 400 },
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image exceeds 8 MB cap." },
      { status: 413 },
    );
  }

  const imageBytes = Buffer.from(arrayBuffer);
  const identification = await scanBottleImage(imageBytes);

  if (!identification.ok && identification.reason === "service_unavailable") {
    return NextResponse.json(
      { ...identification, error: "service_unavailable" },
      { status: 503 },
    );
  }

  // Optional comparison against the user's current protocol picks.
  const protocol = parseProtocol(formData.get("protocol"));
  const matchedPick = identification.identified
    ? protocol.find((p) => p.identified === identification.identified)
    : undefined;

  // Persist only structured fields. Raw image is never written to disk.
  const supabase = getSupabaseAdmin();
  if (supabase && identification.identified) {
    await supabase.from("bottle_scans").insert({
      clerk_user_id: userId,
      identified_compound: identification.identified,
      identified_dose_mg: identification.dose_mg,
      matched_protocol_pick: Boolean(matchedPick),
    });
  }

  return NextResponse.json({
    ok: true,
    identified: identification.identified,
    dose_mg: identification.dose_mg,
    confidence: identification.confidence,
    matched_protocol_pick: matchedPick?.name ?? null,
  });
}
