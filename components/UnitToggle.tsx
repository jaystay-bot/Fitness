"use client";

import type { UnitSystem } from "@/lib/units";

const ACTIVE = "bg-lime text-ink";
const INACTIVE = "bg-transparent text-paper/60 border border-paper/20";
const BASE =
  "px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider rounded-md transition-colors";

export function UnitToggle({
  system,
  onChange,
}: {
  system: UnitSystem;
  onChange: (next: UnitSystem) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Unit system"
      className="inline-flex gap-1.5 font-mono"
    >
      <button
        type="button"
        aria-label="Use imperial units (feet, inches, pounds)"
        aria-pressed={system === "imperial"}
        onClick={() => onChange("imperial")}
        className={`${BASE} ${system === "imperial" ? ACTIVE : INACTIVE}`}
      >
        FT / LB
      </button>
      <button
        type="button"
        aria-label="Use metric units (centimeters, kilograms)"
        aria-pressed={system === "metric"}
        onClick={() => onChange("metric")}
        className={`${BASE} ${system === "metric" ? ACTIVE : INACTIVE}`}
      >
        CM / KG
      </button>
    </div>
  );
}
