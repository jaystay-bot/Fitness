// N=018: Whoop wearable plugin POST endpoint. Validates the paste-token,
// fetches recent recovery + strain via the Whoop API client, normalizes
// to TaggedUserInput[]. Token is read from the request body, used for
// the upstream calls during this single request, and discarded — never
// persisted server-side.
//
// Fail-silently rule (locked since N=014): the route NEVER returns 500.
// Empty / invalid / network-failure paths all return 200 with an
// explicit `error` field surfaced verbatim by the WhoopConnect card.

import { NextResponse } from "next/server";

import { whoopPlugin } from "@/lib/plugins/whoop";
import { summarizeWhoopMetrics } from "@/lib/plugins/whoop/normalizer";
import {
  fetchRecentWhoopMetrics,
  validateWhoopToken,
} from "@/lib/plugins/whoop/tokenAuth";

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
        "Invalid token. Please paste your Whoop personal access token from developer.whoop.com.",
    });
  }

  const validation = await validateWhoopToken(tokenRaw);
  if (!validation.valid) {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: validation.error ?? "Invalid token.",
    });
  }

  const metrics = await fetchRecentWhoopMetrics(tokenRaw);
  if (!metrics) {
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: "Could not fetch Whoop metrics. Please try again in a moment.",
    });
  }

  try {
    const tagged = whoopPlugin.normalize(metrics);
    const summary = summarizeWhoopMetrics(metrics);
    if (tagged.length === 0) {
      return NextResponse.json({
        tagged: [],
        summary,
        error:
          "Recovery and strain are missing from the last 7 days of Whoop data.",
      });
    }
    return NextResponse.json({ tagged, summary });
  } catch {
    // Fail silently per the plugin layer contract.
    return NextResponse.json({
      tagged: [],
      summary: null,
      error: "Internal error processing Whoop data.",
    });
  }
}
