// N=016: telehealth deep-link plugin. Third plugin to register against
// the locked Plugin Layer contract; second plugin to implement the
// action variant (after Amazon, N=015). Reuses ActionPluginNormalization
// from N=015 + the additive optional shouldRender? method declared
// alongside it in lib/types.ts.
//
// Reads `process.env.TELEHEALTH_PROVIDER_URL` at call time so the env
// var can be configured after deployment without redeploying. Falls
// back to a generic Sesame Care landing page when the env var is unset.
//
// shouldRender(recommendation) returns true conservatively only when:
//   1. The engine flagged a goalConflict (any severity), OR
//   2. A supplement requiring clinician oversight is in the stack
//      (currently iron or melatonin).
// For routine recommendations, the SpeakToDoctorButton is hidden so
// the result page stays byte-identical to N=015.

import type {
  ActionPluginNormalization,
  Recommendation,
} from "@/lib/types";

import { generateTelehealthDeepLink } from "./deepLink";

const CLINICIAN_OVERSIGHT_KEYS: ReadonlyArray<string> = ["iron", "melatonin"];

export interface TelehealthPlugin extends ActionPluginNormalization {
  shouldRender(recommendation: Recommendation): boolean;
  generateUrlForRecommendation(recommendation: Recommendation | null): string;
}

export const telehealthPlugin: TelehealthPlugin = {
  name: "telehealth",
  kind: "action",
  generateActionUrl(_supplementName: string): string {
    void _supplementName; // telehealth URL is recommendation-context driven, not supplement-name driven
    const providerUrl = process.env.TELEHEALTH_PROVIDER_URL ?? "";
    return generateTelehealthDeepLink(null, providerUrl);
  },
  generateUrlForRecommendation(recommendation: Recommendation | null): string {
    const providerUrl = process.env.TELEHEALTH_PROVIDER_URL ?? "";
    return generateTelehealthDeepLink(recommendation, providerUrl);
  },
  shouldRender(recommendation: Recommendation): boolean {
    if (!recommendation) return false;
    if (recommendation.goalConflict !== null) return true;
    return (recommendation.supplements ?? []).some((s) => {
      const lower = s.name.toLowerCase();
      return CLINICIAN_OVERSIGHT_KEYS.some((k) => lower.startsWith(k));
    });
  },
};
