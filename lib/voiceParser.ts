import type { UserInput, VoiceParseResult } from "./types";

const NUMBER_WORDS: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
  eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18,
  nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90, hundred: 100,
};

const KEYS: (keyof UserInput)[] = [
  "age", "sex", "heightCm", "weightKg", "activityLevel",
  "sleepHours", "primaryGoal", "dietPattern",
  "caffeineCupsPerDay", "alcoholDrinksPerWeek", "symptomToFix",
];

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// Convert phrases like "thirty one" → 31, "one ninety" → 190, "one hundred ninety" → 190.
function wordsToNumber(words: string[]): number | null {
  if (words.length === 0) return null;
  // Special-case the colloquial concatenation form "X Y" where X∈1..9 and
  // Y∈20..90 — common for weight ("one ninety" = 190 lbs).
  if (words.length === 2) {
    const x = NUMBER_WORDS[words[0]];
    const y = NUMBER_WORDS[words[1]];
    if (
      x !== undefined && y !== undefined &&
      x >= 1 && x <= 9 && y >= 20 && y <= 90
    ) {
      return x * 100 + y;
    }
  }
  let total = 0;
  let current = 0;
  for (const w of words) {
    const v = NUMBER_WORDS[w];
    if (v === undefined) return null;
    if (v === 100) {
      current = (current === 0 ? 1 : current) * 100;
    } else {
      current += v;
    }
  }
  total += current;
  return total > 0 ? total : null;
}

function findNumber(text: string, regex: RegExp): number | null {
  const m = regex.exec(text);
  if (!m) return null;
  const raw = m[1];
  if (!raw) return null;
  const direct = Number(raw);
  if (Number.isFinite(direct)) return direct;
  const words = raw.toLowerCase().split(/[\s-]+/).filter(Boolean);
  return wordsToNumber(words);
}

const NUM_OR_WORDS = String.raw`(\d+|(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)(?:[\s-]+(?:zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred))*)`;

function parseAge(s: string): number | undefined {
  // Try "31 year(s) old" / "31 yo" / "thirty one years old".
  const explicit = findNumber(
    s,
    new RegExp(`${NUM_OR_WORDS}\\s*(?:y(?:ear)?s?(?:[-\\s]?old)?|yo|y/o)\\b`, "i"),
  );
  if (explicit !== null && explicit >= 18 && explicit <= 90) return explicit;
  // Try "i'm 31 ..." — bare digit followed by something that suggests age.
  const bare = findNumber(s, new RegExp(`\\b${NUM_OR_WORDS}\\b`, "i"));
  if (bare !== null && bare >= 18 && bare <= 90) return bare;
  return undefined;
}

function parseSex(s: string): UserInput["sex"] | undefined {
  if (/\b(female|woman|girl)\b/i.test(s)) return "female";
  if (/\b(male|man|guy)\b/i.test(s)) return "male";
  return undefined;
}

function parseHeightCm(s: string): number | undefined {
  // Metric first.
  const cm = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:cm|centimeters?)\\b`, "i"));
  if (cm !== null && cm >= 140 && cm <= 220) return cm;
  const m = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:m|meters?)\\b`, "i"));
  if (m !== null && m >= 1.4 && m <= 2.2) return Math.round(m * 100);

  // Imperial: "5'10"" or "5 10" or "five ten" or "six feet" or "six feet two".
  const fi = /\b(\d+|five|six|seven)\s*(?:'|feet|foot|ft)\s*(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven)?\s*(?:"|inches?|in|tall)?/i.exec(s);
  if (fi) {
    const f = Number(fi[1]) || NUMBER_WORDS[fi[1].toLowerCase()] || 0;
    const i = fi[2] ? (Number(fi[2]) || NUMBER_WORDS[fi[2].toLowerCase()] || 0) : 0;
    const cm2 = Math.round((f * 12 + i) * 2.54);
    if (cm2 >= 140 && cm2 <= 220) return cm2;
  }
  // Bare two-token "five ten" pattern.
  const ft = /\b(four|five|six|seven)\s+(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|\d{1,2})\b/i.exec(s);
  if (ft) {
    const f = NUMBER_WORDS[ft[1].toLowerCase()];
    const i = Number(ft[2]) || NUMBER_WORDS[ft[2].toLowerCase()] || 0;
    if (f !== undefined) {
      const cm3 = Math.round((f * 12 + i) * 2.54);
      if (cm3 >= 140 && cm3 <= 220) return cm3;
    }
  }
  return undefined;
}

function parseWeightKg(s: string): number | undefined {
  const kg = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:kg|kilograms?|kilos)\\b`, "i"));
  if (kg !== null && kg >= 40 && kg <= 200) return kg;
  const lb = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:lb|lbs|pounds?)\\b`, "i"));
  if (lb !== null) {
    const k = Math.round(lb * 0.453592);
    if (k >= 40 && k <= 200) return k;
  }
  // "one ninety" or "one ninety pounds" (handled above) or as bare "190" lone.
  const bareLbWords = /\b(one|two)\s+(forty|fifty|sixty|seventy|eighty|ninety|hundred)\b/i.exec(s);
  if (bareLbWords) {
    const v = (NUMBER_WORDS[bareLbWords[1].toLowerCase()] || 0) * 100 +
              (NUMBER_WORDS[bareLbWords[2].toLowerCase()] || 0);
    const k = Math.round(v * 0.453592);
    if (k >= 40 && k <= 200) return k;
  }
  return undefined;
}

