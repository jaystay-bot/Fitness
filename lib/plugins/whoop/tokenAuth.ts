// N=018: Whoop paste-token authentication and minimal API client.
// Paste-token integration only — no OAuth, no token storage. The token
// is provided by the user from developer.whoop.com, used for the
// upstream calls during a single request, and discarded.
//
// Fail-silently rule (locked): every function here returns an explicit
// error indicator on failure and never throws. The route handler that
// invokes these functions is responsible for translating the indicator
// into a 200 response with an error string.

export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer/v1";

const FETCH_TIMEOUT_MS = 10_000;

export interface WhoopValidationResult {
  valid: boolean;
  error?: string;       // human-readable when invalid
}

export interface WhoopRecentMetrics {
  recoveryScore: number | null;       // 0..100 (Whoop "%")
  dayStrain: number | null;           // 0..21 (Whoop strain scale)
  asOf: string;                       // ISO 8601, most recent reading timestamp
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

// fetch with an AbortController-based timeout. Returns null on any error
// (network, abort, JSON parse, non-OK status).
async function safeFetchJson<T>(
  url: string,
  init: RequestInit,
): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as T | null;
    return data;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

// Validates a paste-token by calling Whoop's GET /user/profile/basic.
// Returns valid=false on empty/malformed tokens without making a network
// call. On network errors / 4xx / 5xx, returns valid=false with a
// human-readable error.
export async function validateWhoopToken(
  token: string,
): Promise<WhoopValidationResult> {
  if (!isNonEmptyString(token)) {
    return {
      valid: false,
      error: "Paste your Whoop personal access token from developer.whoop.com.",
    };
  }
  const trimmed = token.trim();
  // Whoop access tokens are JWT-shaped — three dot-separated base64
  // segments. We don't fully decode (that would require parsing without
  // a JWT lib), but we reject obviously-malformed strings before making
  // a network call.
  const segmentCount = trimmed.split(".").length;
  if (segmentCount < 2 || trimmed.length < 16) {
    return {
      valid: false,
      error: "Token format does not match Whoop's expected shape.",
    };
  }
  const profile = await safeFetchJson<{ user_id?: number }>(
    `${WHOOP_API_BASE}/user/profile/basic`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${trimmed}` },
    },
  );
  if (profile && typeof profile.user_id === "number") {
    return { valid: true };
  }
  return {
    valid: false,
    error:
      "Could not validate token against Whoop's API. The token may be expired or revoked.",
  };
}

// Internal — Whoop API response shapes. Only the fields we actually read.
interface WhoopRecoveryRecord {
  cycle_id?: number;
  score_state?: string;
  score?: { recovery_score?: number };
  updated_at?: string;
  created_at?: string;
}

interface WhoopCycleRecord {
  id?: number;
  score_state?: string;
  score?: { strain?: number };
  updated_at?: string;
  created_at?: string;
}

interface WhoopRecoveryListResponse {
  records?: WhoopRecoveryRecord[];
}

interface WhoopCycleListResponse {
  records?: WhoopCycleRecord[];
}

function pickMostRecent<T extends { updated_at?: string; created_at?: string }>(
  records: T[],
): T | null {
  if (!Array.isArray(records) || records.length === 0) return null;
  let best: T | null = null;
  let bestMs = -Infinity;
  for (const r of records) {
    const dateStr = r.updated_at ?? r.created_at ?? "";
    const t = Date.parse(dateStr);
    if (Number.isFinite(t) && t > bestMs) {
      bestMs = t;
      best = r;
    }
  }
  return best;
}

// Fetches the most recent recovery + cycle (strain) data points. Returns
// null on any error. Caller is responsible for fail-silently downstream.
export async function fetchRecentWhoopMetrics(
  token: string,
): Promise<WhoopRecentMetrics | null> {
  if (!isNonEmptyString(token)) return null;
  const trimmed = token.trim();
  const headers = { Authorization: `Bearer ${trimmed}` };

  // Fetch in parallel — both endpoints are independent.
  const [recovery, cycle] = await Promise.all([
    safeFetchJson<WhoopRecoveryListResponse>(
      `${WHOOP_API_BASE}/recovery?limit=10`,
      { method: "GET", headers },
    ),
    safeFetchJson<WhoopCycleListResponse>(
      `${WHOOP_API_BASE}/cycle?limit=10`,
      { method: "GET", headers },
    ),
  ]);

  const recentRecovery = pickMostRecent(recovery?.records ?? []);
  const recentCycle = pickMostRecent(cycle?.records ?? []);

  if (!recentRecovery && !recentCycle) return null;

  const recoveryScore =
    recentRecovery?.score?.recovery_score != null &&
    Number.isFinite(recentRecovery.score.recovery_score)
      ? recentRecovery.score.recovery_score
      : null;
  const dayStrain =
    recentCycle?.score?.strain != null &&
    Number.isFinite(recentCycle.score.strain)
      ? recentCycle.score.strain
      : null;

  // Pick whichever timestamp is more recent for `asOf`.
  const recoveryTs = recentRecovery?.updated_at ?? recentRecovery?.created_at ?? "";
  const cycleTs = recentCycle?.updated_at ?? recentCycle?.created_at ?? "";
  const recoveryMs = Date.parse(recoveryTs);
  const cycleMs = Date.parse(cycleTs);
  const asOf =
    Number.isFinite(recoveryMs) && Number.isFinite(cycleMs)
      ? recoveryMs >= cycleMs
        ? recoveryTs
        : cycleTs
      : Number.isFinite(recoveryMs)
        ? recoveryTs
        : Number.isFinite(cycleMs)
          ? cycleTs
          : new Date().toISOString();

  return { recoveryScore, dayStrain, asOf };
}
