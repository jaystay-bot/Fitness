"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import type { Recommendation, UserInput } from "@/lib/types";
import {
  cmToImperial,
  imperialToCm,
  imperialToKg,
  kgToPounds,
  type UnitSystem,
} from "@/lib/units";
import { UnitToggle } from "./UnitToggle";

const FIELD =
  "w-full bg-ink border border-paper/20 rounded-md px-3 py-2 text-sm text-paper placeholder:text-paper/40 focus:outline-none focus:border-lime";
const LABEL =
  "text-[11px] font-mono uppercase tracking-wider text-paper/60";

const HEIGHT_CM_MIN = 140;
const HEIGHT_CM_MAX = 220;
const WEIGHT_KG_MIN = 40;
const WEIGHT_KG_MAX = 200;

const DEFAULT_FEET = 5;
const DEFAULT_INCHES = 10;
const DEFAULT_POUNDS = 180;

const DEFAULTS: UserInput = {
  age: 31,
  sex: "male",
  heightCm: 178,
  weightKg: 82,
  activityLevel: "moderate",
  sleepHours: 7,
  primaryGoal: "muscle",
  dietPattern: "omnivore",
  caffeineCupsPerDay: 2,
  alcoholDrinksPerWeek: 3,
  symptomToFix: "fatigue",
};

function inImperialBounds(feet: number, inches: number, pounds: number) {
  return (
    feet >= 4 &&
    feet <= 7 &&
    inches >= 0 &&
    inches <= 11 &&
    pounds >= 88 &&
    pounds <= 440
  );
}

