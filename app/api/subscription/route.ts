import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isAllowlistedEmail } from "@/lib/proAccess";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SubscriptionTier } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// When Clerk is not configured, clerkMiddleware() is a passthrough and calling
// auth() throws. Degrade gracefully to the free tier so the result page (which
// fetches this on mount) never sees a 500 on non-commercial / local deploys.
const CLERK_ENABLED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export async function GET() {
  if (!CLERK_ENABLED) {
    return NextResponse.json({ tier: "free" as SubscriptionTier });
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ tier: null }, { status: 401 });
  }

  // Per-email allowlist short-circuit. Lets named testers (e.g. founders,
  // internal QA) hold Pro tier without going through Stripe. Survives
  // DEV MODE revert.
  const user = await currentUser();
  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? null;
  if (isAllowlistedEmail(primaryEmail)) {
    return NextResponse.json({
      tier: "pro" as SubscriptionTier,
      status: "active",
      currentPeriodEnd: null,
      source: "allowlist",
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ tier: "free" as SubscriptionTier });
  }
  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier, status, current_period_end")
    .eq("clerk_user_id", userId)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    tier: (data?.tier as SubscriptionTier | undefined) ?? "free",
    status: data?.status ?? null,
    currentPeriodEnd: data?.current_period_end ?? null,
  });
}
