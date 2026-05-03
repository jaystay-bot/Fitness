export function Footer() {
  return (
    <footer className="border-t border-paper/10 bg-ink">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-10 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <span className="font-serif text-xl tracking-tight">Apex Protocol</span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50">
            Educational use only · Not medical advice
          </span>
        </div>
        <p className="text-sm text-paper/60 max-w-3xl leading-relaxed">
          Apex Protocol provides educational information based on published
          human research. It is not medical advice. Consult a clinician before
          starting any supplement, especially if pregnant, nursing, on
          medication, or managing a medical condition.
        </p>
        <p className="font-mono text-[11px] uppercase tracking-wider text-paper/40">
          Sources: PubMed-indexed human RCTs and systematic reviews.
          Tier and study count are bucketed estimates, not exact claims.
        </p>
      </div>
    </footer>
  );
}
