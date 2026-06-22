import type { ResolvedProduct } from "@/lib/commerce/types";
import { BottleVisual } from "./BottleVisual";
import { BuyBox } from "./BuyBox";

export function ProductCard({ resolved }: { resolved: ResolvedProduct }) {
  const { product } = resolved;
  const brand = product.brand ?? "Multiple brands";

  return (
    <article
      id={`product-${product.slug}`}
      className="scroll-mt-24 flex flex-col gap-4 rounded-2xl border border-paper/10 bg-surface p-5 shadow-card transition-colors hover:border-lime/25 target:border-lime/60"
    >
      <div className="flex gap-4">
        <BottleVisual
          product={product}
          image={resolved.image}
          className="h-28 w-20 shrink-0 rounded-xl bg-elevate/60"
        />
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
            {brand}
          </span>
          <h3 className="font-serif text-xl leading-tight text-paper">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {[product.form, product.strengthLabel, product.countLabel].map(
              (chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-paper/12 bg-ink/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-paper/60"
                >
                  {chip}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-paper/80 leading-snug">
        {product.descriptionShort}
      </p>
      <p className="text-xs text-paper/55 leading-snug">
        {product.evidenceNotes}
      </p>

      <BuyBox resolved={resolved} />
    </article>
  );
}
