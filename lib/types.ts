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

export type ConflictSeverity = "block" | "warn";

export interface ConflictFlag {
  severity: ConflictSeverity;
  message: string;
  suggestedFix: string;
}

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
  confidence: number;
}

export interface Recommendation {
  verdict: string;
  bmi: number;
  goalConflict: ConflictFlag | null;
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
  variationSeed: number;
}

export type SubscriptionTier = "free" | "pro";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "trialing";

export interface ShareableResult {
  slug: string;
  input: UserInput;
}

export interface EmailCapturePayload {
  email: string;
  slug: string;
  verdict: string;
}

// N=008: interactive expansion types — additive only.

export type BodySystem =
  | "brain"
  | "heart"
  | "liver"
  | "gut"
  | "muscles"
  | "bones"
  | "immune"
  | "skin";

export interface VoiceParseResult {
  partial: Partial<UserInput>;
  matched: (keyof UserInput)[];
  missing: (keyof UserInput)[];
}

export interface TimelineDayDetailEntry {
  name: string;
  energy: number;
  focus: number;
  sleep: number;
  strength: number;
}

// N=009: Project Spear positioning types — additive only.

export type SpearEntryPath = "what-hurts" | "what-do-i-need" | "i-know-product";

export interface VaultPreview {
  balance: number;
  savedThisMonth: number;
  healthScore: number;
}

export interface UninsuranceCopy {
  bullets: readonly string[];
  closer: string;
}

// N=007: clinical companion types — added without modifying any prior shape.

export interface LabValues {
  ferritin_ng_ml?: number;
  vitamin_d_25oh_ng_ml?: number;
  b12_pg_ml?: number;
  magnesium_mg_dl?: number;
  total_cholesterol_mg_dl?: number;
  hdl_mg_dl?: number;
  ldl_mg_dl?: number;
  triglycerides_mg_dl?: number;
  glucose_fasting_mg_dl?: number;
  hba1c_pct?: number;
}

export interface ParsedLabResponse {
  ok: boolean;
  format?: "quest" | "labcorp" | "zrt" | "unknown";
  values?: LabValues;
  reason?: string;
}

export interface ScanIdentification {
  ok: boolean;
  identified: string | null;       // canonical supplement id
  dose_mg: number | null;
  raw_text: string;
  confidence: number;              // 0..1
  reason?: string;
}

export type ScanMatch = "match" | "mismatch" | "unknown";

export interface BottleMatch {
  identified: string | null;
  dose_mg: number | null;
  confidence: number;
  comparedTo: string | null;       // protocol pick name, when applicable
  match: ScanMatch;
  message: string;
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
