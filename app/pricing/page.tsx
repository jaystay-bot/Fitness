import type { Metadata } from "next";
import Link from "next/link";

import { UpgradeButton } from "@/components/UpgradeButton";

export const metadata: Metadata = {
  title: "Pricing · Apex Protocol",
  description:
    "Apex Protocol is free to use. Upgrade to Pro for $5/month or $48/year for account history, the 30-day check-in, and clinician PDF export — all coming soon.",
};

const FREE_FEATURES = [
  "Full personalized recommendation",
  "Evidence tier on every pick",
  "Confidence score on every pick",
  "Goal-conflict detection",
  "Shareable result URL",
  "Email-to-self of your protocol",
];

interface ProFeatureRow {
  label: string;
  comingSoon: boolean;
}

const PRO_FEATURES: ProFeatureRow[] = [
  { label: "Everything in Free", comingSoon: false },
  {
    label: "Account history with unlimited recommendations across visits",
    comingSoon: true,
  },
  { label: "30-day protocol check-in", comingSoon: true },
  { label: "Clinician PDF export", comingSoon: true },
  { label: "Priority engine update notifications", comingSoon: true },
];

const LABEL_CLASS =
  "text-[11px] font-mono uppercase tracking-wider text-paper/60";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-ink text-paper">
      <section className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 pt-12 sm:pt-16 pb-12 flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-lime">
            Pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight leading-[1.05]">
            Free to use. Pro for the long arc.
          </h1>
          <p className="text-base text-paper/75 max-w-xl">
            The full personalized recommendation is free, forever. Pro adds
            longitudinal value — history, follow-up, and export — none of which
            gates the current free experience.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <article className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4">
            <header className="flex items-baseline justify-between">
              <h2 className="font-serif text-2xl">Free</h2>
              <span className="font-mono text-sm text-paper/60">$0</span>
            </header>
            <ul className="flex flex-col gap-2 text-sm text-paper/85">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex gap-2">
                  <span
                    className="text-lime mt-1.5 w-1 h-1 rounded-full bg-lime shrink-0"
                    aria-hidden="true"
                  />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/"
              className="mt-2 inline-flex items-center justify-center bg-lime text-ink font-semibold uppercase tracking-wider text-sm rounded-md px-4 py-3 hover:brightness-95"
            >
              Start free
            </Link>
          </article>

          <article className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4">
            <header className="flex items-baseline justify-between flex-wrap gap-x-3">
              <h2 className="font-serif text-2xl">Pro</h2>
              <span className="font-mono text-sm text-paper/60">
                $5/mo · $48/yr
              </span>
            </header>
            <ul className="flex flex-col gap-2 text-sm text-paper/85">
              {PRO_FEATURES.map((f) => (
                <li key={f.label} className="flex gap-2 items-start">
                  <span
                    className="text-lime mt-1.5 w-1 h-1 rounded-full bg-lime shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1">
                    {f.label}
                    {f.comingSoon ? (
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-sm border border-clinical/60 text-clinical">
                        coming soon
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <UpgradeButton variant="primary" />
          </article>
        </div>

        <p className={LABEL_CLASS}>
          Pro features marked “coming soon” are explicitly not yet shipped at
          launch. We do not charge until they ship for paying users.
        </p>
      </section>
    </main>
  );
}
