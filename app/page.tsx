import { Differentiators } from "@/components/Differentiators";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";

export default function Page() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <Hero />
      <HowItWorks />
      <Differentiators />
      <Footer />
    </main>
  );
}
