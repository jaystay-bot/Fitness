import type { Metadata } from "next";
import { Activity } from "lucide-react";

import { ResearchFeed } from "@/components/research/ResearchFeed";
import { StatStrip } from "@/components/research/StatStrip";
import { STANDARD_DISCLAIMER } from "@/lib/commerce/compliance";

export const metadata: Metadata = {
  title: "The Wire — read the science | Apex Protocol",
  description:
    "A read-only feed of the evidence behind common supplements: evidence tier, study volume, and a one-click link to the primary source on PubMed. No posting, no hype.",
};

export default function ResearchPage() {
  return (
    <main className="min-h-screen bg-ink text-paper overflow-x-clip">
      <section className="px-5 sm:px-8 lg:px-12 pt-16 sm:pt-20 pb-10 max-w-6xl mx-auto w-full">
        <span className="animate-fade-up inline-flex items-center gap-2 self-start rounded-full border border-lime/30 bg-lime/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-lime">
          <Activity className="w-3.5 h-3.5" aria-hidden />
          The Wire · read-only
        </span>
        <h1 className="animate-fade-up mt-5 font-serif text-4xl sm:text-6xl leading-[1.04] tracking-tight" style={{ animationDelay: "0.08s" }}>
          Read the <span className="italic text-gold">science.</span>
        </h1>
        <p className="animate-fade-up mt-4 max-w-2xl text-base sm:text-lg text-paper/80 leading-relaxed" style={{ animationDelay: "0.16s" }}>
          A feed you read, not one you post to. Every compound with its evidence
          tier, how heavily it&apos;s studied, and a one-tap link to the primary
          source on PubMed. No likes, no hype — just the data, with the citation
          one click away.
        </p>
      </section>

      <section className="px-5 sm:px-8 lg:px-12 pb-10 max-w-6xl mx-auto w-full">
        <StatStrip />
      </section>

      <section className="px-5 sm:px-8 lg:px-12 pb-16 max-w-6xl mx-auto w-full">
        <ResearchFeed />
        <p className="mt-10 text-[11px] text-paper/45 leading-snug max-w-3xl">
          Study counts are bucketed estimates, not exact figures, and these are
          plain-language summaries that link to primary sources — not original
          research. {STANDARD_DISCLAIMER}
        </p>
      </section>
    </main>
  );
}
