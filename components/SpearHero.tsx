import { SPEAR_COPY } from "@/lib/spearCopy";

const VAULT_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function SpearHero() {
  return (
    <section
      aria-label="Project Spear hero — un-insurance positioning"
      className="px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-10 max-w-6xl mx-auto w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 lg:gap-12 items-start">
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
          aria-label="Vault math preview"
          className="flex flex-col gap-3 lg:items-end lg:text-right"
        >
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
              You keep
            </span>
            <span className="font-mono text-4xl sm:text-5xl lg:text-6xl text-lime leading-none">
              {VAULT_FORMATTER.format(SPEAR_COPY.vaultMath.yearOneKept)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/60">
              kept by you, not the insurer
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
              Traditional insurance
            </span>
            <span className="font-mono text-3xl text-clinical line-through leading-none">
              {VAULT_FORMATTER.format(SPEAR_COPY.vaultMath.traditionalKept)}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50">
              kept under traditional insurance
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}
