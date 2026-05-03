import { AlertTriangle } from "lucide-react";

import type { ConflictFlag } from "@/lib/types";

export function ConflictBanner({ flag }: { flag: ConflictFlag }) {
  const label = flag.severity === "block" ? "Stop here" : "Heads up";
  return (
    <aside
      role="alert"
      aria-label={`Goal conflict — ${flag.severity}`}
      className="mb-6 border border-clinical/60 bg-clinical/10 rounded-lg p-4 sm:p-5 flex gap-3 sm:gap-4 font-sans"
    >
      <AlertTriangle
        className="w-5 h-5 sm:w-6 sm:h-6 text-clinical shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-clinical">
          {label} · {flag.severity}
        </span>
        <p className="text-sm sm:text-base text-clinical font-medium leading-snug">
          {flag.message}
        </p>
        <p className="text-sm text-paper/70 leading-snug">
          {flag.suggestedFix}
        </p>
      </div>
    </aside>
  );
}
