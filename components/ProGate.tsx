import { canAccess, type ProFeature } from "@/lib/subscription";
import type { SubscriptionTier } from "@/lib/types";

import { UpgradeButton } from "./UpgradeButton";

export function ProGate({
  userTier,
  feature,
  children,
}: {
  userTier: SubscriptionTier | null | undefined;
  feature: ProFeature;
  children: React.ReactNode;
}) {
  if (canAccess(userTier, feature)) {
    return <>{children}</>;
  }
  return (
    <aside className="border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-3">
      <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
        Pro feature — {feature}
      </span>
      <p className="text-sm text-paper/80 leading-snug">
        This is a Pro feature. Upgrade for $5/month or $48/year.
      </p>
      <UpgradeButton variant="subtle" />
    </aside>
  );
}
