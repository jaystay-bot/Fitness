// N=015: Amazon action plugin. Second plugin to register against the
// locked Plugin Layer contract; first plugin to implement the action
// variant (outbound URL generation rather than inbound TaggedUserInput
// emission).
//
// Reads `process.env.AMAZON_ASSOCIATES_TAG` at call time so the env var
// can be configured after deployment without redeploying. When the tag
// is unset, the plugin still produces a working Amazon URL — it just
// omits the affiliate attribution and no revenue accrues until the tag
// is set.

import type { ActionPluginNormalization } from "@/lib/types";

import { generateAmazonAffiliateUrl } from "./affiliateUrl";

export const amazonPlugin: ActionPluginNormalization = {
  name: "amazon",
  kind: "action",
  generateActionUrl(supplementName: string): string {
    const tag = process.env.AMAZON_ASSOCIATES_TAG ?? "";
    return generateAmazonAffiliateUrl(supplementName, tag);
  },
};
