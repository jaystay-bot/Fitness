import { FileText } from "lucide-react";

import { LEDGER_SAMPLES } from "@/lib/ledgerSamples";
import type { EvidenceTier as EvidenceTierType } from "@/lib/types";

const TIER_BADGE: Record<EvidenceTierType, string> = {
  Strong: "bg-lime text-ink",
  Moderate: "border border-paper text-paper",
  Emerging: "border border-paper/40 text-paper/60",
};

export function EvidenceLedger() {
  return (
    <section
      aria-label="Evidence ledger preview"
      className="mb-5 sm:mb-7"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/50">
          Evidence ledger · sample
        </span>
        <span className="h-px flex-1 bg-paper/15" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {LEDGER_SAMPLES.map((s) => (
          <article
            key={s.name}
            className="border border-paper/15 rounded-lg p-3 flex flex-col gap-2"
          >
            <header className="flex items-start justify-between gap-2">
              <span className="font-mono text-xs sm:text-sm text-paper">
                {s.name}
              </span>
              <span
                className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm shrink-0 ${TIER_BADGE[s.tier]}`}
              >
                {s.tier}
              </span>
            </header>
            <p className="text-xs text-paper/70 leading-snug">{s.claim}</p>
            <footer className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-paper/50">
              <FileText className="w-3 h-3" aria-hidden="true" />
              <span>~{s.studies} RCTs</span>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
