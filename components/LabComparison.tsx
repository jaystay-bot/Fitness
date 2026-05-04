import type { LabValues, Recommendation } from "@/lib/types";

interface Deltas {
  addedSupplements: string[];
  removedSupplements: string[];
  confidenceDeltas: { name: string; before: number; after: number }[];
}

const LABEL: Partial<Record<keyof LabValues, string>> = {
  ferritin_ng_ml: "Ferritin (ng/ml)",
  vitamin_d_25oh_ng_ml: "Vitamin D 25-OH (ng/ml)",
  b12_pg_ml: "B12 (pg/ml)",
  magnesium_mg_dl: "Magnesium (mg/dl)",
  total_cholesterol_mg_dl: "Total cholesterol (mg/dl)",
  hdl_mg_dl: "HDL (mg/dl)",
  ldl_mg_dl: "LDL (mg/dl)",
  triglycerides_mg_dl: "Triglycerides (mg/dl)",
  glucose_fasting_mg_dl: "Fasting glucose (mg/dl)",
  hba1c_pct: "HbA1c (%)",
};

export function LabComparison({
  values,
  original,
  adjusted,
  overrides,
  deltas,
}: {
  values: LabValues;
  original: Recommendation;
  adjusted: Recommendation;
  overrides: string[];
  deltas: Deltas;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Extracted lab values
        </span>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          {(Object.keys(values) as (keyof LabValues)[]).map((k) => (
            <div key={k} className="contents">
              <dt className="font-mono text-[11px] uppercase tracking-wider text-paper/60 self-center">
                {LABEL[k] ?? k}
              </dt>
              <dd className="text-paper/90 self-center font-mono">{values[k]}</dd>
            </div>
          ))}
        </dl>
      </div>

      {overrides.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
            Engine overrides triggered
          </span>
          <ul className="flex flex-col gap-1.5 text-sm text-paper/85">
            {overrides.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span
                  className="text-clinical mt-1.5 w-1 h-1 rounded-full bg-clinical shrink-0"
                  aria-hidden="true"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-paper/15 rounded-md p-4">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-paper/60 mb-2">
            Original recommendation
          </h4>
          <ul className="flex flex-col gap-1 text-sm text-paper/85">
            {original.supplements.map((s) => (
              <li key={s.name} className="flex justify-between gap-2">
                <span>{s.name}</span>
                <span className="font-mono text-paper/60">{s.confidence}%</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border border-lime/40 rounded-md p-4">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-lime mb-2">
            Lab-adjusted recommendation
          </h4>
          <ul className="flex flex-col gap-1 text-sm text-paper/85">
            {adjusted.supplements.map((s) => (
              <li key={s.name} className="flex justify-between gap-2">
                <span>{s.name}</span>
                <span className="font-mono text-paper/60">{s.confidence}%</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {(deltas.addedSupplements.length > 0 ||
        deltas.removedSupplements.length > 0 ||
        deltas.confidenceDeltas.length > 0) ? (
        <div className="flex flex-col gap-1.5 text-sm text-paper/80">
          {deltas.addedSupplements.length > 0 ? (
            <p>
              <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
                Added:&nbsp;
              </span>
              {deltas.addedSupplements.join(", ")}
            </p>
          ) : null}
          {deltas.removedSupplements.length > 0 ? (
            <p>
              <span className="font-mono text-[11px] uppercase tracking-wider text-clinical">
                Removed:&nbsp;
              </span>
              {deltas.removedSupplements.join(", ")}
            </p>
          ) : null}
          {deltas.confidenceDeltas.length > 0 ? (
            <p>
              <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
                Confidence shifts:&nbsp;
              </span>
              {deltas.confidenceDeltas
                .map((d) => `${d.name} ${d.before}→${d.after}`)
                .join(", ")}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
