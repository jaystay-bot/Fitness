import { BODY_SYSTEMS, nameToBodyKey } from "@/lib/bodySystems";
import {
  SVG_POSITIONS,
  VIEWBOX_HEIGHT,
  VIEWBOX_WIDTH,
} from "@/lib/svgPositions";
import type { BodySystem, SupplementPick } from "@/lib/types";

interface Tag {
  system: BodySystem;
  name: string;
  dose: string;
  note: string;
  warning: boolean;
}

function buildTags(
  picks: SupplementPick[],
  warnings: string[],
): Tag[] {
  const out: Tag[] = [];
  const lowerWarnings = warnings.map((w) => w.toLowerCase());
  for (const pick of picks) {
    const key = nameToBodyKey(pick.name);
    if (!key) continue;
    const mapping = BODY_SYSTEMS[key];
    if (!mapping) continue;
    const firstWord = pick.name.toLowerCase().split(/[\s(]/)[0];
    const flagged = lowerWarnings.some((w) => w.includes(firstWord));
    for (const system of mapping.systems) {
      out.push({
        system,
        name: pick.name,
        dose: pick.dose,
        note: mapping.notes[system] ?? "",
        warning: flagged,
      });
    }
  }
  return out;
}

export function BodyVisualization({
  picks,
  warnings,
}: {
  picks: SupplementPick[];
  warnings: string[];
}) {
  const tags = buildTags(picks, warnings);
  if (tags.length === 0) return null;

  // Group tags by system so we can stack labels when multiple supplements
  // target the same region.
  const grouped = new Map<BodySystem, Tag[]>();
  for (const t of tags) {
    if (!grouped.has(t.system)) grouped.set(t.system, []);
    grouped.get(t.system)!.push(t);
  }

  return (
    <section
      aria-label="Body systems visualization"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
          Where your stack lands in your body
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Body systems
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] gap-5 items-start">
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="w-full max-w-[280px] mx-auto"
          role="img"
          aria-label="Anatomical silhouette with labeled supplement targets"
        >
          {/* Hand-coded silhouette: head, neck, torso, arms, legs. */}
          <g
            stroke="#FAFAF7"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            fill="#FAFAF7"
            fillOpacity="0.06"
          >
            {/* Head */}
            <ellipse cx="200" cy="60" rx="40" ry="46" />
            {/* Neck */}
            <rect x="190" y="100" width="20" height="20" />
            {/* Shoulders + torso */}
            <path d="M 110 130 Q 200 110 290 130 L 295 220 Q 295 320 280 380 L 230 480 L 230 600 L 195 600 L 195 480 L 200 380 Q 200 320 200 220 L 200 380 L 170 480 L 170 600 L 205 600 L 205 480 L 120 380 Q 105 320 105 220 Z" />
            {/* Arms */}
            <path d="M 110 130 L 70 220 L 65 350 L 80 360 L 95 250 L 110 200 Z" />
            <path d="M 290 130 L 330 220 L 335 350 L 320 360 L 305 250 L 290 200 Z" />
          </g>
          {/* Subtle line dividers between major regions. */}
          <g
            stroke="#FAFAF7"
            strokeOpacity="0.15"
            strokeDasharray="3 4"
            fill="none"
          >
            <line x1="40" y1="120" x2="360" y2="120" />
            <line x1="40" y1="280" x2="360" y2="280" />
            <line x1="40" y1="380" x2="360" y2="380" />
          </g>
          {/* Tag connectors and labels per body system. */}
          {Array.from(grouped.entries()).map(([system, list]) => {
            const pos = SVG_POSITIONS[system];
            return (
              <g key={system}>
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="4"
                  fill={
                    list.some((t) => t.warning) ? "#FF6B35" : "#D4FF3A"
                  }
                />
                {list.map((t, i) => (
                  <text
                    key={`${system}-${t.name}-${i}`}
                    x={pos.cx + 12}
                    y={pos.cy + i * 14 - (list.length - 1) * 7}
                    fontFamily="ui-monospace, monospace"
                    fontSize="11"
                    fill={t.warning ? "#FF6B35" : "#FAFAF7"}
                    aria-label={`${t.name} targets ${system}`}
                  >
                    {t.name}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
        <ul className="flex flex-col gap-2 text-sm text-paper/85">
          {Array.from(grouped.entries()).map(([system, list]) => (
            <li key={system} className="border border-paper/15 rounded-md p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block w-2 h-2 rounded-full ${list.some((t) => t.warning) ? "bg-clinical" : "bg-lime"}`}
                  aria-hidden="true"
                />
                <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
                  {system}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {list.map((t, i) => (
                  <li key={`${t.name}-${i}`} className="text-sm">
                    <span className="text-paper/90">{t.name}</span>
                    <span className="text-paper/50"> · {t.dose}</span>
                    {t.note ? (
                      <p className="text-xs text-paper/70 mt-0.5 leading-snug">
                        {t.note}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
