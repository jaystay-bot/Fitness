import type { Metadata } from "next";

import { Differentiators } from "@/components/Differentiators";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SpearHero } from "@/components/SpearHero";
import { SymptomEntry } from "@/components/SymptomEntry";
import { UninsuranceThesis } from "@/components/UninsuranceThesis";
import { VaultDashboard } from "@/components/VaultDashboard";
import { ASSESSMENT_FORM_ANCHOR } from "@/lib/spearCopy";

export const metadata: Metadata = {
  openGraph: {
    title: "Apex Protocol — your supplement stack, written by the science",
    description:
      "Answer a few quick questions and get an evidence-tiered supplement and nutrition plan: protein and water targets, the picks worth taking, and what to skip.",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Protocol — your supplement stack, written by the science",
    description:
      "Evidence-tiered supplement and nutrition guidance from the least information possible. No email gate.",
    images: ["/api/og"],
  },
};

export default function Page() {
  return (
    <main className="min-h-screen bg-ink text-paper scroll-smooth pb-safe overflow-x-clip">
      <SpearHero />
      <SymptomEntry />
      <VaultDashboard />
      <UninsuranceThesis />
      <section
        id={ASSESSMENT_FORM_ANCHOR}
        aria-label="Build your protocol"
        className="scroll-mt-8"
      >
        <Hero />
      </section>
      <HowItWorks />
      <Differentiators />
      <Footer />
    </main>
  );
}
