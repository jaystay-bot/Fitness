"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

import { projectTimeline, type TimelinePoint } from "@/lib/timeline";
import type { SupplementPick } from "@/lib/types";

import { TimelineDayDetail } from "./TimelineDayDetail";

const HORIZON = 30;
const VIEW_W = 800;
const VIEW_H = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };
const PLAY_DURATION_MS = 5000;

// Locked-palette derived colors used as inline strokes. We rotate
// across these for per-supplement lines.
const LINE_COLORS = [
  "#D4FF3A",          // lime
  "#FAFAF7",          // paper
  "#FF6B35",          // clinical
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
  const [hoverDay, setHoverDay] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [scrubberDay, setScrubberDay] = useState<number>(HORIZON);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    setReduced(prefersReducedMotion());
  }, []);

  const aggregate = useMemo(
    () => projectTimeline(picks),
    [picks],
  );

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

  function startPlay() {
    if (reduced) return;
    setScrubberDay(1);
    setPlaying(true);
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const t = Math.min(1, elapsed / PLAY_DURATION_MS);
      const day = Math.max(1, Math.round(1 + t * (HORIZON - 1)));
      setScrubberDay(day);
      if (t < 1) {
        rafRef.current = window.requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = window.requestAnimationFrame(tick);
  }

  function stopPlay() {
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    setPlaying(false);
    setScrubberDay(HORIZON);
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const xStep = (VIEW_W - PAD.left - PAD.right) / (HORIZON - 1);
  const dayFromX = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const ratio = (x - (PAD.left * (rect.width / VIEW_W))) /
                  ((VIEW_W - PAD.left - PAD.right) * (rect.width / VIEW_W));
    const day = Math.round(1 + ratio * (HORIZON - 1));
    return Math.max(1, Math.min(HORIZON, day));
  };

  const detailDay = playing ? scrubberDay : hoverDay;
  const detailPoint =
    detailDay !== null
      ? aggregate.find((p) => p.day === detailDay) ?? null
      : null;
  const perPickAtDay = perPick
    .filter((line) => activeIds.has(line.pick.name))
    .map((line) => {
      const point =
        detailDay !== null
          ? line.points.find((p) => p.day === detailDay)
          : line.points[line.points.length - 1];
      return { name: line.pick.name, point };
    });

  return (
    <section
      aria-label="Interactive 30-day projection"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
          Day-by-day, every supplement, every effect.
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Interactive · 30 days
        </span>
      </div>

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

      <div
        className="relative w-full"
        onMouseMove={(e) => {
          const target = e.currentTarget.querySelector("svg");
          if (!target) return;
          const rect = target.getBoundingClientRect();
          setHoverDay(dayFromX(e.clientX, rect));
        }}
        onMouseLeave={() => setHoverDay(null)}
      >
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          role="img"
          aria-label="30-day cumulative-effect chart"
          className="w-full"
        >
          {/* Gridlines (4 horizontal). */}
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
          {/* Y-axis labels. */}
          <g
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            fill="#FAFAF7"
            fillOpacity="0.5"
          >
            {[0, 50, 100].map((v) => {
              const y = PAD.top + (1 - v / 100) * (VIEW_H - PAD.top - PAD.bottom);
              return (
                <text key={v} x={PAD.left - 6} y={y + 3} textAnchor="end">
                  {v}
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
          {/* Per-supplement lines (energy metric only for clarity). */}
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
          {/* Scrubber. */}
          {!reduced && (playing || hoverDay !== null) && detailDay !== null ? (
            <line
              x1={PAD.left + (detailDay - 1) * xStep}
              x2={PAD.left + (detailDay - 1) * xStep}
              y1={PAD.top}
              y2={VIEW_H - PAD.bottom}
              stroke="#D4FF3A"
              strokeOpacity="0.6"
              strokeWidth="1.5"
            />
          ) : null}
        </svg>
      </div>

      {!reduced ? (
        <div className="flex items-center gap-3">
          {!playing ? (
            <button
              type="button"
              onClick={startPlay}
              aria-label="Play 30-day animation"
              className="inline-flex items-center gap-2 bg-lime text-ink font-semibold uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:brightness-95"
            >
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              Play 30 days
            </button>
          ) : (
            <button
              type="button"
              onClick={stopPlay}
              aria-label="Stop animation"
              className="inline-flex items-center gap-2 border border-paper/30 text-paper font-mono uppercase tracking-wider text-xs rounded-md px-3 py-2 hover:border-lime"
            >
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              Stop
            </button>
          )}
          <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
            {playing ? `Day ${scrubberDay}` : `Hover the chart for daily detail`}
          </span>
        </div>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Reduced motion — animation disabled. Hover or tap a day for detail.
        </p>
      )}

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
