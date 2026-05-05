"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

import { projectTimeline, type TimelinePoint } from "@/lib/timeline";
import type { SupplementPick } from "@/lib/types";

import { TimelineDayDetail } from "./TimelineDayDetail";

const HORIZON = 30;
const VIEW_W = 800;
const VIEW_H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

// Auto-play traverses day 1 -> day 30 in 30 seconds. Each day sits on
// screen for ~1034ms so a tester actually has time to read the callout.
const PLAY_DURATION_MS = 30_000;
const STEP_MS = PLAY_DURATION_MS / (HORIZON - 1);

const LINE_COLORS = [
  "#D4FF3A",
  "#FAFAF7",
  "#FF6B35",
  "rgba(250, 250, 247, 0.55)",
  "rgba(212, 255, 58, 0.6)",
  "rgba(255, 107, 53, 0.6)",
  "rgba(250, 250, 247, 0.3)",
] as const;

const METRICS = ["energy", "focus", "sleep", "strength"] as const;
type Metric = (typeof METRICS)[number];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickPath(points: TimelinePoint[], metric: Metric): string {
  const xStep = (VIEW_W - PAD.left - PAD.right) / (HORIZON - 1);
  const yScale = (v: number) =>
    PAD.top + (1 - v / 100) * (VIEW_H - PAD.top - PAD.bottom);
  let d = "";
  points.forEach((p, i) => {
    const x = PAD.left + i * xStep;
    const y = yScale(p[metric]);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return d;
}

function aggregatePath(points: TimelinePoint[]): string {
  const xStep = (VIEW_W - PAD.left - PAD.right) / (HORIZON - 1);
  const yScale = (v: number) =>
    PAD.top + (1 - v / 100) * (VIEW_H - PAD.top - PAD.bottom);
  let d = "";
  points.forEach((p, i) => {
    const v = (p.energy + p.focus + p.sleep + p.strength) / 4;
    const x = PAD.left + i * xStep;
    const y = yScale(v);
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return d;
}

// Plain-English headline for the current day. Never uses banned terms.
function calloutForDay(day: number): string {
  if (day === 1) return `Day ${day} — first day of your stack.`;
  if (day === 2) return `Day ${day} — building the daily habit.`;
  if (day === 3) return `Day ${day} — the fast helpers are showing up.`;
  if (day === 7) return `Day ${day} — your first full week is done.`;
  if (day === 10) return `Day ${day} — momentum is real now.`;
  if (day === 14) return `Day ${day} — two weeks in, halfway to the month.`;
  if (day === 21) return `Day ${day} — three weeks in, full effect for most pills.`;
  if (day === 28) return `Day ${day} — four weeks in, almost there.`;
  if (day === 30) return `Day ${day} — one full month in. Take stock.`;
  if (day < 7) return `Day ${day} — early days, keep showing up.`;
  if (day < 14) return `Day ${day} — into the second week.`;
  if (day < 21) return `Day ${day} — into the third week.`;
  return `Day ${day} — into the final stretch.`;
}

interface PerPickLine {
  pick: SupplementPick;
  points: TimelinePoint[];
  color: string;
}

export function InteractiveTimeline({ picks }: { picks: SupplementPick[] }) {
  const [reduced, setReduced] = useState(false);
  const [activeIds, setActiveIds] = useState<Set<string>>(
    () => new Set(picks.map((p) => p.name)),
  );
  const [day, setDay] = useState<number>(1);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const aggregate = useMemo(() => projectTimeline(picks), [picks]);

  const perPick: PerPickLine[] = useMemo(
    () =>
      picks.map((pick, i) => ({
        pick,
        points: projectTimeline([pick]),
        color: LINE_COLORS[i % LINE_COLORS.length],
      })),
    [picks],
  );

  function toggle(name: string) {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  // Auto-advance loop. Each tick advances the day by 1 if STEP_MS has
  // elapsed since the previous step. When the user reaches day 30 the
  // loop pauses on its own.
  useEffect(() => {
    if (!playing) return;
    function tick(ts: number) {
      if (!lastTickRef.current) lastTickRef.current = ts;
      const elapsed = ts - lastTickRef.current;
      if (elapsed >= STEP_MS) {
        lastTickRef.current = ts;
        setDay((d) => {
          const next = d + 1;
          if (next >= HORIZON) {
            setPlaying(false);
            return HORIZON;
          }
          return next;
        });
      }
      rafRef.current = window.requestAnimationFrame(tick);
    }
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      lastTickRef.current = 0;
    };
  }, [playing]);

  function play() {
    if (day >= HORIZON) setDay(1);
    lastTickRef.current = 0;
    setPlaying(true);
  }
  function pause() {
    setPlaying(false);
  }
  function rewind() {
    setPlaying(false);
    setDay(1);
  }
  function stepBack() {
    setPlaying(false);
    setDay((d) => Math.max(1, d - 1));
  }
  function stepForward() {
    setPlaying(false);
    setDay((d) => Math.min(HORIZON, d + 1));
  }
  function onScrubChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (Number.isFinite(next)) {
      setPlaying(false);
      setDay(Math.max(1, Math.min(HORIZON, Math.round(next))));
    }
  }

  const xStep = (VIEW_W - PAD.left - PAD.right) / (HORIZON - 1);
  const detailPoint = aggregate.find((p) => p.day === day) ?? null;
  const perPickAtDay = perPick
    .filter((line) => activeIds.has(line.pick.name))
    .map((line) => {
      const point = line.points.find((p) => p.day === day);
      return { name: line.pick.name, point };
    });

  return (
    <section
      aria-label="Interactive 30-day projection"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
          What happens, day by day.
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          30-day plan · play, pause, or scrub
        </span>
      </div>

      {/* Single-day callout, prominent above the chart. */}
      <div
        role="status"
        aria-live="polite"
        className="bg-paper/5 border border-paper/15 rounded-md px-4 py-3"
      >
        <p className="font-serif text-lg sm:text-xl text-paper leading-snug">
          {calloutForDay(day)}
        </p>
      </div>

      {/* Per-supplement filter pills (carried from N=008). */}
      <div className="flex flex-wrap gap-1.5">
        {picks.map((p, i) => {
          const active = activeIds.has(p.name);
          const color = LINE_COLORS[i % LINE_COLORS.length];
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => toggle(p.name)}
              aria-pressed={active}
              className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider rounded-md px-2 py-1 border ${active ? "border-paper/30" : "border-paper/10 opacity-50"}`}
            >
              <span
                aria-hidden="true"
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              <span className="text-paper/85">{p.name}</span>
            </button>
          );
        })}
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label={`30-day chart, currently showing day ${day}`}
          className="w-full"
        >
          {/* Horizontal gridlines. */}
          <g stroke="#FAFAF7" strokeOpacity="0.08" strokeWidth="1">
            {[0, 25, 50, 75, 100].map((v, i) => {
              const y = PAD.top + (1 - v / 100) * (VIEW_H - PAD.top - PAD.bottom);
              return (
                <line
                  key={i}
                  x1={PAD.left}
                  x2={VIEW_W - PAD.right}
                  y1={y}
                  y2={y}
                />
              );
            })}
          </g>
          {/* Y-axis labels with plain-language anchors. */}
          <g
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            fill="#FAFAF7"
            fillOpacity="0.5"
          >
            {[
              { v: 0, label: "0" },
              { v: 50, label: "50" },
              { v: 100, label: "100" },
            ].map(({ v, label }) => {
              const y = PAD.top + (1 - v / 100) * (VIEW_H - PAD.top - PAD.bottom);
              return (
                <text key={v} x={PAD.left - 6} y={y + 3} textAnchor="end">
                  {label}
                </text>
              );
            })}
          </g>
          {/* X-axis day labels. */}
          <g
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            fill="#FAFAF7"
            fillOpacity="0.5"
          >
            {[1, 7, 14, 21, 30].map((d) => {
              const x = PAD.left + (d - 1) * xStep;
              return (
                <text key={d} x={x} y={VIEW_H - PAD.bottom + 14} textAnchor="middle">
                  d{d}
                </text>
              );
            })}
          </g>
          {/* Aggregate average line, dashed and faint. */}
          <path
            d={aggregatePath(aggregate)}
            fill="none"
            stroke="#FAFAF7"
            strokeOpacity="0.25"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          {/* Per-supplement lines (energy metric for clarity). */}
          {perPick.map((line) =>
            activeIds.has(line.pick.name) ? (
              <path
                key={line.pick.name}
                d={pickPath(line.points, "energy")}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null,
          )}
          {/* Active-day vertical scrubber line, always visible. */}
          <line
            x1={PAD.left + (day - 1) * xStep}
            x2={PAD.left + (day - 1) * xStep}
            y1={PAD.top}
            y2={VIEW_H - PAD.bottom}
            stroke="#D4FF3A"
            strokeOpacity="0.7"
            strokeWidth="1.5"
          />
          {/* Active-day filled circle on the aggregate line for emphasis. */}
          {detailPoint ? (
            <circle
              cx={PAD.left + (day - 1) * xStep}
              cy={
                PAD.top +
                (1 -
                  (detailPoint.energy +
                    detailPoint.focus +
                    detailPoint.sleep +
                    detailPoint.strength) /
                    4 /
                    100) *
                  (VIEW_H - PAD.top - PAD.bottom)
              }
              r={4}
              fill="#D4FF3A"
              stroke="#0A0A0A"
              strokeWidth="1.5"
            />
          ) : null}
        </svg>
      </div>

      {/* Controls row — always visible. */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!playing ? (
            <button
              type="button"
              onClick={play}
              aria-label="Play 30-day animation"
              disabled={reduced}
              className="inline-flex items-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95 disabled:opacity-40"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Play
            </button>
          ) : (
            <button
              type="button"
              onClick={pause}
              aria-label="Pause animation"
              className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:border-lime"
            >
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              Pause
            </button>
          )}
          <button
            type="button"
            onClick={rewind}
            aria-label="Rewind to day 1"
            className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:border-lime"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Rewind
          </button>
          <button
            type="button"
            onClick={stepBack}
            aria-label="Previous day"
            disabled={day <= 1}
            className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:border-lime disabled:opacity-40 disabled:hover:border-paper/30"
          >
            <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Day −1
          </button>
          <button
            type="button"
            onClick={stepForward}
            aria-label="Next day"
            disabled={day >= HORIZON}
            className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:border-lime disabled:opacity-40 disabled:hover:border-paper/30"
          >
            Day +1
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <span className="ml-auto font-mono text-[11px] uppercase tracking-wider text-paper/60">
            Day {day} / {HORIZON}
          </span>
        </div>

        {/* Scrub bar — drag to any day. */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/40 w-6 shrink-0">
            d1
          </span>
          <input
            type="range"
            min={1}
            max={HORIZON}
            step={1}
            value={day}
            onChange={onScrubChange}
            aria-label="Scrub to day"
            className="flex-1 accent-lime h-1.5 bg-paper/10 rounded-full"
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-paper/40 w-7 shrink-0 text-right">
            d{HORIZON}
          </span>
        </div>

        {reduced ? (
          <p className="font-mono text-[10px] uppercase tracking-wider text-paper/40">
            Reduced motion — auto-play disabled. Use the scrub bar or step buttons to walk through the 30 days.
          </p>
        ) : null}
      </div>

      <TimelineDayDetail
        point={detailPoint}
        perPick={perPickAtDay.filter(
          (entry): entry is { name: string; point: TimelinePoint } =>
            Boolean(entry.point),
        )}
      />
    </section>
  );
}
