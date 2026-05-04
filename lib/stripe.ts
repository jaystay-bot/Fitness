import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export const STRIPE_PRICE_MONTHLY = (): string | undefined =>
  process.env.STRIPE_PRICE_ID_MONTHLY;
export const STRIPE_PRICE_ANNUAL = (): string | undefined =>
  process.env.STRIPE_PRICE_ID_ANNUAL;
