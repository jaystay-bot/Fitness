import { NextResponse } from "next/server";

import {
  isValidEmail,
  isValidFeedback,
  isValidUrl,
  isValidUserAgent,
} from "@/lib/feedback";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Body {
  message?: unknown;
  userEmail?: unknown;
  pageUrl?: unknown;
  userAgent?: unknown;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  if (!isValidFeedback(body.message)) {
    return NextResponse.json(
      { error: "Message must be 1–500 characters." },
      { status: 400 },
    );
  }

  const userEmail =
    body.userEmail !== undefined &&
    body.userEmail !== null &&
    body.userEmail !== ""
      ? isValidEmail(body.userEmail)
        ? body.userEmail
        : null
      : null;

  const pageUrl = isValidUrl(body.pageUrl) ? body.pageUrl : null;
  const userAgent = isValidUserAgent(body.userAgent) ? body.userAgent : null;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    // Graceful degradation when Supabase env is not configured.
    // Returning 503 so the widget can surface a clear error rather than
    // silently dropping feedback.
    return NextResponse.json(
      { error: "service_unavailable", reason: "Supabase not configured." },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("feedback_submissions")
    .insert({
      message: (body.message as string).trim(),
      user_email: userEmail,
      page_url: pageUrl,
      user_agent: userAgent,
    })
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, id: data?.id ?? null });
}
