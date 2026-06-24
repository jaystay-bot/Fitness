import { BODY_SYSTEMS, nameToBodyKey } from "@/lib/bodySystems";
import type { BodySystem, SupplementPick } from "@/lib/types";
import { AnatomyHologram } from "./AnatomyHologram";

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

  const active = Array.from(grouped.entries()).map(([system, list]) => ({
    system,
    warning: list.some((t) => t.warning),
  }));

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
        <AnatomyHologram active={active} />
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
