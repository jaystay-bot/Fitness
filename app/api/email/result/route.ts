import { NextResponse } from "next/server";

import { sendResultEmail } from "@/lib/email";
import { decodeSlug } from "@/lib/slug";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  email?: unknown;
  slug?: unknown;
  verdict?: unknown;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email)) {
    return NextResponse.json(
      { error: "Provide a valid email address." },
      { status: 400 },
    );
  }
  if (typeof body.slug !== "string" || body.slug.length === 0) {
    return NextResponse.json(
      { error: "Slug is required." },
      { status: 400 },
    );
  }
  if (typeof body.verdict !== "string" || body.verdict.length === 0) {
    return NextResponse.json(
      { error: "Verdict is required." },
      { status: 400 },
    );
  }

  if (!decodeSlug(body.slug)) {
    return NextResponse.json(
      { error: "Slug does not decode to a valid input." },
      { status: 400 },
    );
  }

  const result = await sendResultEmail(body.email, body.verdict, body.slug);
  if (!result.ok) {
    if (result.reason === "missing-key") {
      // Resend not configured. Accept gracefully so the form does not
      // block in environments where the email backend is intentionally off.
      return NextResponse.json({ ok: true, queued: false });
    }
    return NextResponse.json(
      { error: result.reason ?? "Send failed." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, id: result.id ?? null });
}
