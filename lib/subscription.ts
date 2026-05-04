import type { SubscriptionTier } from "./types";

export type ProFeature =
  | "checkin"
  | "history"
  | "pdf"
  | "notifications";

// ============================================================
// DEV MODE: Pro tier gating temporarily disabled for testing.
// All Pro features are accessible to every user, including
// anonymous users, until production Stripe and Clerk are
// configured. Re-enable gating in a future cycle by reverting
// this function to its prior implementation.
// ============================================================
export function isProUser(tier: SubscriptionTier | null | undefined): boolean {
  void tier;
  return true;
}

export function canAccess(
  tier: SubscriptionTier | null | undefined,
  feature: ProFeature,
): boolean {
  // No free-tier features are gated. Every feature listed in ProFeature
  // is Pro-only. Returns true iff the user is on the pro tier.
  void feature;
  return isProUser(tier);
}

export const PRICE_MONTHLY_USD_CENTS = 500;
export const PRICE_ANNUAL_USD_CENTS = 4800;

export function formatUsdCents(cents: number): string {
  const dollars = cents / 100;
  if (Number.isInteger(dollars)) return `$${dollars}`;
  return `$${dollars.toFixed(2)}`;
}
