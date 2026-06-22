"use client";

import { useMemo, useState } from "react";

import {
  GOAL_FILTERS,
  MAX_STUDY_COUNT,
  RESEARCH_ITEMS,
} from "@/lib/research/feed";
import type { EvidenceTier, PrimaryGoal } from "@/lib/types";
import { ResearchCard } from "./ResearchCard";

type GoalFilter = PrimaryGoal | "all";
type TierFilter = EvidenceTier | "all";

const TIERS: { id: TierFilter; label: string }[] = [
  { id: "all", label: "All evidence" },
  { id: "Strong", label: "Strong" },
  { id: "Moderate", label: "Moderate" },
  { id: "Emerging", label: "Emerging" },
];

export function ResearchFeed() {
  const [goal, setGoal] = useState<GoalFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");

  const items = useMemo(() => {
    return RESEARCH_ITEMS.filter((r) => {
      const goalOk = goal === "all" || r.goals.includes(goal);
      const tierOk = tier === "all" || r.tier === tier;
      return goalOk && tierOk;
    }).sort((a, b) => b.studyCount - a.studyCount);
  }, [goal, tier]);

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-col gap-3 sticky top-0 z-10 bg-ink/85 backdrop-blur-sm py-3 -my-3">
        <div className="flex flex-wrap gap-2">
          {GOAL_FILTERS.map((f) => (
            <Chip key={f.id} active={goal === f.id} onClick={() => setGoal(f.id)}>
              {f.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {TIERS.map((t) => (
            <Chip key={t.id} active={tier === t.id} onClick={() => setTier(t.id)} subtle>
              {t.label}
            </Chip>
          ))}
        </div>
      </div>

      <p className="font-mono text-[11px] uppercase tracking-wider text-paper/50">
        {items.length} {items.length === 1 ? "compound" : "compounds"}
      </p>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-paper/10 bg-surface p-8 text-center text-paper/60">
          No compounds match these filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <ResearchCard key={item.id} item={item} max={MAX_STUDY_COUNT} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  subtle,
  onClick,
  children,
}: {
  active: boolean;
  subtle?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const base =
    "rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition";
  if (active) {
    return (
      <button onClick={onClick} className={`${base} bg-lime text-ink`}>
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={`${base} border ${subtle ? "border-paper/12 text-paper/55" : "border-paper/20 text-paper/75"} hover:border-lime hover:text-paper`}
    >
      {children}
    </button>
  );
}
