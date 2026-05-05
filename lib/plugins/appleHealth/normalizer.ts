// N=014: Apple Health normalizer. Pure synchronous transformer that maps
// the parser's output into TaggedUserInput[] entries ready to feed the
// Signal Stack priority resolver.
//
// Per the locked architect contract:
//   - Steps  → 7-day average → activityLevel bucket → behavior layer, conf 0.7
//   - Sleep  → 7-day average → sleepHours number    → behavior layer, conf 0.7
//   - RestHR → most recent   → activityLevel bucket → wearable layer, conf 0.85
//
// N=018 fix (production bug): the 7-day window is now anchored to the
// most-recent-record date in the export, not to `nowMs`. Users export
// their iOS Health data and may not upload it for weeks; anchoring to
// "now" silently drops every record from a stale export and produces
// the falsely-Connected blank-dash state Jay reported. When the 7-day
// window is empty (sparse data within the 30-day cutoff), we fall back
// to averaging across the entire 30-day recency window. The `now`
// parameter is preserved for API compatibility with N=014 callers but
// is no longer the window anchor.

import type { ActivityLevel, TaggedUserInput, UserInput } from "@/lib/types";
import type {
  AppleHealthExport,
  AppleHealthHeartRateRecord,
  AppleHealthSleepRecord,
  AppleHealthStepRecord,
} from "./parser";

const RECENCY_MS = 30 * 24 * 60 * 60 * 1000;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const MIN_SLEEP_HOURS = 3;
const MAX_SLEEP_HOURS = 12;

const STEP_CONFIDENCE = 0.7;
const SLEEP_CONFIDENCE = 0.7;
const HR_CONFIDENCE = 0.85;

function tsMs(iso: string): number {
  const v = Date.parse(iso);
  return Number.isFinite(v) ? v : NaN;
}

function withinRecency(records: { date: string }[], cutoffMs: number): typeof records {
  return records.filter((r) => {
    const t = tsMs(r.date);
    return Number.isFinite(t) && t >= cutoffMs;
  });
}

// N=018 BUG FIX: anchor the 7-day window to the MOST RECENT record's date
// in the export, not to `nowMs`. A user who exports data on April 18 and
// uploads on May 5 has records dated Apr 11–Apr 18; with the prior
// nowMs-anchored implementation, all records pass the 30-day recency
// cutoff but ALL FAIL the 7-day window relative to "now", producing
// empty arrays and the falsely-Connected blank-dash state. The fix
// anchors to the export's own most-recent timestamp.
function withinLastSevenDaysOfMostRecent<T extends { date: string }>(
  records: T[],
): T[] {
  if (records.length === 0) return [];
  let mostRecentMs = -Infinity;
  for (const r of records) {
    const t = tsMs(r.date);
    if (Number.isFinite(t) && t > mostRecentMs) mostRecentMs = t;
  }
  if (!Number.isFinite(mostRecentMs)) return [];
  const cutoff = mostRecentMs - SEVEN_DAYS_MS;
  return records.filter((r) => {
    const t = tsMs(r.date);
    return Number.isFinite(t) && t >= cutoff && t <= mostRecentMs;
  });
}

// N=018: when the most-recent-7-days window is empty (sparse data
// within the 30-day cutoff), fall back to averaging the entire 30-day
// recency-filtered set. This guarantees that any export with at least
// one record in the last 30 days produces non-empty TaggedUserInput[]
// rather than the false-Connected state.
function selectWindowedRecords<T extends { date: string }>(
  recencyFiltered: T[],
): T[] {
  if (recencyFiltered.length === 0) return [];
  const sevenDay = withinLastSevenDaysOfMostRecent(recencyFiltered);
  if (sevenDay.length > 0) return sevenDay;
  return recencyFiltered;
}

function avg(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  let sum = 0;
  for (const n of numbers) sum += n;
  return sum / numbers.length;
}

function activityLevelFromSteps(avgSteps: number): ActivityLevel {
  if (avgSteps >= 10000) return "high";
  if (avgSteps >= 7500) return "moderate";
  if (avgSteps >= 5000) return "light";
  return "sedentary";
}

function activityLevelFromRestingHR(bpm: number): ActivityLevel {
  if (bpm < 60) return "high";
  if (bpm < 70) return "moderate";
  if (bpm < 80) return "light";
  return "sedentary";
}

