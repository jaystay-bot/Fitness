import { AlertTriangle, Check, HelpCircle } from "lucide-react";

import type { ScanMatch } from "@/lib/types";

const TONE: Record<ScanMatch, { color: string; icon: typeof Check; label: string }> = {
  match: { color: "text-lime", icon: Check, label: "Match" },
  mismatch: { color: "text-clinical", icon: AlertTriangle, label: "Mismatch" },
  unknown: { color: "text-paper/50", icon: HelpCircle, label: "Unknown" },
};

export function ScanResult({
  match,
  identified,
  doseMg,
  comparedTo,
  message,
}: {
  match: ScanMatch;
  identified: string | null;
  doseMg: number | null;
  comparedTo: string | null;
  message: string;
}) {
  const tone = TONE[match];
  const Icon = tone.icon;
  return (
    <aside
      role="status"
      aria-live="polite"
      className="border border-paper/15 rounded-md p-4 flex gap-3"
    >
      <Icon className={`w-5 h-5 ${tone.color} shrink-0 mt-0.5`} aria-hidden="true" />
      <div className="flex flex-col gap-1.5">
        <span className={`font-mono text-[11px] uppercase tracking-wider ${tone.color}`}>
          {tone.label}
        </span>
        <p className="text-sm text-paper/90 leading-snug">{message}</p>
        {identified ? (
          <dl className="text-xs font-mono uppercase tracking-wider text-paper/60 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 mt-1">
            <dt>Identified</dt>
            <dd className="text-paper/90 normal-case tracking-normal font-sans">{identified}</dd>
            {doseMg !== null ? (
              <>
                <dt>Dose</dt>
                <dd className="text-paper/90 normal-case tracking-normal font-sans">{doseMg} mg</dd>
              </>
            ) : null}
            {comparedTo ? (
              <>
                <dt>Protocol pick</dt>
                <dd className="text-paper/90 normal-case tracking-normal font-sans">{comparedTo}</dd>
              </>
            ) : null}
          </dl>
        ) : null}
      </div>
    </aside>
  );
}
