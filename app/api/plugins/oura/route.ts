// N=019: Oura wearable plugin POST endpoint. Validates the paste-token,
// fetches recent sleep + readiness via the Oura API client, normalizes
// to TaggedUserInput[]. Token is read from the request body, used for
// the upstream calls during this single request, and discarded —
// never persisted server-side.
//
// Mirrors the N=018 Whoop route's flow verbatim. Fail-silently rule
// (locked since N=014): the route NEVER returns 500. Empty / invalid /
// network-failure paths all return 200 with an explicit `error` field
// surfaced verbatim by the OuraConnect card.

import { NextResponse } from "next/server";

import { ouraPlugin } from "@/lib/plugins/oura";
import { summarizeOuraMetrics } from "@/lib/plugins/oura/normalizer";
import {
  fetchOuraMetrics,
  validateOuraToken,
} from "@/lib/plugins/oura/tokenAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PostBody {
  token?: unknown;
}

export async function POST(request: Request) {
  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: "Invalid JSON body.",
    });
  }

  const tokenRaw =
    typeof body.token === "string" ? body.token.trim() : "";
  if (tokenRaw.length === 0) {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error:
        "Invalid token. Please paste your Oura personal access token from cloud.ouraring.com.",
    });
  }

  const validation = await validateOuraToken(tokenRaw);
  if (!validation.valid) {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: validation.error ?? "Invalid token.",
    });
  }

  const metrics = await fetchOuraMetrics(tokenRaw);
  if (!metrics) {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: "Could not fetch Oura metrics. Please try again in a moment.",
    });
  }

  try {
    const tagged = ouraPlugin.normalize(metrics);
    const summary = summarizeOuraMetrics(metrics);
    if (tagged.length === 0) {
      // Valid token, fetch succeeded, but no actionable data within the 7-day
      // window — surface as the empty-data state via a populated summary +
      // explicit error message.
      return NextResponse.json({
        tagged: [],
        summary,
        error: "No recent data found in your Oura account within the last 7 days.",
      });
    }
    return NextResponse.json({ tagged, summary });
  } catch {
    // Fail silently per the plugin layer contract.
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: "Internal error processing Oura data.",
    });
  }
}
