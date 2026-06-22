import { SPEAR_COPY } from "@/lib/spearCopy";

export function VaultDashboard() {
  return (
    <section
      aria-label="What your protocol covers"
      className="px-5 sm:px-8 lg:px-12 pb-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
        <h2 className="font-serif text-2xl sm:text-3xl tracking-tight">
          {SPEAR_COPY.preview.heading}
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
          {SPEAR_COPY.preview.tag}
        </span>
      </div>

      <ul role="list" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SPEAR_COPY.preview.cards.map((card) => (
          <li
            key={card.label}
            className="bg-surface border border-paper/10 rounded-xl p-4 sm:p-5 flex flex-col gap-1.5 shadow-card"
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
              {card.label}
            </span>
            <span className="font-serif text-paper text-xl sm:text-2xl leading-tight">
              {card.value}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50">
              {card.caption}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
