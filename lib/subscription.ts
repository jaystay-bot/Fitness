import type { SubscriptionTier } from "./types";

export type ProFeature =
  | "checkin"
  | "history"
  | "pdf"
  | "notifications";

// Demo mode: when NEXT_PUBLIC_DEMO_MODE is set, every visitor is granted Pro
// access so the full product (timeline, lab parser, bottle scanner) is visible
// in a public portfolio demo without a subscription. Unset / "false" falls back
// to the real entitlement check. Flip the env var off for commercial launch.
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export function isProUser(tier: SubscriptionTier | null | undefined): boolean {
  if (DEMO_MODE) return true;
  return tier === "pro";
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
