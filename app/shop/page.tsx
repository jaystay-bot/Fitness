import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { AttributionFooter } from "@/components/commerce/AttributionFooter";
import { ProductCard } from "@/components/commerce/ProductCard";
import { STANDARD_DISCLAIMER } from "@/lib/commerce/compliance";
import { getResolvedProducts } from "@/lib/commerce/products";

export const metadata: Metadata = {
  title: "The Shelf — where to buy your protocol | Apex Protocol",
  description:
    "Compare trusted retailers for common vitamins and supplements. We don't sell these — we route you to the best place to buy. No fabricated prices.",
};

export default function ShopPage() {
  const products = getResolvedProducts();

  return (
    <main className="min-h-screen bg-ink text-paper overflow-x-clip">
      <section className="px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-12 max-w-6xl mx-auto w-full">
        <span className="animate-fade-up inline-flex items-center gap-2 self-start rounded-full border border-lime/30 bg-lime/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden />
          Compare · not a store
        </span>
        <h1 className="animate-fade-up mt-5 font-serif text-4xl sm:text-6xl leading-[1.04] tracking-tight" style={{ animationDelay: "0.08s" }}>
          The shelf, <span className="italic text-gold">priced honestly.</span>
        </h1>
        <p className="animate-fade-up mt-4 max-w-xl text-base sm:text-lg text-paper/80 leading-relaxed" style={{ animationDelay: "0.16s" }}>
          The vitamins your protocol leans on, with outbound links to trusted
          retailers so you can find the best place to buy. We do not sell these.
          When a live price isn&apos;t verified, you&apos;ll see &ldquo;Check price&rdquo; —
          never a made-up number.
        </p>
      </section>

      <section className="px-5 sm:px-8 lg:px-12 pb-16 max-w-6xl mx-auto w-full">
        {products.length === 0 ? (
          <p className="rounded-2xl border border-paper/10 bg-surface p-8 text-center text-paper/60">
            No products available yet. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {products.map((resolved) => (
              <ProductCard key={resolved.product.id} resolved={resolved} />
            ))}
          </div>
        )}

        <AttributionFooter />

        <p className="mt-8 text-[11px] text-paper/40 leading-snug max-w-3xl">
          {STANDARD_DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
