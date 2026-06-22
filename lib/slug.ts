import type {
  ActivityLevel,
  DietPattern,
  InflammationLevel,
  PrimaryGoal,
  Sex,
  Symptom,
  UserInput,
} from "./types";

const SEX: Sex[] = ["male", "female"];
const ACTIVITY: ActivityLevel[] = ["sedentary", "light", "moderate", "high"];
const GOAL: PrimaryGoal[] = [
  "energy",
  "muscle",
  "fat-loss",
  "longevity",
  "focus",
  "gain-weight",
];
const INFLAMMATION: InflammationLevel[] = [
  "unknown",
  "low",
  "elevated",
  "high",
];
const DIET: DietPattern[] = [
  "omnivore",
  "vegetarian",
  "vegan",
  "keto",
  "mediterranean",
];
const SYMPTOM: Symptom[] = [
  "fatigue",
  "brain-fog",
  "poor-sleep",
  "low-strength",
  "bloating",
  "none",
];

function inEnum<T extends string>(value: unknown, allowed: T[]): value is T {
  return typeof value === "string" && (allowed as string[]).includes(value);
}

function inRange(value: unknown, min: number, max: number): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}

// Use plain base64 + URL-safe character swap so the same code path works in
// both Node (server components, API routes) and the browser (post-submit
// slug update via window.history). Node's Buffer in webpack's browser
// polyfill does not implement the "base64url" encoding name, so we cannot
// rely on it for the client-side encode call.
function toBase64Url(json: string): string {
  return Buffer.from(json, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(slug: string): string {
  const padded =
    slug.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice(0, (4 - (slug.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}

export function encodeInput(input: UserInput): string {
  return toBase64Url(JSON.stringify(input));
}

export function decodeSlug(slug: string): UserInput | null {
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 1024) {
    return null;
  }
  let json: string;
  try {
    json = fromBase64Url(slug);
  } catch {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null) return null;
  const r = parsed as Record<string, unknown>;
  if (!inRange(r.age, 18, 90)) return null;
  if (!inEnum(r.sex, SEX)) return null;
  if (!inRange(r.heightCm, 140, 220)) return null;
  if (!inRange(r.weightKg, 40, 200)) return null;
  if (!inEnum(r.activityLevel, ACTIVITY)) return null;
  if (!inRange(r.sleepHours, 3, 12)) return null;
  if (!inEnum(r.primaryGoal, GOAL)) return null;
  if (!inEnum(r.dietPattern, DIET)) return null;
  if (!inRange(r.caffeineCupsPerDay, 0, 8)) return null;
  if (!inRange(r.alcoholDrinksPerWeek, 0, 30)) return null;
  if (!inEnum(r.symptomToFix, SYMPTOM)) return null;
  const out: UserInput = {
    age: r.age,
    sex: r.sex,
    heightCm: r.heightCm,
    weightKg: r.weightKg,
    activityLevel: r.activityLevel,
    sleepHours: r.sleepHours,
    primaryGoal: r.primaryGoal,
    dietPattern: r.dietPattern,
    caffeineCupsPerDay: r.caffeineCupsPerDay,
    alcoholDrinksPerWeek: r.alcoholDrinksPerWeek,
    symptomToFix: r.symptomToFix,
  };
  // Optional field — only carried through when present and valid.
  if (r.inflammation !== undefined && inEnum(r.inflammation, INFLAMMATION)) {
    out.inflammation = r.inflammation;
  }
  return out;
}