function parseGoal(s: string): UserInput["primaryGoal"] | undefined {
  if (/\b(muscle|build|gain|bulk|hypertrophy|stronger)\b/i.test(s)) return "muscle";
  if (/\b(fat\s*loss|lose\s*weight|cut|lean\s*out|leaner)\b/i.test(s)) return "fat-loss";
  if (/\b(longevity|long\s*life|healthspan|aging)\b/i.test(s)) return "longevity";
  if (/\b(focus|concentrate|cognitive|brain|sharper|productivity)\b/i.test(s)) return "focus";
  if (/\b(energy|all\s*day\s*energy|more\s*energy|tired|fatigue)\b/i.test(s)) return "energy";
  return undefined;
}

function parseDiet(s: string): UserInput["dietPattern"] | undefined {
  if (/\bvegan\b/i.test(s)) return "vegan";
  if (/\bvegetarian\b/i.test(s)) return "vegetarian";
  if (/\bketo\b/i.test(s)) return "keto";
  if (/\bmediterranean\b/i.test(s)) return "mediterranean";
  if (/\bomnivor(e|ous)\b/i.test(s)) return "omnivore";
  return undefined;
}

function parseActivity(s: string): UserInput["activityLevel"] | undefined {
  if (/\b(sedentary|deskbound|don'?t move|no exercise)\b/i.test(s)) return "sedentary";
  if (/\b(light(ly)?\s*active|walk|walking)\b/i.test(s)) return "light";
  if (/\b(moderate(ly)?\s*active|moderate)\b/i.test(s)) return "moderate";
  if (/\b(very\s*active|highly\s*active|train\s*hard|elite)\b/i.test(s)) return "high";
  return undefined;
}

function parseSleep(s: string): number | undefined {
  const h = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:hour|hr)s?\\s*(?:of\\s*sleep|sleep)?\\b`, "i"));
  if (h !== null && h >= 3 && h <= 12) return h;
  return undefined;
}

function parseCaffeine(s: string): number | undefined {
  const c = findNumber(s, new RegExp(`${NUM_OR_WORDS}\\s*(?:cups?|coffees?|espressos?|coffee\\s*cups?)\\b`, "i"));
  if (c !== null) return clamp(Math.round(c), 0, 8);
  return undefined;
}

function parseAlcohol(s: string): number | undefined {
  const m = new RegExp(`${NUM_OR_WORDS}\\s*(?:drinks?|beers?|wines?|cocktails?|glasses?)`, "i").exec(s);
  if (!m) return undefined;
  const value = (() => {
    const n = Number(m[1]);
    if (Number.isFinite(n)) return n;
    const words = m[1].toLowerCase().split(/[\s-]+/).filter(Boolean);
    return wordsToNumber(words);
  })();
  if (value === null) return undefined;
  // Unit detection (per week vs per day vs none) — caller speech often
  // says "three drinks a week" or "two beers a day".
  const tail = s.slice(m.index + m[0].length, m.index + m[0].length + 30);
  const perDay = /\b(a|per)\s*(day|night|nightly)\b/i.test(tail);
  const weekly = perDay ? value * 7 : value;
  return clamp(Math.round(weekly), 0, 30);
}

function parseSymptom(s: string): UserInput["symptomToFix"] | undefined {
  if (/\b(brain\s*fog|foggy|hazy|cloudy)\b/i.test(s)) return "brain-fog";
  if (/\b(can'?t\s*sleep|insomnia|poor\s*sleep|trouble\s*sleeping|bad\s*sleep)\b/i.test(s))
    return "poor-sleep";
  if (/\b(weak|low\s*strength|no\s*power|can'?t\s*lift)\b/i.test(s)) return "low-strength";
  if (/\b(bloated|bloating|gas|gassy)\b/i.test(s)) return "bloating";
  if (/\b(tired|fatigue|low\s*energy|exhausted|wiped)\b/i.test(s)) return "fatigue";
  if (/\b(nothing|no\s*symptom)\b/i.test(s)) return "none";
  return undefined;
}

export function parseVoiceInput(transcript: string): VoiceParseResult {
  const s = transcript ?? "";
  const partial: Partial<UserInput> = {};
  const matched: (keyof UserInput)[] = [];
  const missing: (keyof UserInput)[] = [];

  const candidates: { key: keyof UserInput; value: UserInput[keyof UserInput] | undefined }[] = [
    { key: "age", value: parseAge(s) },
    { key: "sex", value: parseSex(s) },
    { key: "heightCm", value: parseHeightCm(s) },
    { key: "weightKg", value: parseWeightKg(s) },
    { key: "activityLevel", value: parseActivity(s) },
    { key: "sleepHours", value: parseSleep(s) },
    { key: "primaryGoal", value: parseGoal(s) },
    { key: "dietPattern", value: parseDiet(s) },
    { key: "caffeineCupsPerDay", value: parseCaffeine(s) },
    { key: "alcoholDrinksPerWeek", value: parseAlcohol(s) },
    { key: "symptomToFix", value: parseSymptom(s) },
  ];

  for (const c of candidates) {
    if (c.value === undefined) {
      missing.push(c.key);
    } else {
      (partial as Record<string, unknown>)[c.key] = c.value;
      matched.push(c.key);
    }
  }

  // Defensive: ensure all keys are accounted for.
  for (const k of KEYS) {
    if (!matched.includes(k) && !missing.includes(k)) missing.push(k);
  }

  return { partial, matched, missing };
}
