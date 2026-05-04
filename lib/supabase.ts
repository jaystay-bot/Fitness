import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { SubscriptionStatus, SubscriptionTier } from "./types";

export interface SubscriptionRow {
  id: string;
  clerk_user_id: string;
  user_email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

let cached: SupabaseClient | null = null;

/**
 * Server-side admin client backed by the service role key. Only callable
 * from server contexts (route handlers, server components). Returns null
 * when env is incomplete so build steps and local dev tolerate the
 * absence of a real Supabase project.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (cached) return cached;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
