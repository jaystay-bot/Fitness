import type { Metadata } from "next";
import Link from "next/link";

import { UpgradeButton } from "@/components/UpgradeButton";

export const metadata: Metadata = {
  title: "Pricing · Apex Protocol",
  description:
    "Start free. Upgrade to Pro for $4.99/month, $9.99/quarter, or $29.99/year.",
};

const FREE_FEATURES = [
  "Full personalized recommendation",
  "Evidence tier on every pick",
  "Confidence score on every pick",
  "Goal-conflict detection",
  "Shareable result URL",
  "Email-to-self of your protocol",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Account history across visits",
  "30-day protocol check-in",
  "Clinician PDF export",
  "Priority engine update notifications",
];

const LABEL = "text-[11px] font-mono uppercase tracking-wider text-paper/60";

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2 text-sm text-paper/85 flex-1">
      {items.map((f) => (
        <li key={f} className="flex gap-2 items-start">
          <span
            className="mt-1.5 w-1 h-1 rounded-full bg-lime shrink-0"
            aria-hidden="true"
          />
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-16 flex flex-col gap-10">
        <header className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Free to start. Pro for the long arc.
          </h1>
          <p className="text-base text-paper/75 max-w-xl">
            The full recommendation is free, forever. Pro unlocks history,
            check-ins, and export — choose the plan that fits.
          </p>
        </header>

        {/* Free tier */}
        <article className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4 max-w-sm">
          <header className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl">Free</h2>
            <span className="font-mono text-sm text-paper/60">$0</span>
          </header>
          <FeatureList items={FREE_FEATURES} />
          <Link
            href="/"
            className="mt-auto inline-flex items-center justify-center border border-paper/30 text-paper font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:border-lime"
          >
            Start Free
          </Link>
        </article>

        {/* 3 paid plans */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">

          {/* Monthly */}
          <article className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4">
            <header className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl">Monthly</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl">$4.99</span>
                <span className="font-mono text-xs text-paper/60">/ month</span>
              </div>
              <p className="text-sm text-paper/60 mt-1">Start simple.</p>
            </header>
            <FeatureList items={PRO_FEATURES} />
            <UpgradeButton variant="primary" interval="month" />
          </article>

          {/* Smart Stack — primary conversion */}
          <article className="relative border-2 border-lime rounded-lg p-5 sm:p-6 flex flex-col gap-4">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-lime text-ink font-mono text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
            <header className="flex flex-col gap-1 mt-2">
              <h2 className="font-serif text-2xl">Smart Stack</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl">$9.99</span>
                <span className="font-mono text-xs text-paper/60">/ 3 months</span>
              </div>
              <p className="text-sm text-paper/60 mt-1">
                Stop guessing. Start improving.
              </p>
            </header>
            <FeatureList items={PRO_FEATURES} />
            <UpgradeButton variant="primary" interval="quarter" />
          </article>

          {/* Yearly */}
          <article className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4">
            <header className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl">Full Year Access</h2>
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-3xl">$29.99</span>
                <span className="font-mono text-xs text-paper/60">/ year</span>
              </div>
              <p className="text-sm text-paper/60 mt-1">Best value.</p>
            </header>
            <FeatureList items={PRO_FEATURES} />
            <UpgradeButton variant="primary" interval="year" />
          </article>

        </div>

        <p className={LABEL}>
          Pro features are actively in development. We do not charge until each
          feature ships for paying users.
        </p>
      </section>
    </main>
  );
}
