import { ArrowRight, Check, Clock, Leaf, ShieldCheck, Store } from "lucide-react";

import { ASSESSMENT_FORM_ANCHOR, SPEAR_COPY } from "@/lib/spearCopy";

const TRUST = [
  { icon: ShieldCheck, label: "Evidence-tiered" },
  { icon: Clock, label: "~60 seconds" },
  { icon: Leaf, label: "No email gate" },
];

export function SpearHero() {
  return (
    <section
      aria-label="Apex Protocol hero — evidence-backed supplement and nutrition guidance"
      className="relative overflow-hidden px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 lg:pt-28 pb-12 sm:pb-16"
    >
      {/* Slim top nav */}
      <nav className="relative max-w-6xl mx-auto w-full flex items-center justify-between gap-4 mb-10 sm:mb-14">
        <span className="font-serif text-lg sm:text-xl tracking-tight text-paper">
          Apex Protocol
        </span>
        <div className="flex items-center gap-5 font-mono text-[11px] uppercase tracking-wider">
          <a
            href={`#${ASSESSMENT_FORM_ANCHOR}`}
            className="text-paper/60 transition-colors hover:text-paper"
          >
            Build protocol
          </a>
          <a
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-lime/30 bg-lime/5 px-3 py-1.5 text-lime transition hover:border-lime"
          >
            <Store className="w-3.5 h-3.5" aria-hidden />
            Compare prices
          </a>
        </div>
      </nav>

      {/* Aurora + botanical backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-32 left-[8%] h-[34rem] w-[34rem] rounded-full bg-lime/20 blur-[130px] animate-aurora-drift" />
        <div className="absolute top-6 right-[2%] h-[26rem] w-[26rem] rounded-full bg-gold/15 blur-[120px] animate-float-slow" />
        <div className="absolute bottom-[-8rem] left-[38%] h-[22rem] w-[22rem] rounded-full bg-lime/10 blur-[120px] animate-aurora-drift" style={{ animationDelay: "-6s" }} />
        <svg
          className="absolute right-[-6rem] top-[-4rem] w-[30rem] h-[30rem] text-lime/10 animate-float-slow"
          viewBox="0 0 200 200"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          {[80, 64, 48, 32, 16].map((r) => (
            <circle key={r} cx="100" cy="100" r={r} />
          ))}
          <path d="M100 20 C140 60 140 140 100 180 C60 140 60 60 100 20 Z" />
          <path d="M20 100 C60 60 140 60 180 100 C140 140 60 140 20 100 Z" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-9 lg:gap-12 items-center">
        <div className="flex flex-col gap-6 min-w-0">
          <span className="animate-fade-up inline-flex items-center gap-2 self-start rounded-full border border-lime/30 bg-lime/5 px-3 py-1 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-lime">
            <span className="h-1.5 w-1.5 rounded-full bg-lime animate-float-slow" aria-hidden />
            {SPEAR_COPY.heroEyebrow}
          </span>

          <h1
            className="animate-fade-up font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-paper"
            style={{ animationDelay: "0.08s" }}
          >
            The basics your body needs,{" "}
            <span className="italic text-gold">settled by the science.</span>
          </h1>

          <p
            className="animate-fade-up text-base sm:text-lg text-paper/80 max-w-xl leading-relaxed"
            style={{ animationDelay: "0.16s" }}
          >
            {SPEAR_COPY.heroSubhead}
          </p>

          <div
            className="animate-fade-up flex flex-col sm:flex-row sm:items-center gap-4 pt-1"
            style={{ animationDelay: "0.24s" }}
          >
            <a
              href={`#${ASSESSMENT_FORM_ANCHOR}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-ink font-semibold tracking-wide shadow-glow transition hover:brightness-105 hover:gap-3"
            >
              Build my protocol
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </a>
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/55"
                >
                  <Icon className="w-3.5 h-3.5 text-lime/80" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside
          aria-label="What you get"
          className="animate-fade-up relative bg-surface/80 backdrop-blur-sm border border-paper/10 rounded-3xl p-6 shadow-card flex flex-col gap-4 lg:animate-float-slow"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
            {SPEAR_COPY.heroPanel.title}
          </span>
          <ul className="flex flex-col gap-3">
            {SPEAR_COPY.heroPanel.items.map((item) => (
              <li key={item} className="flex gap-3 text-sm text-paper/85 leading-snug">
                <span className="mt-0.5 shrink-0 grid place-items-center h-5 w-5 rounded-full bg-lime/15 text-lime">
                  <Check className="w-3 h-3" aria-hidden />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
