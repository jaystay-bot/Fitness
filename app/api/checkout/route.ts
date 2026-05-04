import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  STRIPE_PRICE_ANNUAL,
  STRIPE_PRICE_MONTHLY,
  STRIPE_PRICE_QUARTERLY,
  getStripe,
  isStripeConfigured,
} from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CheckoutBody {
  interval?: "month" | "quarter" | "year";
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe is not configured on this deployment." },
      { status: 503 },
    );
  }

  let userId: string | null = null;
  try {
    userId = auth().userId ?? null;
  } catch {
    // Clerk not configured — treat as unauthenticated.
    userId = null;
  }
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const interval =
    body.interval === "year"
      ? "year"
      : body.interval === "quarter"
        ? "quarter"
        : "month";
  const price =
    interval === "year"
      ? STRIPE_PRICE_ANNUAL()
      : interval === "quarter"
        ? STRIPE_PRICE_QUARTERLY()
        : STRIPE_PRICE_MONTHLY();
  if (!price) {
    return NextResponse.json(
      { error: "Stripe price ID not configured." },
      { status: 503 },
    );
  }

  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress;
  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe client unavailable." },
      { status: 503 },
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    metadata: { clerk_user_id: userId },
    success_url: `${origin}/account?upgraded=true`,
    cancel_url: `${origin}/pricing`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
