import { BarChart3, ExternalLink, FileText, Star } from "lucide-react";

import type { ResearchItem } from "@/lib/research/feed";
import { modelForCompound, STUDY_BREAKDOWNS } from "@/lib/research/studies";
import { StudyChart } from "./StudyChart";
import { TierMeter, VolumeBar } from "./Sparkline";

const TIER_STYLE: Record<ResearchItem["tier"], string> = {
  Strong: "bg-lime/12 text-lime",
  Moderate: "bg-gold/12 text-gold",
  Emerging: "border border-paper/20 text-paper/60",
};

export function ResearchCard({
  item,
  max,
  inStack = false,
}: {
  item: ResearchItem;
  max: number;
  inStack?: boolean;
}) {
  return (
    <article className={`flex flex-col gap-3 rounded-2xl border bg-surface p-5 shadow-card transition-colors ${inStack ? "border-lime/40" : "border-paper/10 hover:border-lime/30"}`}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            {inStack ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-lime/15 text-lime px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider">
                <Star className="w-2.5 h-2.5" aria-hidden /> In your stack
              </span>
            ) : null}
            {item.goals.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-paper/12 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-paper/55"
              >
                {g.replace("-", " ")}
              </span>
            ))}
          </div>
          <h3 className="font-serif text-2xl leading-tight tracking-tight text-paper break-words">
            {item.name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider ${TIER_STYLE[item.tier]}`}
        >
          {item.tier}
        </span>
      </header>

      <p className="text-[0.9375rem] text-paper/80 leading-relaxed">{item.finding}</p>

      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2.5">
        <dt className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
          Evidence
        </dt>
        <dd>
          <TierMeter tier={item.tier} />
        </dd>
        <dt className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
          Studies
        </dt>
        <dd>
          <VolumeBar value={item.studyCount} max={max} />
        </dd>
      </dl>

      {STUDY_BREAKDOWNS[item.id] ? (
        <details className="group rounded-xl border border-paper/10 bg-ink/40">
          <summary className="cursor-pointer list-none flex items-center gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-paper/70 hover:text-paper">
            <BarChart3 className="w-3.5 h-3.5" aria-hidden />
            See the data
            <span className="ml-auto text-paper/40 group-open:hidden">Show ▾</span>
            <span className="ml-auto text-paper/40 hidden group-open:inline">Hide ▴</span>
          </summary>
          <div className="px-3 pb-3 pt-1 flex flex-col gap-3">
            <StudyChart points={modelForCompound(item.name, item.tier)} />
            <span className="font-mono text-[9px] uppercase tracking-wider text-paper/40 -mt-1">
              Apex model · illustrative, not a study result
            </span>
            <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-1.5 text-xs">
              {([
                ["Design", STUDY_BREAKDOWNS[item.id].design],
                ["Who", STUDY_BREAKDOWNS[item.id].population],
                ["Measured", STUDY_BREAKDOWNS[item.id].outcome],
                ["Finding", STUDY_BREAKDOWNS[item.id].magnitude],
              ] as const).map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="font-mono text-[10px] uppercase tracking-wider text-paper/45">{k}</dt>
                  <dd className="text-paper/80 leading-snug">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-paper/70 leading-snug italic">
              {STUDY_BREAKDOWNS[item.id].takeaway}
            </p>
          </div>
        </details>
      ) : null}

      <a
        href={item.pubmedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 self-start rounded-full border border-paper/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-paper/85 transition hover:border-lime hover:text-lime"
      >
        <FileText className="w-3 h-3" aria-hidden />
        {item.pmid ? `PubMed · PMID ${item.pmid}` : "Search PubMed"}
        <ExternalLink className="w-3 h-3" aria-hidden />
      </a>
    </article>
  );
}
