import type { ResearchItem } from "@/lib/research/feed";

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

export function StatStrip({
  items,
  live,
  fetchedAt,
}: {
  items: ResearchItem[];
  live: boolean;
  fetchedAt: string | null;
}) {
  const total = items.reduce((a, r) => a + r.studyCount, 0);
  const strong = items.filter((r) => r.tier === "Strong").length;
  const max = Math.max(1, ...items.map((r) => r.studyCount));
  const top = [...items].sort((a, b) => b.studyCount - a.studyCount).slice(0, 8);
  const updated = fetchedAt
    ? new Date(fetchedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile value={String(items.length)} label="Compounds tracked" />
        <Tile value={`~${total.toLocaleString()}`} label={live ? "Studies (live)" : "Studies (est.)"} />
        <Tile value={String(strong)} label="Strong-tier" />
        <Tile value="PubMed" label="Primary source" />
      </div>

      <div className="rounded-2xl border border-paper/10 bg-surface p-5 shadow-card">
        <div className="flex items-baseline justify-between gap-3 mb-4 flex-wrap">
          <h2 className="font-serif text-lg text-paper">Research density by compound</h2>
          <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider ${live ? "text-lime" : "text-paper/45"}`}>
            {live ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-lime animate-float-slow" aria-hidden />
                Live · PubMed{updated ? ` · ${updated}` : ""}
              </>
            ) : (
              "approx. PubMed-indexed studies"
            )}
          </span>
        </div>
        <ul className="flex flex-col gap-3">
          {top.map((item) => (
            <li key={item.id} className="grid grid-cols-[9rem_1fr_auto] items-center gap-3">
              <span className="font-mono text-[11px] text-paper/70 truncate">{item.name}</span>
              <span className="h-2.5 rounded-full bg-paper/10 overflow-hidden">
                <span
                  className="block h-full rounded-full bg-lime"
                  style={{ width: `${Math.max(4, (item.studyCount / max) * 100).toFixed(1)}%` }}
                />
              </span>
              <span className="font-mono text-[10px] text-paper/55 tabular-nums w-14 text-right">
                {live ? "" : "~"}{item.studyCount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
