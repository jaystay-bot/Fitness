// N=014: Apple Health export parser. Pure regex-driven extractor for the
// three target record types (steps, sleep, resting heart rate) emitted
// by the iOS Health app's `export.xml`. No XML library dependency — the
// regex approach is intentionally narrow so this stays additive against
// the locked package.json.
//
// Fail-silently rule: never throws. Returns empty arrays when no records
// match. The caller (lib/plugins/appleHealth/normalizer.ts) is responsible
// for downstream interpretation.

export interface AppleHealthStepRecord {
  date: string;          // ISO 8601 startDate from the export
  count: number;         // step count for the record
}

export interface AppleHealthSleepRecord {
  date: string;          // ISO 8601 startDate
  durationMinutes: number;
}

export interface AppleHealthHeartRateRecord {
  date: string;          // ISO 8601 startDate
  bpm: number;
}

export interface AppleHealthExport {
  steps: AppleHealthStepRecord[];
  sleep: AppleHealthSleepRecord[];
  restingHeartRate: AppleHealthHeartRateRecord[];
}

// Apple's export uses ` ` (space-separated date-time-zone) — normalize to
// ISO-ish output by replacing the space-with-zone separator. We accept
// both formats and store whatever the export gave us (the consumer treats
// the string lexicographically for recency comparison only).
function isoOrPassthrough(raw: string): string {
  // Apple format: "2026-04-15 06:23:11 -0700"
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(.*)$/);
  if (!m) return raw;
  return `${m[1]}T${m[2]}${m[3].trim() ? m[3].trim() : "Z"}`;
}

function attr(name: string, recordTag: string): string | null {
  const re = new RegExp(`${name}="([^"]*)"`);
  const m = recordTag.match(re);
  return m ? m[1] : null;
}

function minutesBetween(startISO: string, endISO: string): number {
  const a = Date.parse(startISO);
  const b = Date.parse(endISO);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return 0;
  return Math.round((b - a) / 60000);
}

function extractRecords(xml: string, type: string): string[] {
  // Match <Record ... type="..." .../> with optional inner content. Apple's
  // export uses self-closing tags for these record types but newer exports
  // may include child <MetadataEntry> tags inside a non-self-closing
  // <Record>...</Record> wrapper. The regex below tolerates both shapes
  // and is case-insensitive so future Apple naming variations don't
  // silently drop records.
  //
  // N=018 hardening: case-insensitive; whitespace tolerance before `/>`.
  const re = new RegExp(
    `<Record\\b[^>]*type="${type}"[^>]*\\s*/?>`,
    "gi",
  );
  return xml.match(re) ?? [];
}

export function parseAppleHealthExport(xml: string): AppleHealthExport {
  const empty: AppleHealthExport = {
    steps: [],
    sleep: [],
    restingHeartRate: [],
  };
  if (typeof xml !== "string" || xml.length === 0) return empty;

  let stepTags: string[];
  let sleepTags: string[];
  let hrTags: string[];
  try {
    stepTags = extractRecords(xml, "HKQuantityTypeIdentifierStepCount");
    sleepTags = extractRecords(xml, "HKCategoryTypeIdentifierSleepAnalysis");
    hrTags = extractRecords(xml, "HKQuantityTypeIdentifierRestingHeartRate");
  } catch {
    return empty;
  }

  const steps: AppleHealthStepRecord[] = [];
  for (const tag of stepTags) {
    const startDate = attr("startDate", tag);
    const valueRaw = attr("value", tag);
    if (!startDate || !valueRaw) continue;
    const count = Number(valueRaw);
    if (!Number.isFinite(count) || count < 0) continue;
    steps.push({ date: isoOrPassthrough(startDate), count: Math.round(count) });
  }

  const sleep: AppleHealthSleepRecord[] = [];
  for (const tag of sleepTags) {
    const startDate = attr("startDate", tag);
    const endDate = attr("endDate", tag);
    const value = attr("value", tag) ?? "";
    if (!startDate || !endDate) continue;
    // Skip awake/in-bed-only entries; count any "asleep" variant. Older
    // exports use "HKCategoryValueSleepAnalysisAsleep"; newer ones split
    // into "*AsleepCore", "*AsleepDeep", "*AsleepREM", "*AsleepUnspecified".
    if (value && !/Asleep/i.test(value) && value !== "HKCategoryValueSleepAnalysisInBed") continue;
    if (value === "HKCategoryValueSleepAnalysisInBed") continue;
    const duration = minutesBetween(
      isoOrPassthrough(startDate),
      isoOrPassthrough(endDate),
    );
    if (duration <= 0) continue;
    sleep.push({
      date: isoOrPassthrough(startDate),
      durationMinutes: duration,
    });
  }

  const restingHeartRate: AppleHealthHeartRateRecord[] = [];
  for (const tag of hrTags) {
    const startDate = attr("startDate", tag);
    const valueRaw = attr("value", tag);
    if (!startDate || !valueRaw) continue;
    const bpm = Number(valueRaw);
    if (!Number.isFinite(bpm) || bpm <= 0 || bpm >= 250) continue;
    restingHeartRate.push({
      date: isoOrPassthrough(startDate),
      bpm: Math.round(bpm),
    });
  }

  return { steps, sleep, restingHeartRate };
}
