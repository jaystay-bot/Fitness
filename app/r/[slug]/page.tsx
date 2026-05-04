import type { Metadata } from "next";
import Link from "next/link";

import { ResultCard } from "@/components/ResultCard";
import { recommend } from "@/lib/engine";
import { decodeSlug } from "@/lib/slug";

interface RouteParams {
  params: { slug: string };
}

export const dynamic = "force-dynamic";

function buildOgUrl(verdict: string, names: string[]): string {
  const v = Buffer.from(verdict, "utf-8").toString("base64url");
  const s = names
    .slice(0, 3)
    .map((n) => encodeURIComponent(n))
    .join(",");
  return `/api/og?v=${v}&s=${s}`;
}

export async function generateMetadata({
  params,
}: RouteParams): Promise<Metadata> {
  const decoded = decodeSlug(params.slug);
  if (!decoded) {
    return {
      title: "Result not found · Apex Protocol",
    };
  }
  const result = recommend(decoded);
  const og = buildOgUrl(
    result.verdict,
    result.supplements.map((s) => s.name),
  );
  return {
    title: "Your Apex Protocol",
    description: result.verdict,
    openGraph: {
      title: "Apex Protocol — your supplement stack, written by the science",
      description: result.verdict,
      images: [{ url: og, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Apex Protocol",
      description: result.verdict,
      images: [og],
    },
  };
}

export default function SharedResultPage({ params }: RouteParams) {
  const decoded = decodeSlug(params.slug);
  if (!decoded) {
    return (
      <main className="min-h-screen bg-ink text-paper">
        <section className="max-w-2xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-12 flex flex-col gap-5">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-clinical">
            Result not found
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-tight leading-[1.05]">
            That link does not decode to a valid protocol.
          </h1>
          <p className="text-base text-paper/75">
            Slugs are generated from your inputs. Build a fresh recommendation
            and we will give you a new shareable link.
          </p>
          <Link
            href="/"
            className="self-start inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95"
          >
            Build a protocol
          </Link>
        </section>
      </main>
    );
  }

  const result = recommend(decoded);

  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-3xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 pb-12">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Shared protocol
          </span>
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-wider text-paper/60 hover:text-lime"
          >
            Build your own →
          </Link>
        </div>
        <ResultCard result={result} input={decoded} shareSlug={params.slug} />
      </section>
    </main>
  );
}
