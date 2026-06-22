import { getFeedStats, MAX_STUDY_COUNT, RESEARCH_ITEMS } from "@/lib/research/feed";

const STATS = getFeedStats();

const TOP = [...RESEARCH_ITEMS]
  .sort((a, b) => b.studyCount - a.studyCount)
  .slice(0, 8);

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-paper/10 bg-surface p-4 shadow-card flex flex-col gap-1">
      <span className="font-serif text-3xl leading-none text-paper">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
        {label}
      </span>
    </div>
  );
}

export function StatStrip() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile value={String(STATS.compounds)} label="Compounds tracked" />
        <Tile value={`~${STATS.totalStudies.toLocaleString()}`} label="Studies indexed (est.)" />
        <Tile value={String(STATS.strong)} label="Strong-tier" />
        <Tile value="PubMed" label="Primary source" />
      </div>

      {/* Real study-volume chart — bucketed estimates, labeled as such. */}
      <div className="rounded-2xl border border-paper/10 bg-surface p-5 shadow-card">
        <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-serif text-lg text-paper">Research density by compound</h2>
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/45">
            approx. PubMed-indexed studies
          </span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {TOP.map((item) => (
            <li key={item.id} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3">
              <span className="font-mono text-[11px] text-paper/70 truncate">{item.name}</span>
              <span className="h-2 rounded-full bg-paper/10 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-lime"
                  style={{ width: `${Math.max(4, (item.studyCount / MAX_STUDY_COUNT) * 100).toFixed(1)}%` }}
                />
              </span>
              <span className="font-mono text-[10px] text-paper/55 tabular-nums w-12 text-right">
                ~{item.studyCount}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
