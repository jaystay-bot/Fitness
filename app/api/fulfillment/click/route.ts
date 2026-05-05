// N=015: click-logging endpoint for the Amazon action plugin. Logs
// click events to the new fulfillment_clicks Supabase table and
// returns the affiliate URL the FulfillButton's new tab should
// redirect to.
//
// Fail-silently rule: any DB failure (missing env, unreachable
// project, RLS rejection) is swallowed and the route still returns
// 200 with the affiliate URL. The user's redirect is never blocked
// by infrastructure issues.

import { NextResponse } from "next/server";

import { amazonPlugin } from "@/lib/plugins/amazon";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ClickBody {
  supplementName?: unknown;
  userId?: unknown;
}

async function tryGetClerkUserId(): Promise<string | null> {
  // Resolve Clerk user id when configured; silently fall back to null in
  // unconfigured envs (the import itself is safe; auth() throws if Clerk
  // env is absent and we want the route to keep working anonymously).
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = auth();
    return userId ?? null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  let body: ClickBody;
  try {
    body = (await request.json()) as ClickBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const supplementName =
    typeof body.supplementName === "string" ? body.supplementName.trim() : "";
  if (supplementName.length === 0) {
    return NextResponse.json(
      { error: "supplementName required" },
      { status: 400 },
    );
  }

  // Generate the affiliate URL deterministically. Reads AMAZON_ASSOCIATES_TAG
  // from the runtime environment; falls back to an unattributed search URL
  // when the tag is unset.
  const url = amazonPlugin.generateActionUrl(supplementName);

  // Best-effort: capture Clerk user id when available, log the click. If
  // Supabase env is absent or the insert fails, swallow the error and
  // still return 200 with the URL — the affiliate redirect must never
  // depend on the audit surface.
  let userId: string | null = null;
  if (typeof body.userId === "string" && body.userId.length > 0) {
    userId = body.userId;
  } else {
    userId = await tryGetClerkUserId();
  }

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error: dbError } = await supabase
        .from("fulfillment_clicks")
        .insert({
          supplement_name: supplementName,
          affiliate_url: url,
          user_id: userId,
        });
      if (dbError) {
        // Swallow — the click endpoint never blocks the redirect.
        void dbError;
      }
    }
  } catch {
    // Swallow per the fail-silently rule.
  }

  return NextResponse.json({ ok: true, url });
}
