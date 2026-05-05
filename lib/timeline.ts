import type { SupplementPick } from "./types";
import { ONSET_CURVES, nameToId, type OnsetCurve } from "./timelineData";

export interface TimelinePoint {
  day: number; // 1..30
  energy: number; // 0..100
  focus: number;
  sleep: number;
  strength: number;
  note: string;
}

const HORIZON_DAYS = 30;
const METRICS = ["energy", "focus", "sleep", "strength"] as const;
type Metric = (typeof METRICS)[number];

// Logistic onset: returns fraction-of-plateau at day d for given t50 and tmax.
// Anchored so that f(t50)=0.5 and f(tmax)=~0.95.
function onsetFraction(d: number, t50: number, tmax: number): number {
  if (d <= 0) return 0;
  const k = Math.log(19) / Math.max(1, tmax - t50); // ln(0.95/(1-0.95)) ~= ln(19)
  const value = 1 / (1 + Math.exp(-k * (d - t50)));
  return Math.max(0, Math.min(1, value));
}

function effectAtDay(curve: OnsetCurve, metric: Metric, day: number): number {
  const t50 = curve.t50[metric];
  const tmax = curve.tmax[metric];
  const plateau = curve.plateau[metric];
  if (t50 === undefined || tmax === undefined || plateau === 0) return 0;
  return plateau * onsetFraction(day, t50, tmax);
}

function noteForDay(
  day: number,
  prev: Record<Metric, number>,
  curr: Record<Metric, number>,
): string {
  if (day === 1) {
    return "Day one. Take your stack today. You will not feel much yet — that is normal. The goal this week is to take it every day at the same time.";
  }
  // Find the metric with the largest jump from yesterday.
  let best: { metric: Metric; delta: number } | null = null;
  for (const m of METRICS) {
    const delta = curr[m] - prev[m];
    if (!best || delta > best.delta) best = { metric: m, delta };
  }
  if (day === 3) {
    return "Day three. Sleep helpers and the morning energy boost are starting to show up. Most other pills are still building up in your body.";
  }
  if (day === 7) {
    return "Day seven. One full week in. Magnesium and the stress-resilience herbs feel settled. If you were running low on a vitamin, your energy floor is starting to lift.";
  }
  if (day === 14) {
    return "Day fourteen. Two weeks in. Workouts feel a little stronger thanks to creatine. Brain-support picks like omega-3 and vitamin B12 are clearly doing their job.";
  }
  if (day === 21) {
    return "Day twenty-one. Three weeks in. Creatine has fully built up in your muscles. Most pills are now giving you close to their full effect.";
  }
  if (day === 30) {
    return "Day thirty. One month in. Quick-acting pills have leveled off. Slower ones like vitamin D and fish oil are still building. Keep going.";
  }
  if (best && best.delta > 1) {
    const m = best.metric;
    if (m === "energy") return `Day ${day}. Your energy is trending up. Notice how you feel in the morning before any coffee — that is your real baseline.`;
    if (m === "focus") return `Day ${day}. Mental clarity is getting stronger. Try to do your hardest thinking in the first half of the day.`;
    if (m === "sleep") return `Day ${day}. Sleep is improving. Keep your wake-up time fixed and put the phone down after 9 p.m.`;
    if (m === "strength") return `Day ${day}. Your muscles are getting more building blocks. Aim for at least three workouts this week.`;
  }
  return `Day ${day}. Steady day. Take the stack as planned.`;
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function projectTimeline(picks: SupplementPick[]): TimelinePoint[] {
  const ids = picks.map((p) => nameToId(p.name)).filter(Boolean);
  const curves = ids
    .map((id) => ONSET_CURVES[id])
    .filter((c): c is OnsetCurve => Boolean(c));

  // Saturation totals across the active stack — used to normalize 0..100.
  // We sum plateau magnitudes per metric; if the sum is small, the curve
  // is still emitted but at a lower normalized range.
  const totalPlateau: Record<Metric, number> = {
    energy: 0, focus: 0, sleep: 0, strength: 0,
  };
  for (const c of curves) {
    for (const m of METRICS) totalPlateau[m] += Math.max(0, c.plateau[m]);
  }
  const denom: Record<Metric, number> = {
    energy: Math.max(0.001, totalPlateau.energy),
    focus: Math.max(0.001, totalPlateau.focus),
    sleep: Math.max(0.001, totalPlateau.sleep),
    strength: Math.max(0.001, totalPlateau.strength),
  };

  const out: TimelinePoint[] = [];
  let prev: Record<Metric, number> = { energy: 0, focus: 0, sleep: 0, strength: 0 };
  for (let day = 1; day <= HORIZON_DAYS; day++) {
    const sums: Record<Metric, number> = { energy: 0, focus: 0, sleep: 0, strength: 0 };
    for (const c of curves) {
      for (const m of METRICS) sums[m] += effectAtDay(c, m, day);
    }
    const curr: Record<Metric, number> = {
      energy: clamp01(sums.energy / denom.energy) * 100,
      focus: clamp01(sums.focus / denom.focus) * 100,
      sleep: clamp01(sums.sleep / denom.sleep) * 100,
      strength: clamp01(sums.strength / denom.strength) * 100,
    };
    out.push({
      day,
      energy: Math.round(curr.energy),
      focus: Math.round(curr.focus),
      sleep: Math.round(curr.sleep),
      strength: Math.round(curr.strength),
      note: noteForDay(day, prev, curr),
    });
    prev = curr;
  }
  return out;
}
