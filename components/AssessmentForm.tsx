"use client";

import { useState } from "react";
import { Loader2, Mic } from "lucide-react";

import type { Recommendation, TaggedUserInput, UserInput } from "@/lib/types";
import {
  cmToImperial,
  imperialToCm,
  imperialToKg,
  kgToPounds,
  type UnitSystem,
} from "@/lib/units";
import { AppleHealthUpload } from "./AppleHealthUpload";
import { LabValuesEntry } from "./LabValuesEntry";
import { OuraConnect } from "./OuraConnect";
import { UnitToggle } from "./UnitToggle";
import { VoiceInput } from "./VoiceInput";
import { WhoopConnect } from "./WhoopConnect";

const FIELD =
  "w-full bg-elevate border border-paper/15 rounded-lg px-3 py-2.5 text-sm text-paper placeholder:text-paper/40 transition-colors focus:outline-none focus:border-lime/70 hover:border-paper/25";
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
  inflammation: "unknown",
};

function normalizeIntegerDisplay(raw: string) {
  const digits = raw.replace(/\D+/g, "");
  if (digits.length === 0) return "";
  return digits.replace(/^0+(?=\d)/, "");
}

function normalizeDecimalDisplay(raw: string) {
  const stripped = raw.replace(/[^0-9.]/g, "");
  if (stripped.length === 0) return "";
  const firstDot = stripped.indexOf(".");
  if (firstDot === -1) {
    return normalizeIntegerDisplay(stripped);
  }
  const whole = normalizeIntegerDisplay(stripped.slice(0, firstDot));
  const fraction = stripped.slice(firstDot + 1).replace(/\./g, "");
  return `${whole || "0"}.${fraction}`;
}

