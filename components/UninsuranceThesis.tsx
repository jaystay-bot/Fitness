import { SPEAR_COPY } from "@/lib/spearCopy";

export function UninsuranceThesis() {
  return (
    <section
      aria-label="Un-insurance thesis"
      className="px-5 sm:px-8 lg:px-12 py-10 max-w-6xl mx-auto w-full"
    >
      <ol
        role="list"
        className="flex flex-col gap-2 mb-5"
      >
        {SPEAR_COPY.thesisBullets.map((line, i) => (
          <li
            key={line}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-paper"
          >
            <span className="font-mono text-base align-super text-lime mr-2">
              0{i + 1}
            </span>
            <span className="italic">{line}</span>
          </li>
        ))}
      </ol>
      <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-paper/70">
        {SPEAR_COPY.closer}
      </p>
    </section>
  );
}
