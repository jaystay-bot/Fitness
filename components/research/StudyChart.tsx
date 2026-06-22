import type { TimelinePoint } from "@/lib/timeline";

// Pure inline-SVG chart of the Apex 30-day onset MODEL (not a study result).
// Server-safe, no recharts. Plots the four modeled metrics across 30 days.

const SERIES: { key: keyof TimelinePoint; label: string; color: string }[] = [
  { key: "energy", label: "Energy", color: "#2563EB" },
  { key: "focus", label: "Focus", color: "#7C3AED" },
  { key: "sleep", label: "Sleep", color: "#F59E0B" },
  { key: "strength", label: "Strength", color: "#047857" },
];

const W = 300;
const H = 90;
const PAD = 6;

function path(points: TimelinePoint[], key: keyof TimelinePoint): string {
  const n = points.length;
  return points
    .map((p, i) => {
      const x = PAD + (i / (n - 1)) * (W - PAD * 2);
      const v = p[key] as number; // 0..100
      const y = H - PAD - (v / 100) * (H - PAD * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function StudyChart({ points }: { points: TimelinePoint[] }) {
  // Only plot series that actually move (a single compound usually drives 1–2).
  const active = SERIES.filter((s) =>
    points.some((p) => (p[s.key] as number) > 2),
  );
  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Apex 30-day onset model">
        {/* baseline + midline */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#0F1B2D" strokeOpacity="0.12" />
        <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke="#0F1B2D" strokeOpacity="0.06" strokeDasharray="2 4" />
        {(active.length ? active : SERIES).map((s) => (
          <path key={s.key} d={path(points, s.key)} fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {(active.length ? active : SERIES).map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-paper/55">
            <span className="h-1.5 w-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-paper/40">
          Day 1 → 30
        </span>
      </div>
    </div>
  );
}
