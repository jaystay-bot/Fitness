// N=036: tiny inline-SVG meters built from REAL values only (study volume,
// evidence-tier strength). No fabricated trend data.

import type { EvidenceTier } from "@/lib/types";

// Horizontal study-volume bar: fraction = studyCount / max across the feed.
export function VolumeBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0.04, Math.min(1, value / max));
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="h-2 flex-1 rounded-full bg-paper/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-lime"
          style={{ width: `${(pct * 100).toFixed(1)}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-paper/55 tabular-nums shrink-0">
        ~{value.toLocaleString()}
      </span>
    </div>
  );
}

const TIER_SEGMENTS: Record<EvidenceTier, number> = {
  Strong: 3,
  Moderate: 2,
  Emerging: 1,
};

// Three-segment evidence-strength meter.
export function TierMeter({ tier }: { tier: EvidenceTier }) {
  const filled = TIER_SEGMENTS[tier];
  return (
    <div className="flex items-center gap-1" aria-label={`${tier} evidence`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-2 w-6 rounded-full ${i < filled ? "bg-gold" : "bg-paper/12"}`}
        />
      ))}
    </div>
  );
}