function clamp(n: number, lo: number, hi: number): number {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

function mostRecentDate<T extends { date: string }>(records: T[]): string | null {
  if (records.length === 0) return null;
  let best = records[0];
  let bestMs = tsMs(best.date);
  for (const r of records) {
    const t = tsMs(r.date);
    if (Number.isFinite(t) && (!Number.isFinite(bestMs) || t > bestMs)) {
      best = r;
      bestMs = t;
    }
  }
  return best.date;
}

// Group step or sleep records by calendar day (UTC) and sum within day,
// so that the 7-day average reflects per-day totals rather than per-record
// totals (the Apple export emits multiple rows per day).
function dailyTotalsByDay<T extends { date: string }>(
  records: T[],
  valueOf: (r: T) => number,
): Array<{ dayKey: string; total: number; latestMs: number }> {
  const byDay = new Map<string, { total: number; latestMs: number }>();
  for (const r of records) {
    const ms = tsMs(r.date);
    if (!Number.isFinite(ms)) continue;
    const d = new Date(ms);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    const existing = byDay.get(key);
    if (existing) {
      existing.total += valueOf(r);
      if (ms > existing.latestMs) existing.latestMs = ms;
    } else {
      byDay.set(key, { total: valueOf(r), latestMs: ms });
    }
  }
  return Array.from(byDay.entries()).map(([dayKey, v]) => ({
    dayKey,
    total: v.total,
    latestMs: v.latestMs,
  }));
}

export function normalizeAppleHealthRecords(
  parsed: AppleHealthExport,
  now: Date = new Date(),
): TaggedUserInput[] {
  if (!parsed) return [];

  const nowMs = now.getTime();
  const recencyCutoff = nowMs - RECENCY_MS;

  const recentSteps: AppleHealthStepRecord[] = withinRecency(
    parsed.steps ?? [],
    recencyCutoff,
  ) as AppleHealthStepRecord[];
  const recentSleep: AppleHealthSleepRecord[] = withinRecency(
    parsed.sleep ?? [],
    recencyCutoff,
  ) as AppleHealthSleepRecord[];
  const recentHR: AppleHealthHeartRateRecord[] = withinRecency(
    parsed.restingHeartRate ?? [],
    recencyCutoff,
  ) as AppleHealthHeartRateRecord[];

  const out: TaggedUserInput[] = [];

  // -- Steps → activityLevel (behavior layer) -------------------------
  // N=018: anchor to most-recent record + 30-day fallback (see header).
  const stepsLast7 = selectWindowedRecords(recentSteps);
  if (stepsLast7.length > 0) {
    const dailyTotals = dailyTotalsByDay(stepsLast7, (r) => r.count);
    const avgSteps = avg(dailyTotals.map((d) => d.total));
    const bucket: ActivityLevel = activityLevelFromSteps(avgSteps);
    const mostRecent = mostRecentDate(stepsLast7) ?? now.toISOString();
    const entry: TaggedUserInput<"activityLevel"> = {
      field: "activityLevel",
      value: bucket as UserInput["activityLevel"],
      layer: "behavior",
      confidence: STEP_CONFIDENCE,
      timestamp: mostRecent,
    };
    out.push(entry);
  }

  // -- Sleep → sleepHours (behavior layer) ----------------------------
  // N=018: anchor to most-recent record + 30-day fallback (see header).
  const sleepLast7 = selectWindowedRecords(recentSleep);
  if (sleepLast7.length > 0) {
    const dailyTotals = dailyTotalsByDay(sleepLast7, (r) => r.durationMinutes);
    const avgMin = avg(dailyTotals.map((d) => d.total));
    const hoursRaw = avgMin / 60;
    const hours = clamp(
      Math.round(hoursRaw * 2) / 2,            // round to nearest 0.5
      MIN_SLEEP_HOURS,
      MAX_SLEEP_HOURS,
    );
    const mostRecent = mostRecentDate(sleepLast7) ?? now.toISOString();
    const entry: TaggedUserInput<"sleepHours"> = {
      field: "sleepHours",
      value: hours as UserInput["sleepHours"],
      layer: "behavior",
      confidence: SLEEP_CONFIDENCE,
      timestamp: mostRecent,
    };
    out.push(entry);
  }

  // -- Resting heart rate → activityLevel (wearable layer) ------------
  if (recentHR.length > 0) {
    // Use the most recent reading.
    let bestRecord: AppleHealthHeartRateRecord = recentHR[0];
    let bestMs = tsMs(bestRecord.date);
    for (const r of recentHR) {
      const t = tsMs(r.date);
      if (Number.isFinite(t) && (!Number.isFinite(bestMs) || t > bestMs)) {
        bestRecord = r;
        bestMs = t;
      }
    }
    const bucket: ActivityLevel = activityLevelFromRestingHR(bestRecord.bpm);
    const entry: TaggedUserInput<"activityLevel"> = {
      field: "activityLevel",
      value: bucket as UserInput["activityLevel"],
      layer: "wearable",
      confidence: HR_CONFIDENCE,
      timestamp: bestRecord.date,
    };
    out.push(entry);
  }

  return out;
}

// Helper used by the upload card UI to surface the same three numbers
// that drove the TaggedUserInput emission. Pure, no I/O.
export interface AppleHealthSummary {
  averageDailySteps?: number;
  averageSleepHours?: number;
  restingHeartRate?: number;
}

export function summarizeAppleHealth(
  parsed: AppleHealthExport,
  now: Date = new Date(),
): AppleHealthSummary {
  if (!parsed) return {};
  const nowMs = now.getTime();
  const recencyCutoff = nowMs - RECENCY_MS;

  const summary: AppleHealthSummary = {};

  const recentSteps = withinRecency(parsed.steps ?? [], recencyCutoff) as AppleHealthStepRecord[];
  const stepsLast7 = selectWindowedRecords(recentSteps);
  if (stepsLast7.length > 0) {
    const totals = dailyTotalsByDay(stepsLast7, (r) => r.count).map((d) => d.total);
    summary.averageDailySteps = Math.round(avg(totals));
  }

  const recentSleep = withinRecency(parsed.sleep ?? [], recencyCutoff) as AppleHealthSleepRecord[];
  const sleepLast7 = selectWindowedRecords(recentSleep);
  if (sleepLast7.length > 0) {
    const totals = dailyTotalsByDay(sleepLast7, (r) => r.durationMinutes).map((d) => d.total);
    summary.averageSleepHours = Math.round((avg(totals) / 60) * 10) / 10;
  }

  const recentHR = withinRecency(parsed.restingHeartRate ?? [], recencyCutoff) as AppleHealthHeartRateRecord[];
  if (recentHR.length > 0) {
    let best = recentHR[0];
    let bestMs = tsMs(best.date);
    for (const r of recentHR) {
      const t = tsMs(r.date);
      if (Number.isFinite(t) && (!Number.isFinite(bestMs) || t > bestMs)) {
        best = r;
        bestMs = t;
      }
    }
    summary.restingHeartRate = best.bpm;
  }

  return summary;
}
