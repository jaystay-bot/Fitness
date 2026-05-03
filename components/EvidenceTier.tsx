import type { EvidenceTier as EvidenceTierType } from "@/lib/types";

const STYLES: Record<EvidenceTierType, string> = {
  Strong: "bg-lime text-ink",
  Moderate: "bg-paper/10 text-paper border border-paper/30",
  Emerging: "bg-clinical/20 text-clinical border border-clinical/50",
};

export function EvidenceTier({
  tier,
  studyCount,
}: {
  tier: EvidenceTierType;
  studyCount: number;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-sm ${STYLES[tier]}`}
    >
      <span>{tier}</span>
      <span className="opacity-70">·</span>
      <span className="opacity-70">~{studyCount} RCTs</span>
    </span>
  );
}
