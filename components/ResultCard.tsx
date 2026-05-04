"use client";

import dynamic from "next/dynamic";
import { AlertTriangle, Calendar, Pill, Salad } from "lucide-react";

import type { Recommendation, UserInput } from "@/lib/types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ConflictBanner } from "./ConflictBanner";
import { EvidenceBar } from "./EvidenceBar";
import { VerdictReveal } from "./VerdictReveal";

const SupplementBottle3D = dynamic(
  () =>
    import("./SupplementBottle3D").then((m) => ({
      default: m.SupplementBottle3D,
    })),
  { ssr: false },
);

export function ResultCard({
  result,
  input,
}: {
  result: Recommendation;
  input: UserInput;
}) {
  const featured = result.supplements[0];
  return (
    <section
      aria-label="Your Apex Protocol result"
      className="mt-12 sm:mt-16 border-t border-paper/15 pt-10"
    >
      {result.goalConflict ? <ConflictBanner flag={result.goalConflict} /> : null}
      <div className="flex flex-col gap-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-lime">
          Your protocol — {input.primaryGoal}
        </span>
        <VerdictReveal text={result.verdict} />
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-wider text-paper/60">
          <span>BMI {result.bmi}</span>
          <span>Protein {result.nutrition.dailyTargets.proteinGrams} g/day</span>
          <span>Water {result.nutrition.dailyTargets.waterLiters} L/day</span>
          <span>Sleep {result.nutrition.dailyTargets.sleepHours} h/night</span>
        </div>
      </div>

      {featured ? (
        <div className="mt-8 flex justify-center">
          <SupplementBottle3D name={featured.name} tier={featured.evidenceTier} />
        </div>
      ) : null}

      <SectionHeader icon={<Pill className="w-4 h-4" aria-hidden="true" />}>
        Stack ({result.supplements.length} {result.supplements.length === 1 ? "pick" : "picks"})
      </SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.supplements.map((s) => (
          <article
            key={s.name}
            className="border border-paper/15 rounded-lg p-4 flex flex-col gap-2"
          >
            <header className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-lg leading-tight">{s.name}</h3>
              <EvidenceBar tier={s.evidenceTier} studyCount={s.studyCount} />
            </header>
            <dl className="text-xs font-mono uppercase tracking-wider text-paper/60 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt>Dose</dt>
              <dd className="text-paper/90 normal-case tracking-normal font-sans">{s.dose}</dd>
              <dt>Timing</dt>
              <dd className="text-paper/90 normal-case tracking-normal font-sans">{s.timing}</dd>
              {s.pubmedExample ? (
                <>
                  <dt>Reference</dt>
                  <dd className="text-paper/70 font-mono">{s.pubmedExample}</dd>
                </>
              ) : null}
            </dl>
            <p className="text-sm text-paper/80">{s.whyForYou}</p>
            <div className="flex justify-end mt-1">
              <ConfidenceBadge confidence={s.confidence} />
            </div>
          </article>
        ))}
      </div>

      <SectionHeader icon={<Salad className="w-4 h-4" aria-hidden="true" />}>
        Daily food protocol
      </SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <NutritionList title="Eat more" items={result.nutrition.eatMore} positive />
        <NutritionList title="Eat less" items={result.nutrition.eatLess} />
      </div>

      <SectionHeader icon={<Calendar className="w-4 h-4" aria-hidden="true" />}>
        30-day execution plan
      </SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {result.thirtyDayPlan.map((week) => (
          <article
            key={week.week}
            className="border border-paper/15 rounded-lg p-4 flex flex-col gap-2"
          >
            <h3 className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
              Week {week.week}
            </h3>
            <p className="font-serif text-lg leading-tight">{week.focus}</p>
            <ul className="flex flex-col gap-1.5 text-sm text-paper/80">
              {week.actions.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-lime mt-1.5 w-1 h-1 rounded-full bg-lime shrink-0" aria-hidden="true" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <SectionHeader icon={<AlertTriangle className="w-4 h-4" aria-hidden="true" />} accent="clinical">
        Stack warnings
      </SectionHeader>
      <ul className="border border-clinical/40 bg-clinical/5 rounded-lg p-4 flex flex-col gap-2 text-sm text-paper/90">
        {result.warnings.map((w, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-clinical mt-1.5 w-1 h-1 rounded-full bg-clinical shrink-0" aria-hidden="true" />
            <span>{w}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionHeader({
  children,
  icon,
  accent,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  accent?: "lime" | "clinical";
}) {
  const color = accent === "clinical" ? "text-clinical" : "text-lime";
  return (
    <h2
      className={`mt-10 mb-3 font-mono text-[11px] uppercase tracking-wider flex items-center gap-2 ${color}`}
    >
      {icon}
      <span>{children}</span>
    </h2>
  );
}

function NutritionList({
  title,
  items,
  positive,
}: {
  title: string;
  items: string[];
  positive?: boolean;
}) {
  const dotColor = positive ? "bg-lime" : "bg-clinical";
  return (
    <div className="border border-paper/15 rounded-lg p-4">
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-paper/60 mb-2">
        {title}
      </h3>
      <ul className="flex flex-col gap-1.5 text-sm text-paper/85">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className={`mt-1.5 w-1 h-1 rounded-full shrink-0 ${dotColor}`} aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
