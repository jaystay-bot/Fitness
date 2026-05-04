import type { TimelinePoint } from "@/lib/timeline";

export interface TimelineDayDetailProps {
  point: TimelinePoint | null;
  perPick: { name: string; point: TimelinePoint }[];
}

export function TimelineDayDetail({ point, perPick }: TimelineDayDetailProps) {
  if (!point) return null;
  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={`Day ${point.day} detail`}
      className="border border-paper/15 rounded-md p-3 sm:p-4 flex flex-col gap-2"
    >
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Day {point.day}
        </span>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-mono uppercase tracking-wider text-paper/60">
          <span>Energy {point.energy}</span>
          <span>Focus {point.focus}</span>
          <span>Sleep {point.sleep}</span>
          <span>Strength {point.strength}</span>
        </div>
      </div>
      <p className="text-sm text-paper/80 leading-snug">{point.note}</p>
      {perPick.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
          {perPick.map((entry) => (
            <li key={entry.name} className="flex justify-between gap-2">
              <span className="text-paper/85">{entry.name}</span>
              <span className="font-mono text-paper/60">
                e{entry.point.energy} f{entry.point.focus} s{entry.point.sleep} st{entry.point.strength}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </aside>
  );
}
