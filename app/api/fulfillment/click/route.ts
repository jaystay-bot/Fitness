// N=015: click-logging endpoint for the Amazon action plugin. Logs
// click events to the new fulfillment_clicks Supabase table and
// returns the affiliate URL the FulfillButton's new tab should
// redirect to.
//
// N=016: extended additively to dispatch on `pluginName`. Default value
// remains "amazon" so N=015 callers (POST {supplementName} with no
// pluginName) experience byte-identical behavior. New "telehealth"
// pluginName routes to the telehealth deep-link generator.
//
// Fail-silently rule: any DB failure (missing env, unreachable
// project, RLS rejection) is swallowed and the route still returns
// 200 with the URL. The user's redirect is never blocked by
// infrastructure issues.

import { NextResponse } from "next/server";

import { amazonPlugin } from "@/lib/plugins/amazon";
import { telehealthPlugin } from "@/lib/plugins/telehealth";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PluginName = "amazon" | "telehealth";
const VALID_PLUGINS: ReadonlySet<PluginName> = new Set<PluginName>([
  "amazon",
  "telehealth",
]);

interface ClickBody {
  supplementName?: unknown;
  userId?: unknown;
  pluginName?: unknown;
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

  // N=016: dispatch on pluginName. Default "amazon" preserves N=015
  // behavior byte-identically when the field is absent or invalid.
  const rawPluginName =
    typeof body.pluginName === "string" ? body.pluginName : "amazon";
  const pluginName: PluginName = VALID_PLUGINS.has(rawPluginName as PluginName)
    ? (rawPluginName as PluginName)
    : "amazon";

  // Generate the URL deterministically. Reads AMAZON_ASSOCIATES_TAG or
  // TELEHEALTH_PROVIDER_URL from the runtime environment depending on
  // the active plugin. Each plugin falls back gracefully when its env
  // var is unset (Amazon → unattributed search; telehealth → generic
  // landing page).
  const url =
    pluginName === "telehealth"
      ? telehealthPlugin.generateActionUrl(supplementName)
      : amazonPlugin.generateActionUrl(supplementName);

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
          plugin_name: pluginName,
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
