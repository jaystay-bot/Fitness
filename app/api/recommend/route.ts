import { NextResponse } from "next/server";

import { recommend } from "@/lib/engine";
import { isValidLayer } from "@/lib/signalLayers";
import type { TaggedUserInput, UserInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVITY = ["sedentary", "light", "moderate", "high"] as const;
const GOALS = [
  "energy",
  "muscle",
  "fat-loss",
  "longevity",
  "focus",
  "gain-weight",
] as const;
const INFLAMMATION = ["unknown", "low", "elevated", "high"] as const;
const DIETS = [
  "omnivore",
  "vegetarian",
  "vegan",
  "keto",
  "mediterranean",
] as const;
const SYMPTOMS = [
  "fatigue",
  "brain-fog",
  "poor-sleep",
  "low-strength",
  "bloating",
  "none",
] as const;

function num(value: unknown, min: number, max: number, name: string): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || Number.isNaN(n) || n < min || n > max) {
    throw new Error(`${name} must be a number between ${min} and ${max}.`);
  }
  return n;
}

function oneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  name: string,
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value as T[number])) {
    throw new Error(`${name} must be one of ${allowed.join(", ")}.`);
  }
  return value as T[number];
}

// N=014: contract-spirit-honoring micro-extension. Additively accept an
// optional `taggedInputs` array in the request body; pass it to
// recommend(input, taggedInputs). When the field is absent or empty,
// recommend() is byte-identical to N=013 per the N=012 contract.
const USER_INPUT_FIELDS: ReadonlySet<keyof UserInput> = new Set<keyof UserInput>([
  "age",
  "sex",
  "heightCm",
  "weightKg",
  "activityLevel",
  "sleepHours",
  "primaryGoal",
  "dietPattern",
  "caffeineCupsPerDay",
  "alcoholDrinksPerWeek",
  "symptomToFix",
]);

function parseTaggedInputs(raw: unknown): TaggedUserInput[] | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const arr = (raw as Record<string, unknown>).taggedInputs;
  if (!Array.isArray(arr)) return undefined;
  const out: TaggedUserInput[] = [];
  for (const entry of arr) {
    if (!entry || typeof entry !== "object") continue;
    const e = entry as Record<string, unknown>;
    if (typeof e.field !== "string") continue;
    if (!USER_INPUT_FIELDS.has(e.field as keyof UserInput)) continue;
    if (!isValidLayer(e.layer)) continue;
    if (typeof e.confidence !== "number" || !Number.isFinite(e.confidence)) continue;
    if (e.confidence < 0 || e.confidence > 1) continue;
    if (typeof e.timestamp !== "string" || e.timestamp.length === 0) continue;
    if (e.value === undefined || e.value === null) continue;
    out.push({
      field: e.field as keyof UserInput,
      value: e.value as never,
      layer: e.layer,
      confidence: e.confidence,
      timestamp: e.timestamp,
    });
  }
  return out.length > 0 ? out : undefined;
}

function parseInput(raw: unknown): UserInput {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Body must be a JSON object.");
  }
  const r = raw as Record<string, unknown>;
  const parsed: UserInput = {
    age: num(r.age, 18, 90, "age"),
    sex: oneOf(r.sex, ["male", "female"] as const, "sex"),
    heightCm: num(r.heightCm, 140, 220, "heightCm"),
    weightKg: num(r.weightKg, 40, 200, "weightKg"),
    activityLevel: oneOf(r.activityLevel, ACTIVITY, "activityLevel"),
    sleepHours: num(r.sleepHours, 3, 12, "sleepHours"),
    primaryGoal: oneOf(r.primaryGoal, GOALS, "primaryGoal"),
    dietPattern: oneOf(r.dietPattern, DIETS, "dietPattern"),
    caffeineCupsPerDay: num(
      r.caffeineCupsPerDay,
      0,
      8,
      "caffeineCupsPerDay",
    ),
    alcoholDrinksPerWeek: num(
      r.alcoholDrinksPerWeek,
      0,
      30,
      "alcoholDrinksPerWeek",
    ),
    symptomToFix: oneOf(r.symptomToFix, SYMPTOMS, "symptomToFix"),
  };
  // Optional — only attached when present so legacy bodies stay valid.
  if (r.inflammation !== undefined) {
    parsed.inflammation = oneOf(r.inflammation, INFLAMMATION, "inflammation");
  }
  return parsed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }
  try {
    const input = parseInput(body);
    const tagged = parseTaggedInputs(body);
    const result = recommend(input, tagged);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
