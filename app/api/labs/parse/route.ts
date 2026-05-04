import { auth } from "@clerk/nextjs/server";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

import { parseLabPdf } from "@/lib/labParser";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB hard cap on uploads.

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
      { error: "File exceeds 10 MB cap." },
      { status: 413 },
    );
  }

  const pdfBytes = Buffer.from(arrayBuffer);
  const fileHash = crypto
    .createHash("sha256")
    .update(pdfBytes)
    .digest("hex");

  const parsed = await parseLabPdf(pdfBytes);

  if (!parsed.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: parsed.reason ?? "parse_failed",
        format: parsed.format ?? "unknown",
      },
      { status: parsed.reason === "service_unavailable" ? 503 : 422 },
    );
  }

  // Optional persistence — only when Supabase is configured.
  // Raw PDF bytes are NOT stored. We persist only the structured values
  // and the file hash for reference.
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from("lab_uploads").insert({
      clerk_user_id: userId,
      extracted_values: parsed.values ?? {},
      file_hash: fileHash,
    });
  }

  return NextResponse.json({
    ok: true,
    format: parsed.format,
    values: parsed.values ?? {},
    file_hash: fileHash,
  });
}
