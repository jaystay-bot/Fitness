export type Sex = "male" | "female";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

export type PrimaryGoal =
  | "energy"
  | "muscle"
  | "fat-loss"
  | "longevity"
  | "focus";

export type DietPattern =
  | "omnivore"
  | "vegetarian"
  | "vegan"
  | "keto"
  | "mediterranean";

export type Symptom =
  | "fatigue"
  | "brain-fog"
  | "poor-sleep"
  | "low-strength"
  | "bloating"
  | "none";

export type EvidenceTier = "Strong" | "Moderate" | "Emerging";

export interface UserInput {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  sleepHours: number;
  primaryGoal: PrimaryGoal;
  dietPattern: DietPattern;
  caffeineCupsPerDay: number;
  alcoholDrinksPerWeek: number;
  symptomToFix: Symptom;
}

export interface SupplementPick {
  name: string;
  dose: string;
  timing: string;
  evidenceTier: EvidenceTier;
  studyCount: number;
  whyForYou: string;
  pubmedExample?: string;
}

export interface Recommendation {
  verdict: string;
  bmi: number;
  goalConflict: string | null;
  supplements: SupplementPick[];
  nutrition: {
    eatMore: string[];
    eatLess: string[];
    dailyTargets: {
      proteinGrams: number;
      waterLiters: number;
      sleepHours: number;
    };
  };
  thirtyDayPlan: {
    week: 1 | 2 | 3 | 4;
    focus: string;
    actions: string[];
  }[];
  warnings: string[];
}

export interface SupplementEntry {
  id: string;
  name: string;
  defaultDose: string;
  defaultTiming: string;
  evidenceTier: EvidenceTier;
  studyCount: number;
  goals: PrimaryGoal[];
  symptoms: Symptom[];
  pubmedExample?: string;
  contraindications: string[];
}
