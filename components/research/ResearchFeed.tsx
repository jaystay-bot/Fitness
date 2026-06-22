"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Star } from "lucide-react";

import { GOAL_FILTERS, type ResearchItem } from "@/lib/research/feed";
import { dailyIndex, readStack } from "@/lib/research/personal";
import type { EvidenceTier, PrimaryGoal } from "@/lib/types";
import { ResearchCard } from "./ResearchCard";

type GoalFilter = PrimaryGoal | "all" | "for-you";
type TierFilter = EvidenceTier | "all";

const TIERS: { id: TierFilter; label: string }[] = [
  { id: "all", label: "All evidence" },
  { id: "Strong", label: "Strong" },
  { id: "Moderate", label: "Moderate" },
  { id: "Emerging", label: "Emerging" },
];

export function ResearchFeed({ items: allItems }: { items: ResearchItem[] }) {
  const maxStudies = useMemo(
    () => Math.max(1, ...allItems.map((r) => r.studyCount)),
    [allItems],
  );
  const [goal, setGoal] = useState<GoalFilter>("all");
  const [tier, setTier] = useState<TierFilter>("all");
  // Personalization is read after mount so SSR output matches (no hydration gap).
  const [stack, setStack] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setStack(readStack());
    setMounted(true);
  }, []);

  const inStack = useMemo(() => new Set(stack), [stack]);
  const hasStack = mounted && inStack.size > 0;

  // Deterministic "read of the day".
  const todays = mounted ? allItems[dailyIndex(allItems.length)] : null;

  const items = useMemo(() => {
    const filtered = allItems.filter((r) => {
      const goalOk =
        goal === "all"
          ? true
          : goal === "for-you"
            ? inStack.has(r.name)
            : r.goals.includes(goal);
      const tierOk = tier === "all" || r.tier === tier;
      return goalOk && tierOk;
    });
    // Stack compounds first, then by study volume.
    return filtered.sort((a, b) => {
      const aIn = inStack.has(a.name) ? 1 : 0;
      const bIn = inStack.has(b.name) ? 1 : 0;
      if (aIn !== bIn) return bIn - aIn;
      return b.studyCount - a.studyCount;
    });
  }, [goal, tier, inStack, allItems]);

  return (
    <div className="flex flex-col gap-5">
      {/* Today's read */}
      {todays ? (
        <div className="rounded-2xl border border-lime/30 bg-lime/[0.04] p-5 shadow-card">
          <div className="flex items-center gap-2 mb-3 font-mono text-[11px] uppercase tracking-wider text-lime">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            Today&apos;s read
          </div>
          <ResearchCard item={todays} max={maxStudies} inStack={inStack.has(todays.name)} />
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col gap-3 sticky top-0 z-10 bg-ink/85 backdrop-blur-sm py-3 -my-3">
        <div className="flex flex-wrap gap-2">
          {hasStack ? (
            <Chip active={goal === "for-you"} onClick={() => setGoal("for-you")}>
              <Star className="w-3 h-3" aria-hidden /> For you
            </Chip>
          ) : null}
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
        {hasStack ? ` · ${inStack.size} in your stack` : ""}
      </p>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-paper/10 bg-surface p-8 text-center text-paper/60">
          {goal === "for-you"
            ? "Build a protocol and your compounds will show up here."
            : "No compounds match these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <ResearchCard
              key={item.id}
              item={item}
              max={maxStudies}
              inStack={inStack.has(item.name)}
            />
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
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition";
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
