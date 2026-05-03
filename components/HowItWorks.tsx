import { ClipboardList, FlaskConical, ListChecks } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Tell it about your body",
    body: "Nine fields: age, sex, height, weight, activity, sleep, goal, diet, one symptom. No account.",
  },
  {
    icon: FlaskConical,
    title: "Rules engine runs locally",
    body: "A deterministic table of human-trial supplements maps your inputs to a ranked stack.",
  },
  {
    icon: ListChecks,
    title: "Read it. Run it for 30 days.",
    body: "Verdict at the top, full stack with timing, food protocol, and a four-week plan below.",
  },
];

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-paper/10 bg-ink"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="flex flex-col gap-2 mb-8">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-paper/50">
            How it works
          </span>
          <h2
            id="how-it-works-heading"
            className="font-serif text-3xl sm:text-4xl tracking-tight max-w-xl"
          >
            Three steps. Zero fluff.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={i}
                className="border border-paper/15 rounded-lg p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-paper/50">
                    Step 0{i + 1}
                  </span>
                  <Icon className="w-4 h-4 text-lime" aria-hidden="true" />
                </div>
                <h3 className="font-serif text-xl leading-tight">{step.title}</h3>
                <p className="text-sm text-paper/70">{step.body}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
