// N=028: Compliance + disclaimer layer. Keeps supplement copy on the right side
// of FTC/FDA structure-function rules: products may describe what a label says
// or what something is "commonly used for", but must never claim to cure, treat,
// diagnose, or prevent disease, promise results, or hand out dosage instructions
// beyond the label.

export const STANDARD_DISCLAIMER =
  "Educational only. Not medical advice. These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease.";

export const PRICE_DISCLAIMER =
  "Prices and availability may change. Verify details with the retailer.";

export const CONSULT_DOCTOR =
  "Check with a clinician if you are pregnant, nursing, on medication, or managing a condition.";

export const ROUTING_DISCLOSURE =
  "We do not sell these products. We route you to trusted retailers so you can compare and buy.";

// Phrasing that is NOT allowed to appear in product copy. Matched case-insensitive.
const BLOCKED_CLAIM_PATTERNS: RegExp[] = [
  /\bcures?\b/i,
  /\bwill (?:fix|cure|heal)\b/i,
  /\b(?:treats?|diagnoses?|prevents?)\s+(?:disease|illness|cancer|diabetes|covid)/i,
  /\bguaranteed results?\b/i,
  /\bmiracle\b/i,
  /\bclinically proven to (?:cure|treat|prevent)\b/i,
  /\bdoctor[- ]recommended\b/i, // only allowed when separately verified
  /\bbest supplement for you\b/i,
];

/** True when the text contains a blocked medical/marketing claim. */
export function containsMedicalClaim(text: string): boolean {
  return BLOCKED_CLAIM_PATTERNS.some((re) => re.test(text));
}

export interface ComplianceIssue {
  field: string;
  text: string;
  pattern: string;
}

/**
 * Scan a product's free-text fields for blocked claims. Returns [] when clean.
 * Used as a dev/test guard so unsafe copy can never ship in seed data.
 */
export function auditCopy(
  fields: Record<string, string>,
): ComplianceIssue[] {
  const issues: ComplianceIssue[] = [];
  for (const [field, text] of Object.entries(fields)) {
    for (const re of BLOCKED_CLAIM_PATTERNS) {
      if (re.test(text)) {
        issues.push({ field, text, pattern: re.source });
      }
    }
  }
  return issues;
}

// Safe lead-ins copy can use when describing a supplement.
export const ALLOWED_LEAD_INS = [
  "Commonly used for",
  "Often marketed for",
  "Label says",
  "Contains",
  "Typically taken for",
] as const;
