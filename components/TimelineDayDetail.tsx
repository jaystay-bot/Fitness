import type { TimelinePoint } from "@/lib/timeline";
import { nameToId } from "@/lib/timelineData";

export interface TimelineDayDetailProps {
  point: TimelinePoint | null;
  perPick: { name: string; point: TimelinePoint }[];
}

const METRIC_LABELS: Record<keyof Omit<TimelinePoint, "day" | "note">, string> = {
  energy: "Energy",
  focus: "Focus & clarity",
  sleep: "Sleep quality",
  strength: "Workout strength",
};

// Plain-English bucket label for a 0-100 metric value. Bands are wide so
// the description changes meaningfully every quarter of the scale.
function bucketFor(value: number): string {
  if (value < 25) return "barely moving yet";
  if (value < 50) return "starting to lift";
  if (value < 75) return "clearly working";
  return "near full effect";
}

// Per-supplement plain-English why-statement for the current day. Pure
// lookup against the canonical id from lib/timelineData. Every string is
// banlist-clean (no ferritin / methylcobalamin / mitochondrial / etc.).
function whyForPickAtDay(name: string, day: number, energy: number): string {
  const id = nameToId(name);
  const ramp = energy < 25 ? "still building up in your body" : energy < 75 ? "starting to do its job" : "giving you close to its full effect";
  switch (id) {
    case "creatine":
      if (day < 7) return "Filling your muscles with extra fuel for workouts.";
      if (day < 21) return "Muscles are storing more energy each day — lifts feel a touch easier.";
      return "Muscles are full of stored energy. This is the steady state.";
    case "vitamin-d3":
      if (day < 14) return "Slowly raising your vitamin D level. Effects show up around week three.";
      if (day < 28) return "Your vitamin D level is climbing — better mood and steadier energy.";
      return "Vitamin D level is in a healthy range. Keep it up.";
    case "magnesium-glycinate":
      if (day < 4) return "A gentle form of magnesium that helps you wind down at night.";
      if (day < 14) return "Sleep is getting deeper. Most people notice better mornings by now.";
      return "Sleep support is fully in place. Stick with the bedtime dose.";
    case "omega-3":
      if (day < 14) return "Fish oil is starting to lower the noise in your brain and joints.";
      if (day < 28) return "Mental clarity is sharper and joints feel less stiff.";
      return "Brain and joint support is at full strength.";
    case "protein":
      if (day < 7) return "Giving your muscles the building blocks they need to repair after workouts.";
      if (day < 21) return "Recovery between workouts is faster — you can train more often.";
      return "Strength gains are baked in. Keep eating enough protein every day.";
    case "caffeine-theanine":
      return "A focused boost without the jitters — works the same on day one as on day thirty.";
    case "rhodiola":
      if (day < 7) return "A stress-resilience herb that takes about a week to settle in.";
      if (day < 21) return "You handle stressful moments with less of an energy crash.";
      return "Daily stress feels lower. Energy is steadier through the afternoon.";
    case "ashwagandha":
      if (day < 10) return "A stress-resilience herb that calms you down without making you sleepy.";
      if (day < 28) return "Sleep is deeper and your strength workouts feel a little easier.";
      return "Stress is lower and sleep quality is high. Keep the nightly dose.";
    case "zinc":
      if (day < 14) return "Topping up a mineral most people are short on. Helps energy and immune health.";
      return "Your zinc level is back where it should be.";
    case "b12":
      if (day < 7) return "Vitamin B12 — the form your body uses to turn food into energy.";
      if (day < 21) return "Brain fog is lifting. Energy lasts longer through the day.";
      return "B12 levels are healthy. Energy and mental clarity stay steady.";
    case "iron":
      if (day < 14) return "A gentle form of iron, slowly rebuilding your iron stores.";
      if (day < 28) return "Less daytime fatigue. Iron is reaching the parts of your body that need it.";
      return "Iron stores are recovering. You should feel noticeably less worn out.";
    case "probiotic":
      if (day < 7) return "Helpful gut bacteria are settling in. Bloating starts to ease.";
      return "Your gut feels calmer. Digestion is more predictable.";
    case "electrolytes":
      return "Salt + minerals you sweat out — keeps energy steady, especially on hot or active days.";
    case "melatonin":
      if (day < 4) return "A small dose helps you fall asleep faster.";
      return "Sleep onset is reliable. Use only on the nights you need it.";
    case "hmb":
      if (day < 14) return "Helps your muscles hold onto strength while you train.";
      return "Muscle preservation is at full strength.";
    case "beta-alanine":
      if (day < 14) return "Builds up in your muscles so harder sets feel less brutal.";
      return "Endurance during high-rep sets is at full strength.";
    case "citrulline-malate":
      if (day < 7) return "Improves blood flow to your muscles during workouts.";
      return "You should feel a stronger pump during workouts.";
    case "tyrosine":
      if (day < 4) return "A focus aid that works fast — best taken before mentally heavy work.";
      return "Mental focus is sharper, especially under pressure.";
    default:
      return `${ramp[0]?.toUpperCase()}${ramp.slice(1)}.`;
  }
}

export function TimelineDayDetail({ point, perPick }: TimelineDayDetailProps) {
  if (!point) return null;
  const metricEntries: Array<{ key: keyof typeof METRIC_LABELS; value: number }> = [
    { key: "energy", value: point.energy },
    { key: "focus", value: point.focus },
    { key: "sleep", value: point.sleep },
    { key: "strength", value: point.strength },
  ];
  return (
    <aside
      role="status"
      aria-live="polite"
      aria-label={`Day ${point.day} detail`}
      className="border border-paper/15 rounded-md p-4 sm:p-5 flex flex-col gap-3"
    >
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <span className="font-mono text-[11px] uppercase tracking-wider text-lime">
          Day {point.day}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-paper/50">
          Scale 0–100 means: barely moving → full effect
        </span>
      </div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {metricEntries.map(({ key, value }) => (
          <li
            key={key}
            className="flex items-baseline justify-between gap-3 border border-paper/10 rounded px-3 py-2"
          >
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="font-serif text-sm text-paper leading-tight">
                {METRIC_LABELS[key]}
              </span>
              <span className="text-xs text-paper/65 leading-tight">
                {bucketFor(value)}
              </span>
            </div>
            <span className="font-mono text-sm text-paper shrink-0">
              {value} <span className="text-paper/40">/ 100</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-paper/85 leading-snug">{point.note}</p>

      {perPick.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h4 className="font-mono text-[10px] uppercase tracking-wider text-paper/55">
            What each pill is doing today
          </h4>
          <ul className="flex flex-col gap-1.5">
            {perPick.map((entry) => (
              <li
                key={entry.name}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-sm"
              >
                <span className="text-paper font-medium shrink-0 min-w-[8rem]">
                  {entry.name}
                </span>
                <span className="text-paper/70 leading-snug">
                  {whyForPickAtDay(entry.name, point.day, entry.point.energy)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