function parseDisplayNumber(value: string) {
  if (value === "") return 0;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return 0;
  return parsed;
}

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
  const [ageDisplay, setAgeDisplay] = useState<string>(String(DEFAULTS.age));
  const [feetDisplay, setFeetDisplay] = useState<string>(String(DEFAULT_FEET));
  const [inchesDisplay, setInchesDisplay] = useState<string>(
    String(DEFAULT_INCHES),
  );
  const [poundsDisplay, setPoundsDisplay] = useState<string>(
    String(DEFAULT_POUNDS),
  );
  const [sleepDisplay, setSleepDisplay] = useState<string>(
    String(DEFAULTS.sleepHours),
  );
  const [coffeeDisplay, setCoffeeDisplay] = useState<string>(
    String(DEFAULTS.caffeineCupsPerDay),
  );
  const [alcoholDisplay, setAlcoholDisplay] = useState<string>(
    String(DEFAULTS.alcoholDrinksPerWeek),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  // N=014: optional Apple Health tagged inputs. Empty array when the user
  // skips the upload card; the form's POST body is byte-identical to N=013
  // in that case.
  const [taggedInputs, setTaggedInputs] = useState<TaggedUserInput[]>([]);
  // N=017: optional lab-placeholder tagged inputs. Empty array when the
  // user skips the entry card. Concatenated with the Apple Health array
  // on submission; the priority resolver from N=012 handles layer
  // weighting (lab > wearable > behavior).
  const [labTaggedInputs, setLabTaggedInputs] = useState<TaggedUserInput[]>([]);
  // N=018: optional Whoop wearable tagged inputs. Empty array when the
  // user skips the connect card. Both Apple Health and Whoop emit at the
  // wearable layer; when they target the same UserInput field, the
  // priority resolver's recency tie-break within a layer picks the more
  // recent reading.
  const [whoopTaggedInputs, setWhoopTaggedInputs] = useState<TaggedUserInput[]>([]);
  // N=019: optional Oura wearable tagged inputs. Empty array when the
  // user skips the connect card. Three wearable plugins now coexist
  // (Apple Health, Whoop, Oura) — the priority resolver's within-layer
  // recency tie-break resolves three-way conflicts on the same field
  // without any contract modification.
  const [ouraTaggedInputs, setOuraTaggedInputs] = useState<TaggedUserInput[]>([]);

  function update<K extends keyof UserInput>(key: K, value: UserInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function applyVoicePartial(partial: Partial<UserInput>) {
    setInput((prev) => ({ ...prev, ...partial }));
    if (partial.heightCm !== undefined) {
      const { feet: f, inches: i } = cmToImperial(partial.heightCm);
      setFeetDisplay(String(f));
      setInchesDisplay(String(i));
    }
    if (partial.weightKg !== undefined) {
      const lb = kgToPounds(partial.weightKg);
      setPoundsDisplay(String(lb));
    }
    setVoiceOpen(false);
  }

  function changeUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;
    const feet = parseDisplayNumber(feetDisplay);
    const inches = parseDisplayNumber(inchesDisplay);
    const pounds = parseDisplayNumber(poundsDisplay);
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
        setFeetDisplay(String(f));
        setInchesDisplay(String(i));
        setPoundsDisplay(String(lb));
      } else {
        setFeetDisplay(String(DEFAULT_FEET));
        setInchesDisplay(String(DEFAULT_INCHES));
        setPoundsDisplay(String(DEFAULT_POUNDS));
      }
    }
    setUnitSystem(next);
  }

  const parsedFeet = parseDisplayNumber(feetDisplay);
  const parsedInches = parseDisplayNumber(inchesDisplay);
  const parsedPounds = parseDisplayNumber(poundsDisplay);
  const parsedAge = parseDisplayNumber(ageDisplay);
  const parsedSleepHours = parseDisplayNumber(sleepDisplay);
  const parsedCoffee = parseDisplayNumber(coffeeDisplay);
  const parsedAlcohol = parseDisplayNumber(alcoholDisplay);

  let derivedHeightCm: number;
  let derivedWeightKg: number;
  if (unitSystem === "imperial") {
    derivedHeightCm = imperialToCm(parsedFeet, parsedInches);
    derivedWeightKg = imperialToKg(parsedPounds);
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
        age: parsedAge,
        heightCm: derivedHeightCm,
        weightKg: derivedWeightKg,
        sleepHours: parsedSleepHours,
        caffeineCupsPerDay: parsedCoffee,
        alcoholDrinksPerWeek: parsedAlcohol,
      };
      const requestBody: { input?: never; taggedInputs?: TaggedUserInput[] } & UserInput = {
        ...payload,
      };
      const allTagged = [
        ...taggedInputs,
        ...labTaggedInputs,
        ...whoopTaggedInputs,
        ...ouraTaggedInputs,
      ];
      if (allTagged.length > 0) {
        requestBody.taggedInputs = allTagged;
      }
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
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
    <div className="w-full max-w-md flex flex-col gap-3">
      <AppleHealthUpload onTagged={setTaggedInputs} />
      <LabValuesEntry onTagged={setLabTaggedInputs} />
      <WhoopConnect onTagged={setWhoopTaggedInputs} />
      <OuraConnect onTagged={setOuraTaggedInputs} />
      <form
        onSubmit={submit}
        aria-label="Apex Protocol assessment form"
        className="w-full bg-surface border border-paper/10 rounded-2xl p-5 sm:p-6 flex flex-col gap-4 shadow-card"
      >
      <div className="flex items-center justify-between">
        <span className={LABEL}>Quick start</span>
        <button
          type="button"
          onClick={() => setVoiceOpen((v) => !v)}
          aria-label="Open voice input"
          aria-expanded={voiceOpen}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-lime border border-lime/40 rounded-md px-2.5 py-1 hover:border-lime"
        >
          <Mic className="w-3 h-3" aria-hidden="true" />
          Speak protocol
        </button>
      </div>
      {voiceOpen ? (
        <VoiceInput
          onCommit={applyVoicePartial}
          onClose={() => setVoiceOpen(false)}
        />
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Age" id="age">
          <input
            id="age"
            type="number"
            min={18}
            max={90}
            inputMode="numeric"
            className={FIELD}
            value={ageDisplay}
            onChange={(e) => {
              const next = normalizeIntegerDisplay(e.target.value);
              setAgeDisplay(next);
            }}
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
                    value={feetDisplay}
                    onChange={(e) => {
                      const next = normalizeIntegerDisplay(e.target.value);
                      setFeetDisplay(next);
                    }}
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
                    value={inchesDisplay}
                    onChange={(e) => {
                      const next = normalizeIntegerDisplay(e.target.value);
                      setInchesDisplay(next);
                    }}
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
                value={poundsDisplay}
                onChange={(e) => {
                  const next = normalizeIntegerDisplay(e.target.value);
                  setPoundsDisplay(next);
                }}
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
          <option value="gain-weight">Gain weight</option>
          <option value="longevity">Longevity</option>
          <option value="focus">Focus</option>
        </select>
      </Field>

      <details className="group">
        <summary className="cursor-pointer list-none flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-paper/60 hover:text-paper">
          <span>Fine-tune (optional)</span>
          <span className="h-px flex-1 bg-paper/15" aria-hidden="true" />
          <span className="text-paper/40 group-open:hidden">▼ Show</span>
          <span className="text-paper/40 hidden group-open:inline">▲ Hide</span>
        </summary>
        <div className="flex flex-col gap-4 mt-4">
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
            value={sleepDisplay}
            onChange={(e) => {
              const next = normalizeDecimalDisplay(e.target.value);
              setSleepDisplay(next);
            }}
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
            value={coffeeDisplay}
            onChange={(e) => {
              const next = normalizeIntegerDisplay(e.target.value);
              setCoffeeDisplay(next);
            }}
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
            value={alcoholDisplay}
            onChange={(e) => {
              const next = normalizeIntegerDisplay(e.target.value);
              setAlcoholDisplay(next);
            }}
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

      <Field label="Inflammation (optional)" id="inflammation">
        <select
          id="inflammation"
          className={FIELD}
          value={input.inflammation ?? "unknown"}
          onChange={(e) =>
            update(
              "inflammation",
              e.target.value as UserInput["inflammation"],
            )
          }
        >
          <option value="unknown">Not sure</option>
          <option value="low">Low / none</option>
          <option value="elevated">Elevated (sore, puffy, slow recovery)</option>
          <option value="high">High (known high CRP / flare)</option>
        </select>
      </Field>
        </div>
      </details>

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
        className="mt-1 inline-flex items-center justify-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-xl px-4 py-3.5 transition hover:brightness-105 hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none"
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
    </div>
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
