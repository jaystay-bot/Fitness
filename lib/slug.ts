import type {
  ActivityLevel,
  DietPattern,
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

export function encodeInput(input: UserInput): string {
  const json = JSON.stringify(input);
  return Buffer.from(json, "utf-8").toString("base64url");
}

export function decodeSlug(slug: string): UserInput | null {
  if (typeof slug !== "string" || slug.length === 0 || slug.length > 1024) {
    return null;
  }
  let json: string;
  try {
    json = Buffer.from(slug, "base64url").toString("utf-8");
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
  return {
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
}
