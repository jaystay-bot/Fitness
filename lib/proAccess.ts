// Per-email Pro allowlist. Useful for granting Pro access to internal
// testers, founders, and friends-and-family without going through Stripe.
// Works alongside the DEV MODE flag in lib/subscription.ts (which grants
// Pro to everyone) AND continues to work after DEV MODE is reverted.

// Hardcoded baseline. Add or remove entries here as needed; emails are
// compared case-insensitively after trimming whitespace.
const HARDCODED_ALLOWLIST: readonly string[] = [
  "jonathanstaley17@gmail.com",
];

// Env-driven extension. Comma-separated list, e.g.
//   PRO_EMAIL_ALLOWLIST=alice@example.com,bob@example.com
// Useful for adding testers without a code change + redeploy.
function envAllowlist(): string[] {
  const raw = process.env.PRO_EMAIL_ALLOWLIST;
  if (!raw) return [];
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.length > 0);
}

function normalize(email: string | null | undefined): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAllowlistedEmail(email: string | null | undefined): boolean {
  const target = normalize(email);
  if (!target) return false;
  if (HARDCODED_ALLOWLIST.some((e) => e.toLowerCase() === target)) return true;
  return envAllowlist().includes(target);
}
