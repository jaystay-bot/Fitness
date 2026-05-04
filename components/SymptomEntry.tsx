import { ASSESSMENT_FORM_ANCHOR, SPEAR_COPY } from "@/lib/spearCopy";

const ENTRIES = [
  {
    label: SPEAR_COPY.threeButtons.whatHurts,
    caption: SPEAR_COPY.buttonCaptions.whatHurts,
    path: "what-hurts" as const,
  },
  {
    label: SPEAR_COPY.threeButtons.whatDoINeed,
    caption: SPEAR_COPY.buttonCaptions.whatDoINeed,
    path: "what-do-i-need" as const,
  },
  {
    label: SPEAR_COPY.threeButtons.iKnowProduct,
    caption: SPEAR_COPY.buttonCaptions.iKnowProduct,
    path: "i-know-product" as const,
  },
] as const;

export function SymptomEntry() {
  return (
    <section
      aria-label="Symptom entry — three-button front door"
      className="px-5 sm:px-8 lg:px-12 pb-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
          Front door
        </span>
        <span className="h-px flex-1 bg-paper/15" aria-hidden="true" />
      </div>
      <ul
        role="list"
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        {ENTRIES.map((entry) => (
          <li key={entry.path} className="flex flex-col gap-2">
            <a
              href={`#${ASSESSMENT_FORM_ANCHOR}`}
              data-spear-path={entry.path}
              aria-label={`${entry.label} — ${entry.caption}`}
              className="block w-full bg-ink border border-paper/20 hover:border-lime focus:border-lime focus:outline-none rounded-md px-4 py-5 sm:py-6 text-paper font-mono uppercase tracking-wider text-sm transition-colors"
            >
              {entry.label}
            </a>
            <p className="text-[11px] font-mono uppercase tracking-wider text-paper/60">
              {entry.caption}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
