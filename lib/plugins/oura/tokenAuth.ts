// N=019: Oura paste-token authentication and minimal API client.
// Paste-token integration only — no OAuth, no token storage. The token
// is provided by the user from cloud.ouraring.com, used for the
// upstream calls during a single request, and discarded.
//
// Mirrors the N=018 Whoop tokenAuth pattern verbatim: 10s fetch timeout,
// pre-network rejection of empty / malformed tokens, never throws.

export const OURA_API_BASE = "https://api.ouraring.com/v2";

const FETCH_TIMEOUT_MS = 10_000;

export interface OuraValidationResult {
  valid: boolean;
  error?: string;
}

export interface OuraRecentMetrics {
  sleepScore: number | null;       // 0..100 (Oura daily_sleep.score)
  readinessScore: number | null;   // 0..100 (Oura daily_readiness.score)
  asOf: string;                    // ISO 8601, most recent reading day
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

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

// Validates a paste-token by calling Oura's GET /usercollection/personal_info.
// Empty / non-string / whitespace tokens reject before the network call.
// Tokens shorter than 16 characters are rejected as obviously malformed
// (Oura personal access tokens are typically 32+ chars).
export async function validateOuraToken(
  token: string,
): Promise<OuraValidationResult> {
  if (!isNonEmptyString(token)) {
    return {
      valid: false,
      error: "Paste your Oura personal access token from cloud.ouraring.com.",
    };
  }
  const trimmed = token.trim();
  if (trimmed.length < 16) {
    return {
      valid: false,
      error: "Token format does not match Oura's expected shape.",
    };
  }
  const profile = await safeFetchJson<{ id?: string; email?: string }>(
    `${OURA_API_BASE}/usercollection/personal_info`,
    {
      method: "GET",
      headers: { Authorization: `Bearer ${trimmed}` },
    },
  );
  if (profile && typeof profile.id === "string") {
    return { valid: true };
  }
  return {
    valid: false,
    error:
      "Could not validate token against Oura's API. The token may be expired or revoked.",
  };
}

// Internal — Oura API response shapes. Only the fields we actually read.
interface OuraDailySleepRecord {
  id?: string;
  day?: string;                       // YYYY-MM-DD
  score?: number;
  timestamp?: string;
}

interface OuraDailyReadinessRecord {
  id?: string;
  day?: string;
  score?: number;
  timestamp?: string;
}

interface OuraDailyListResponse<T> {
  data?: T[];
}

function pickMostRecent<T extends { day?: string; timestamp?: string }>(
  records: T[],
): T | null {
  if (!Array.isArray(records) || records.length === 0) return null;
  let best: T | null = null;
  let bestMs = -Infinity;
  for (const r of records) {
    const dateStr = r.timestamp ?? r.day ?? "";
    const t = Date.parse(dateStr);
    if (Number.isFinite(t) && t > bestMs) {
      bestMs = t;
      best = r;
    }
  }
  return best;
}

function isoFromOuraRecord(r: { day?: string; timestamp?: string }): string {
  if (typeof r.timestamp === "string" && r.timestamp.length > 0) return r.timestamp;
  if (typeof r.day === "string" && r.day.length > 0) {
    return `${r.day}T00:00:00Z`;
  }
  return new Date().toISOString();
}

function startDateSevenDaysAgo(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

// Fetches the most recent daily_sleep + daily_readiness data points.
// Returns null on any error. Caller is responsible for fail-silently.
export async function fetchOuraMetrics(
  token: string,
): Promise<OuraRecentMetrics | null> {
  if (!isNonEmptyString(token)) return null;
  const trimmed = token.trim();
  const headers = { Authorization: `Bearer ${trimmed}` };
  const startDate = startDateSevenDaysAgo();

  const [sleep, readiness] = await Promise.all([
    safeFetchJson<OuraDailyListResponse<OuraDailySleepRecord>>(
      `${OURA_API_BASE}/usercollection/daily_sleep?start_date=${startDate}`,
      { method: "GET", headers },
    ),
    safeFetchJson<OuraDailyListResponse<OuraDailyReadinessRecord>>(
      `${OURA_API_BASE}/usercollection/daily_readiness?start_date=${startDate}`,
      { method: "GET", headers },
    ),
  ]);

  const recentSleep = pickMostRecent(sleep?.data ?? []);
  const recentReadiness = pickMostRecent(readiness?.data ?? []);

  if (!recentSleep && !recentReadiness) return null;

  const sleepScore =
    recentSleep?.score != null && Number.isFinite(recentSleep.score)
      ? recentSleep.score
      : null;
  const readinessScore =
    recentReadiness?.score != null && Number.isFinite(recentReadiness.score)
      ? recentReadiness.score
      : null;

  // Pick whichever timestamp is more recent for `asOf`.
  const sleepIso = recentSleep ? isoFromOuraRecord(recentSleep) : "";
  const readinessIso = recentReadiness ? isoFromOuraRecord(recentReadiness) : "";
  const sleepMs = Date.parse(sleepIso);
  const readinessMs = Date.parse(readinessIso);
  const asOf =
    Number.isFinite(sleepMs) && Number.isFinite(readinessMs)
      ? sleepMs >= readinessMs
        ? sleepIso
        : readinessIso
      : Number.isFinite(sleepMs)
        ? sleepIso
        : Number.isFinite(readinessMs)
          ? readinessIso
          : new Date().toISOString();

  return { sleepScore, readinessScore, asOf };
}
