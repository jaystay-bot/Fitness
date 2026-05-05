// N=014: POST endpoint for the Apple Health plugin. Accepts a
// multipart/form-data upload containing the iOS Health export XML,
// parses it in memory, normalizes the result, returns the
// TaggedUserInput array + a small summary object the upload card
// renders next to its "Connected" state.
//
// Privacy posture (carried forward from N=007): the raw XML is read
// into a string, parsed, normalized, and discarded. Nothing is
// persisted to disk or to Supabase in this cycle.
//
// Fail-silently rule (locked): the route NEVER throws or returns 500.
// Empty / garbage / non-XML uploads return `{ tagged: [], summary: {} }`
// with status 200.

import { NextResponse } from "next/server";

import { appleHealthPlugin } from "@/lib/plugins/appleHealth";
import { parseAppleHealthExport } from "@/lib/plugins/appleHealth/parser";
import { summarizeAppleHealth } from "@/lib/plugins/appleHealth/normalizer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 5 * 1024 * 1024;        // 5 MB cap on the upload to avoid
                                          // pathological memory use; Apple
                                          // Health exports for a few weeks
                                          // of data sit comfortably under
                                          // this ceiling.

async function readUploadedXml(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";

  // Multipart form upload — preferred path used by the upload card.
  if (contentType.includes("multipart/form-data")) {
    try {
      const form = await request.formData();
      // Look for any File entry; we don't enforce a specific field name.
      for (const [, value] of form.entries()) {
        if (value && typeof value === "object" && "arrayBuffer" in (value as Blob)) {
          const file = value as Blob;
          if (file.size > MAX_BYTES) return "";
          const bytes = await file.arrayBuffer();
          return new TextDecoder("utf-8").decode(bytes);
        }
      }
      return "";
    } catch {
      return "";
    }
  }

  // Fall back to raw text body — useful for tests that POST text directly.
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return "";
    return text;
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const xml = await readUploadedXml(request);
  if (!xml) {
    return NextResponse.json({ tagged: [], summary: {} });
  }

  try {
    const tagged = appleHealthPlugin.normalize(xml);
    const parsedExport = parseAppleHealthExport(xml);
    const summary = summarizeAppleHealth(parsedExport);
    // N=018: server-side log of parser output for Vercel log inspection.
    // No PII — only counts of records by type plus the bytes processed.
    // Helps debug future "Connected but empty" reports without
    // requiring a re-upload.
    console.log(
      JSON.stringify({
        event: "apple_health_normalize",
        taggedCount: tagged.length,
        summary,
        recordCounts: {
          steps: parsedExport.steps.length,
          sleep: parsedExport.sleep.length,
          restingHeartRate: parsedExport.restingHeartRate.length,
        },
        xmlBytes: xml.length,
      }),
    );
    return NextResponse.json({ tagged, summary });
  } catch {
    // Fail silently per the plugin layer contract.
    return NextResponse.json({ tagged: [], summary: {} });
  }
}
