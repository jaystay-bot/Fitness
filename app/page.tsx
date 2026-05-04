import type { Metadata } from "next";

import { Differentiators } from "@/components/Differentiators";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

export const metadata: Metadata = {
  openGraph: {
    title: "Apex Protocol — your supplement stack, written by the science",
    description:
      "Evidence-tier-aware supplement and nutrition recommendations. No email gate.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Protocol",
    description:
      "Evidence-tier-aware supplement and nutrition recommendations.",
    images: ["/api/og"],
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-ink text-paper pb-safe overflow-x-clip">
      <Hero />
      <HowItWorks />
      <Differentiators />
      <Footer />
    </main>
  );
}
