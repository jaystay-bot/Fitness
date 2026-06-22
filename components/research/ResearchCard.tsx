import { ExternalLink, FileText, Star } from "lucide-react";

import type { ResearchItem } from "@/lib/research/feed";
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
          <h3 className="font-serif text-xl leading-tight text-paper break-words">
            {item.name}
          </h3>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${TIER_STYLE[item.tier]}`}
        >
          {item.tier}
        </span>
      </header>

      <p className="text-sm text-paper/80 leading-snug">{item.finding}</p>

      <dl className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2">
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
