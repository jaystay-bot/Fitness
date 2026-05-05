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

// N=010: feedback widget types — additive only.

export interface FeedbackSubmission {
  message: string;
  userEmail?: string | null;
  pageUrl?: string | null;
  userAgent?: string | null;
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

// N=012: signal-stack tagged input types — additive only.

export type { SignalLayer, TaggedValue } from "./signalLayers";

/**
 * A tagged binding of one UserInput field to a value carrying its
 * source layer, confidence, and timestamp. The generic parameter K
 * preserves type safety at construction sites — e.g. a
 * TaggedUserInput<"age"> has `value: number` automatically.
 */
export interface TaggedUserInput<K extends keyof UserInput = keyof UserInput> {
  field: K;
  value: UserInput[K];
  layer: import("./signalLayers").SignalLayer;
  confidence: number;     // [0, 1]
  timestamp: string;      // ISO 8601
}

// N=015: action-plugin + fulfillment types — additive only.
// Action plugins implement an outbound action surface (e.g. affiliate
// links, telehealth booking, lab kit checkout). Distinguished from the
// signal-plugin variant in lib/pluginContract.ts via the `kind` discriminator.

export interface ActionPluginNormalization {
  readonly name: string;
  readonly kind: "action";
  /**
   * Pure function. Maps a supplement name to a fully-qualified outbound
   * URL the user can open in a new tab. Implementations may read
   * environment variables at call time (NOT at module load time) to
   * pull configuration like affiliate tags.
   */
  generateActionUrl(supplementName: string): string;
  /**
   * N=016: optional. Returns true when this action plugin's button should
   * render for the given recommendation. Implementations that always want
   * to render (e.g. Amazon FulfillButton on every supplement card) leave
   * this undefined. Implementations that escalate conservatively (e.g.
   * the telehealth SpeakToDoctorButton) implement it.
   */
  shouldRender?(recommendation: Recommendation): boolean;
}

export interface FulfillmentClick {
  supplementName: string;
  affiliateUrl: string;
  userId?: string | null;
  clickedAt?: string;
  // N=016: which plugin generated the click. Defaults to "amazon" for
  // backward compatibility with N=015 rows that pre-date the column.
  pluginName?: "amazon" | "telehealth";
}

// N=016: telehealth deep-link types — additive only.

export type TelehealthEscalationReason =
  | "medical-clearance"
  | "goal-conflict"
  | "clinician-oversight-supplement";

export interface TelehealthDeepLink {
  url: string;
  reason: TelehealthEscalationReason | null;
}

// N=017: lab placeholder (manual entry) types — additive only.
// Each field is the canonical biomarker name + measurement unit. Optional
// because users may enter only the markers they have on hand.

export interface ManualLabValue {
  ferritin_ng_ml?: number;
  vitamin_d_25oh_ng_ml?: number;
  b12_pg_ml?: number;
  magnesium_mg_dl?: number;
  tsh_uiu_ml?: number;
}

export interface LabPlaceholderInput {
  values: ManualLabValue;
}
