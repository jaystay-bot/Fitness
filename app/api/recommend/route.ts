import { NextResponse } from "next/server";

import { recommend } from "@/lib/engine";
import type { UserInput } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ACTIVITY = ["sedentary", "light", "moderate", "high"] as const;
const GOALS = [
  "energy",
  "muscle",
  "fat-loss",
  "longevity",
  "focus",
] as const;
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

function parseInput(raw: unknown): UserInput {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Body must be a JSON object.");
  }
  const r = raw as Record<string, unknown>;
  return {
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
    const result = recommend(input);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
