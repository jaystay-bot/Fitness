import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signatures: string | null;
}

interface ClerkUserCreatedEvent {
  type: "user.created";
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
  };
}

type ClerkEvent = ClerkUserCreatedEvent | { type: string; data: unknown };

function verifySvix(secret: string, body: string, headers: SvixHeaders): boolean {
  if (!headers.id || !headers.timestamp || !headers.signatures) return false;
  const signedPayload = `${headers.id}.${headers.timestamp}.${body}`;
  const cleanedSecret = secret.startsWith("whsec_")
    ? secret.slice("whsec_".length)
    : secret;
  let key: Buffer;
  try {
    key = Buffer.from(cleanedSecret, "base64");
  } catch {
    return false;
  }
  const expected = crypto
    .createHmac("sha256", key)
    .update(signedPayload)
    .digest("base64");
  const provided = headers.signatures.split(" ");
  for (const entry of provided) {
    const [, sig] = entry.split(",", 2);
    if (sig && sig === expected) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Clerk webhook secret not configured." },
      { status: 503 },
    );
  }

  const headers: SvixHeaders = {
    id: request.headers.get("svix-id"),
    timestamp: request.headers.get("svix-timestamp"),
    signatures: request.headers.get("svix-signature"),
  };
  const body = await request.text();

  if (!verifySvix(secret, body, headers)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 },
    );
  }

  let event: ClerkEvent;
  try {
    event = JSON.parse(body) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ received: true, ignored: event.type });
  }

  const data = (event as ClerkUserCreatedEvent).data;
  const email = data.email_addresses?.[0]?.email_address;
  if (!data.id || !email) {
    return NextResponse.json(
      { error: "Missing user id or email." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("subscriptions").upsert(
    {
      clerk_user_id: data.id,
      user_email: email,
      tier: "free",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_user_id" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
