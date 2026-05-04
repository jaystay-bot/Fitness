import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase";
import type { SubscriptionTier } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ tier: null }, { status: 401 });
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
