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
          overflow="visible"
          className="w-full max-w-[320px] mx-auto sm:mx-0"
          role="img"
          aria-label="Anatomical silhouette with labeled supplement targets"
        >
          {/* Cleaner hand-coded silhouette: simplified proportions, smoother curves. */}
          <g
            stroke="#FAFAF7"
            strokeOpacity="0.5"
            strokeWidth="1.5"
            fill="#FAFAF7"
            fillOpacity="0.06"
          >
            {/* Head */}
            <ellipse cx="200" cy="62" rx="38" ry="44" />
            {/* Neck */}
            <path d="M 186 104 Q 200 96 214 104 L 214 128 Q 200 136 186 128 Z" />
            {/* Torso */}
            <path d="M 120 140 Q 200 116 280 140 Q 296 166 292 210 L 286 300 Q 280 360 262 410 Q 242 468 232 520 L 232 620 L 208 620 L 208 526 Q 208 478 200 430 Q 192 478 192 526 L 192 620 L 168 620 L 168 520 Q 158 468 138 410 Q 120 360 114 300 L 108 210 Q 104 166 120 140 Z" />
            {/* Arms (kept subtle to avoid visual noise on mobile) */}
            <path d="M 124 154 Q 92 220 92 288 Q 92 332 108 368 Q 118 390 130 386 Q 120 344 122 288 Q 124 224 142 176 Z" />
            <path d="M 276 154 Q 308 220 308 288 Q 308 332 292 368 Q 282 390 270 386 Q 280 344 278 288 Q 276 224 258 176 Z" />
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
          {/* Pins and short labels per body system.
              Avoid long supplement-name text inside the SVG to prevent overlaps. */}
          {Array.from(grouped.entries()).map(([system, list]) => {
            const pos = SVG_POSITIONS[system];
            const hasWarning = list.some((t) => t.warning);
            return (
              <g key={system}>
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="4"
                  fill={hasWarning ? "#FF6B35" : "#D4FF3A"}
                />
                <text
                  x={pos.cx + 10}
                  y={pos.cy + 4}
                  fontFamily="ui-monospace, monospace"
                  fontSize="10.5"
                  fill={hasWarning ? "#FF6B35" : "#FAFAF7"}
                  opacity="0.9"
                  aria-label={`${system} targeted by ${list.length} supplements`}
                >
                  {system}{list.length > 1 ? ` (${list.length})` : ""}
                </text>
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
