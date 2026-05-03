import { GitFork, ShieldCheck, Siren } from "lucide-react";

const POINTS = [
  {
    icon: ShieldCheck,
    title: "Evidence tier on every pick",
    body: "A multivitamin gives you 23 ingredients with no signal. Apex Protocol shows you the strength of evidence per ingredient and skips the ones that do not earn their spot.",
  },
  {
    icon: Siren,
    title: "Interaction warnings, not just a list",
    body: "Zinc steals copper. Magnesium fights caffeine. Iron and coffee cancel each other. The stack tells you, the bottle never will.",
  },
  {
    icon: GitFork,
    title: "Goal-conflict detection",
    body: "Want muscle on a sedentary schedule? The protocol calls it out and tells you which lever to pull first — before you spend a dollar on supplements.",
  },
];

export function Differentiators() {
  return (
    <section
      aria-labelledby="differentiators-heading"
      className="border-t border-paper/10"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex flex-col gap-2 mb-8 max-w-2xl">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">
            Why this beats a multivitamin
          </span>
          <h2
            id="differentiators-heading"
            className="font-serif text-3xl sm:text-4xl tracking-tight"
          >
            One pill labeled <span className="italic">"everything"</span>{" "}
            is the worst protocol money can buy.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {POINTS.map((point, i) => {
            const Icon = point.icon;
            return (
              <article
                key={i}
                className="border border-paper/15 rounded-lg p-5 flex flex-col gap-3"
              >
                <Icon className="w-5 h-5 text-lime" aria-hidden="true" />
                <h3 className="font-serif text-xl leading-tight">{point.title}</h3>
                <p className="text-sm text-paper/70">{point.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
