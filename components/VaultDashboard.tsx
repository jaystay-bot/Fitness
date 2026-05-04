import { SPEAR_COPY } from "@/lib/spearCopy";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

interface VaultCard {
  label: string;
  value: string;
  caption: string;
  isLink?: boolean;
}

const CARDS: VaultCard[] = [
  {
    label: SPEAR_COPY.vaultLabels.balance,
    value: USD.format(SPEAR_COPY.vaultMath.yearOneKept),
    caption: SPEAR_COPY.vaultCaptions.balance,
  },
  {
    label: SPEAR_COPY.vaultLabels.savedThisMonth,
    value: USD.format(SPEAR_COPY.vaultMath.monthlyContribution),
    caption: SPEAR_COPY.vaultCaptions.savedThisMonth,
  },
  {
    label: SPEAR_COPY.vaultLabels.healthScore,
    value: "87",
    caption: SPEAR_COPY.vaultCaptions.healthScore,
  },
  {
    label: SPEAR_COPY.vaultLabels.findCare,
    value: SPEAR_COPY.vaultCaptions.findCare,
    caption: "marketplace ships in N=011",
    isLink: true,
  },
];

export function VaultDashboard() {
  return (
    <section
      aria-label="Vault dashboard preview"
      className="px-5 sm:px-8 lg:px-12 pb-10 max-w-6xl mx-auto w-full"
    >
      <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
        <h2 className="font-serif text-2xl sm:text-3xl tracking-tight">
          Your vault, in numbers
        </h2>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper/60">
          Preview
        </span>
      </div>

      <ul
        role="list"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {CARDS.map((card) => (
          <li
            key={card.label}
            className="border border-paper/15 rounded-lg p-4 sm:p-5 flex flex-col gap-1.5"
          >
            <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
              {card.label}
            </span>
            <span
              className={`font-mono ${card.isLink ? "text-lime text-2xl" : "text-paper text-3xl sm:text-4xl"} leading-none`}
            >
              {card.value}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50">
              {card.caption}
            </span>
          </li>
        ))}
      </ul>

      <p
        role="note"
        aria-live="polite"
        className="mt-4 text-[11px] font-mono uppercase tracking-wider text-clinical leading-snug"
      >
        {SPEAR_COPY.vaultDisclosure}
      </p>
    </section>
  );
}
