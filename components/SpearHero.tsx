import { Check } from "lucide-react";

import { SPEAR_COPY } from "@/lib/spearCopy";

export function SpearHero() {
  return (
    <section
      aria-label="Apex Protocol hero — evidence-backed supplement and nutrition guidance"
      className="px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-10 max-w-6xl mx-auto w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8 lg:gap-12 items-start">
        <div className="flex flex-col gap-5">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            {SPEAR_COPY.heroEyebrow}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight">
            {SPEAR_COPY.heroHeadline}
          </h1>
          <p className="text-base sm:text-lg text-paper/85 max-w-xl leading-snug">
            {SPEAR_COPY.heroSubhead}
          </p>
        </div>

        <aside
          aria-label="What you get"
          className="bg-surface border border-paper/10 rounded-2xl p-5 sm:p-6 shadow-card flex flex-col gap-3"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
            {SPEAR_COPY.heroPanel.title}
          </span>
          <ul className="flex flex-col gap-2.5">
            {SPEAR_COPY.heroPanel.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-paper/85 leading-snug">
                <Check
                  className="w-4 h-4 mt-0.5 shrink-0 text-lime"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
