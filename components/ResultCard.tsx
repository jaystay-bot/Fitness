"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, Pill, Salad } from "lucide-react";

import { encodeInput } from "@/lib/slug";
import type { Recommendation, SubscriptionTier, UserInput } from "@/lib/types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ConflictBanner } from "./ConflictBanner";
import { EmailCapture } from "./EmailCapture";
import { EvidenceBar } from "./EvidenceBar";
import { FulfillButton } from "./FulfillButton";
import { ProGate } from "./ProGate";
import { UpgradeButton } from "./UpgradeButton";
import { VerdictReveal } from "./VerdictReveal";

const SupplementBottle3D = dynamic(
  () =>
    import("./SupplementBottle3D").then((m) => ({
      default: m.SupplementBottle3D,
    })),
  { ssr: false },
);

const InteractiveTimeline = dynamic(
  () =>
    import("./InteractiveTimeline").then((m) => ({
      default: m.InteractiveTimeline,
    })),
  { ssr: false },
);

const BodyVisualization = dynamic(
  () =>
    import("./BodyVisualization").then((m) => ({
      default: m.BodyVisualization,
    })),
  { ssr: false },
);

const LabUpload = dynamic(
  () => import("./LabUpload").then((m) => ({ default: m.LabUpload })),
  { ssr: false },
);

const BottleScanner = dynamic(
  () => import("./BottleScanner").then((m) => ({ default: m.BottleScanner })),
  { ssr: false },
);

function useTier(): SubscriptionTier | null {
  const [tier, setTier] = useState<SubscriptionTier | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/subscription", { method: "GET" });
        if (!cancelled) {
          if (res.status === 401) {
            setTier("free");
            return;
          }
          if (res.ok) {
            const data = (await res.json()) as { tier?: SubscriptionTier };
            setTier(data.tier ?? "free");
            return;
          }
          setTier("free");
        }
      } catch {
        if (!cancelled) setTier("free");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return tier;
}

export function ResultCard({
  result,
  input,
  shareSlug,
}: {
  result: Recommendation;
  input: UserInput;
  shareSlug?: string;
}) {
  const featured = result.supplements[0];
  const slug = shareSlug ?? encodeInput(input);
  const tier = useTier();
  return (
    <section
      aria-label="Your Apex Protocol result"
      className="mt-10 sm:mt-14 border-t border-paper/15 pt-8 sm:pt-10 min-w-0 overflow-x-hidden pb-24"
    >
      {result.goalConflict ? <ConflictBanner flag={result.goalConflict} /> : null}
      <div className="flex flex-col gap-3 min-w-0">
        <span className="text-[11px] font-mono uppercase tracking-wider text-lime">
          Your protocol — {input.primaryGoal}
        </span>
        <VerdictReveal text={result.verdict} />
        <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs font-mono uppercase tracking-wider text-paper/60 min-w-0">
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

      <details className="group" open>
        <summary className="cursor-pointer list-none mt-10 mb-3 font-mono text-[11px] uppercase tracking-wider text-lime flex items-center gap-2">
          <Pill className="w-4 h-4" aria-hidden="true" />
          <span>Body systems map</span>
          <span className="ml-auto text-paper/40 group-open:hidden">▼ Show</span>
          <span className="ml-auto text-paper/40 hidden group-open:inline">▲ Hide</span>
        </summary>
        <BodyVisualization
          picks={result.supplements}
          warnings={result.warnings}
        />
      </details>

      <div className="mt-10 mb-1 flex flex-col gap-1">
        <p className="text-xs font-mono uppercase tracking-wider text-paper/50">
          Built from 500+ clinical studies · Strong / Moderate / Emerging evidence tiers
        </p>
        <p className="text-sm text-paper/70 italic leading-snug">
          Most people are wasting money on supplements with no real evidence behind them. This stack is different.
        </p>
      </div>

      <SectionHeader icon={<Pill className="w-4 h-4" aria-hidden="true" />}>
        Stack ({result.supplements.length} {result.supplements.length === 1 ? "pick" : "picks"})
      </SectionHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
        {result.supplements.map((s) => (
          <article
            key={s.name}
            className="border border-paper/15 rounded-lg p-4 flex flex-col gap-2 min-w-0"
          >
            <header className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-lg leading-tight break-words">{s.name}</h3>
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
            <div className="flex items-center justify-between gap-3 mt-1">
              <FulfillButton supplementName={s.name} />
              <ConfidenceBadge confidence={s.confidence} />
            </div>
          </article>
        ))}
      </div>

      <SectionHeader icon={<Calendar className="w-4 h-4" aria-hidden="true" />}>
        Pro · clinical companion
      </SectionHeader>
      <div className="flex flex-col gap-4 min-w-0">
        <ProGate userTier={tier} feature="checkin">
          <InteractiveTimeline picks={result.supplements} />
        </ProGate>
        <ProGate userTier={tier} feature="history">
          <LabUpload slug={slug} />
        </ProGate>
        <ProGate userTier={tier} feature="pdf">
          <BottleScanner picks={result.supplements} />
        </ProGate>
      </div>

      <details className="group">
        <summary className="cursor-pointer list-none mt-10 mb-3 font-mono text-[11px] uppercase tracking-wider text-lime flex items-center gap-2">
          <Salad className="w-4 h-4" aria-hidden="true" />
          <span>Daily food protocol</span>
          <span className="ml-auto text-paper/40 group-open:hidden">▼ Show</span>
          <span className="ml-auto text-paper/40 hidden group-open:inline">▲ Hide</span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 mt-3">
          <NutritionList title="Eat more" items={result.nutrition.eatMore} positive />
          <NutritionList title="Eat less" items={result.nutrition.eatLess} />
        </div>
      </details>

      <details className="group">
        <summary className="cursor-pointer list-none mt-10 mb-3 font-mono text-[11px] uppercase tracking-wider text-lime flex items-center gap-2">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>30-day execution plan</span>
          <span className="ml-auto text-paper/40 group-open:hidden">▼ Show</span>
          <span className="ml-auto text-paper/40 hidden group-open:inline">▲ Hide</span>
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 min-w-0 mt-3">
          {result.thirtyDayPlan.map((week) => (
            <article
              key={week.week}
              className="border border-paper/15 rounded-lg p-4 flex flex-col gap-2 min-w-0"
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
      </details>

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

      <div className="mt-8">
        <UpgradeButton variant="primary" />
      </div>

      <div className="mt-6">
        <EmailCapture verdict={result.verdict} slug={slug} />
      </div>

      {/* Sticky CTA — always visible while result is mounted */}
      <div
        role="complementary"
        aria-label="Upgrade prompt"
        className="fixed bottom-0 left-0 right-0 z-50 bg-ink/95 border-t border-paper/15 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-4"
      >
        <p className="text-sm font-serif text-paper leading-tight">
          Stop guessing.{" "}
          <span className="text-lime">Save your stack.</span>
        </p>
        <UpgradeButton variant="primary" interval="month" />
      </div>
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