export function AssessmentForm({
  onResult,
}: {
  onResult: (rec: Recommendation, input: UserInput) => void;
}) {
  const [input, setInput] = useState<UserInput>(DEFAULTS);
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("imperial");
  const [feet, setFeet] = useState<number>(DEFAULT_FEET);
  const [inches, setInches] = useState<number>(DEFAULT_INCHES);
  const [pounds, setPounds] = useState<number>(DEFAULT_POUNDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    if (next === "metric") {
      const cm = imperialToCm(feet, inches);
      const kg = imperialToKg(pounds);
      if (
        cm >= HEIGHT_CM_MIN &&
        cm <= HEIGHT_CM_MAX &&
        kg >= WEIGHT_KG_MIN &&
        kg <= WEIGHT_KG_MAX
      ) {
        setInput((prev) => ({ ...prev, heightCm: cm, weightKg: kg }));
      } else {
        setInput((prev) => ({
          ...prev,
          heightCm: DEFAULTS.heightCm,
          weightKg: DEFAULTS.weightKg,
        }));
      }
    } else {
      const { feet: f, inches: i } = cmToImperial(input.heightCm);
      const lb = kgToPounds(input.weightKg);
      if (inImperialBounds(f, i, lb)) {
        setFeet(f);
        setInches(i);
        setPounds(lb);
      } else {
        setFeet(DEFAULT_FEET);
        setInches(DEFAULT_INCHES);
        setPounds(DEFAULT_POUNDS);
      }
    }
    setUnitSystem(next);
  }

  let derivedHeightCm: number;
  let derivedWeightKg: number;
  if (unitSystem === "imperial") {
    derivedHeightCm = imperialToCm(feet, inches);
    derivedWeightKg = imperialToKg(pounds);
  } else {
    derivedHeightCm = input.heightCm;
    derivedWeightKg = input.weightKg;
  }

  const heightOutOfRange =
    derivedHeightCm < HEIGHT_CM_MIN || derivedHeightCm > HEIGHT_CM_MAX;
  const weightOutOfRange =
    derivedWeightKg < WEIGHT_KG_MIN || derivedWeightKg > WEIGHT_KG_MAX;
  const validationDisabled = heightOutOfRange || weightOutOfRange;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (validationDisabled) return;
    setLoading(true);
    setError(null);
    try {
      const payload: UserInput = {
        ...input,
        heightCm: derivedHeightCm,
        weightKg: derivedWeightKg,
      };
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `Request failed (${res.status}).`);
      }
      const data = (await res.json()) as Recommendation;
      onResult(data, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Apex Protocol assessment form"
      className="w-full max-w-md bg-ink border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" id="age">
          <input
            id="age"
            type="number"
            min={18}
            max={90}
            inputMode="numeric"
            className={FIELD}
            value={input.age}
            onChange={(e) => update("age", Number(e.target.value))}
          />
        </Field>
        <Field label="Sex" id="sex">
          <select
            id="sex"
            className={FIELD}
            value={input.sex}
            onChange={(e) => update("sex", e.target.value as UserInput["sex"])}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className={LABEL}>Units</span>
          <UnitToggle system={unitSystem} onChange={changeUnitSystem} />
        </div>

        {unitSystem === "imperial" ? (
          <>
            <div className="flex flex-col gap-1">
              <span className={LABEL}>Height</span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ft" id="feet">
                  <input
                    id="feet"
                    type="number"
                    min={4}
                    max={7}
                    inputMode="numeric"
                    className={FIELD}
                    value={feet}
                    onChange={(e) => setFeet(Number(e.target.value))}
                  />
                </Field>
                <Field label="In" id="inches">
                  <input
                    id="inches"
                    type="number"
                    min={0}
                    max={11}
                    inputMode="numeric"
                    className={FIELD}
                    value={inches}
                    onChange={(e) => setInches(Number(e.target.value))}
                  />
                </Field>
              </div>
            </div>
            <Field label="Weight (lb)" id="pounds">
              <input
                id="pounds"
                type="number"
                min={88}
                max={440}
                inputMode="numeric"
                className={FIELD}
                value={pounds}
                onChange={(e) => setPounds(Number(e.target.value))}
              />
            </Field>
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)" id="heightCm">
              <input
                id="heightCm"
                type="number"
                min={HEIGHT_CM_MIN}
                max={HEIGHT_CM_MAX}
                inputMode="numeric"
                className={FIELD}
                value={input.heightCm}
                onChange={(e) => update("heightCm", Number(e.target.value))}
              />
            </Field>
            <Field label="Weight (kg)" id="weightKg">
              <input
                id="weightKg"
                type="number"
                min={WEIGHT_KG_MIN}
                max={WEIGHT_KG_MAX}
                inputMode="numeric"
                className={FIELD}
                value={input.weightKg}
                onChange={(e) => update("weightKg", Number(e.target.value))}
              />
            </Field>
          </div>
        )}

        {heightOutOfRange ? (
          <p
            role="alert"
            className="text-[11px] text-clinical font-sans leading-snug"
          >
            Height must be between 4&apos;7&quot; and 7&apos;2&quot;.
          </p>
        ) : null}
        {weightOutOfRange ? (
          <p
            role="alert"
            className="text-[11px] text-clinical font-sans leading-snug"
          >
            Weight must be between 88 lb and 440 lb.
          </p>
        ) : null}
      </div>

      <Field label="Primary goal" id="primaryGoal">
        <select
          id="primaryGoal"
          className={FIELD}
          value={input.primaryGoal}
          onChange={(e) =>
            update("primaryGoal", e.target.value as UserInput["primaryGoal"])
          }
        >
          <option value="energy">Energy</option>
          <option value="muscle">Muscle</option>
          <option value="fat-loss">Fat loss</option>
          <option value="longevity">Longevity</option>
          <option value="focus">Focus</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Activity" id="activityLevel">
          <select
            id="activityLevel"
            className={FIELD}
            value={input.activityLevel}
            onChange={(e) =>
              update(
                "activityLevel",
                e.target.value as UserInput["activityLevel"],
              )
            }
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Sleep (hrs)" id="sleepHours">
          <input
            id="sleepHours"
            type="number"
            min={3}
            max={12}
            step={0.5}
            inputMode="decimal"
            className={FIELD}
            value={input.sleepHours}
            onChange={(e) => update("sleepHours", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field label="Diet pattern" id="dietPattern">
        <select
          id="dietPattern"
          className={FIELD}
          value={input.dietPattern}
          onChange={(e) =>
            update("dietPattern", e.target.value as UserInput["dietPattern"])
          }
        >
          <option value="omnivore">Omnivore</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="keto">Keto</option>
          <option value="mediterranean">Mediterranean</option>
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Coffee (cups/day)" id="caffeineCupsPerDay">
          <input
            id="caffeineCupsPerDay"
            type="number"
            min={0}
            max={8}
            inputMode="numeric"
            className={FIELD}
            value={input.caffeineCupsPerDay}
            onChange={(e) =>
              update("caffeineCupsPerDay", Number(e.target.value))
            }
          />
        </Field>
        <Field label="Alcohol (drinks/wk)" id="alcoholDrinksPerWeek">
          <input
            id="alcoholDrinksPerWeek"
            type="number"
            min={0}
            max={30}
            inputMode="numeric"
            className={FIELD}
            value={input.alcoholDrinksPerWeek}
            onChange={(e) =>
              update("alcoholDrinksPerWeek", Number(e.target.value))
            }
          />
        </Field>
      </div>

      <Field label="One thing to fix" id="symptomToFix">
        <select
          id="symptomToFix"
          className={FIELD}
          value={input.symptomToFix}
          onChange={(e) =>
            update("symptomToFix", e.target.value as UserInput["symptomToFix"])
          }
        >
          <option value="fatigue">Fatigue</option>
          <option value="brain-fog">Brain fog</option>
          <option value="poor-sleep">Poor sleep</option>
          <option value="low-strength">Low strength</option>
          <option value="bloating">Bloating</option>
          <option value="none">Nothing specific</option>
        </select>
      </Field>

      {error ? (
        <p
          role="alert"
          className="text-xs text-clinical font-mono uppercase tracking-wider"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        aria-label="Build my evidence-backed protocol"
        disabled={loading || validationDisabled}
        className="mt-1 inline-flex items-center justify-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Building your protocol</span>
          </>
        ) : (
          <span>Build my protocol</span>
        )}
      </button>
      <p className="text-[11px] font-mono uppercase tracking-wider text-paper/40 text-center">
        No email. No account. Result loads in seconds.
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className={LABEL}>{label}</span>
      {children}
    </label>
  );
}
