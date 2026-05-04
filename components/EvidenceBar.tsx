"use client";

import { useEffect, useState } from "react";

import type { EvidenceTier } from "@/lib/types";

const FILL_DURATION_MS = 600;

const TIER_COLOR: Record<EvidenceTier, string> = {
  Strong: "bg-lime",
  Moderate: "bg-paper",
  Emerging: "bg-paper/30",
};

const TIER_TEXT_COLOR: Record<EvidenceTier, string> = {
  Strong: "text-ink",
  Moderate: "text-ink",
  Emerging: "text-paper",
};

const TIER_BADGE_BG: Record<EvidenceTier, string> = {
  Strong: "bg-lime",
  Moderate: "bg-paper/10 border border-paper/30 text-paper",
  Emerging: "bg-clinical/10 border border-clinical/40 text-clinical",
};

function targetWidth(studyCount: number): number {
  const v = (Math.log10(studyCount + 1) / Math.log10(1000)) * 100;
  return Math.max(2, Math.min(100, v));
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function EvidenceBar({
  tier,
  studyCount,
}: {
  tier: EvidenceTier;
  studyCount: number;
}) {
  const final = targetWidth(studyCount);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setWidth(final);
      return;
    }
    setWidth(0);
    const id = window.requestAnimationFrame(() => setWidth(final));
    return () => window.cancelAnimationFrame(id);
  }, [final]);

  const badgeClass =
    tier === "Strong"
      ? `${TIER_BADGE_BG[tier]} ${TIER_TEXT_COLOR[tier]}`
      : TIER_BADGE_BG[tier];

  return (
    <div className="flex flex-col gap-1.5 min-w-[120px]">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-sm ${badgeClass}`}
        >
          {tier}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          ~{studyCount} RCTs
        </span>
      </div>
      <div
        className="h-1 w-full rounded-sm bg-paper/10 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(final)}
        aria-label={`${tier} evidence, approximately ${studyCount} RCTs`}
      >
        <div
          className={`${TIER_COLOR[tier]} h-full rounded-sm`}
          style={{
            width: `${width}%`,
            transition: `width ${FILL_DURATION_MS}ms ease-out`,
          }}
        />
      </div>
    </div>
  );
}
