"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { projectTimeline, type TimelinePoint } from "@/lib/timeline";
import type { SupplementPick } from "@/lib/types";

const METRIC_COLOR = {
  energy: "#D4FF3A",  // lime
  focus: "#FAFAF7",   // paper
  sleep: "#FF6B35",   // clinical orange
  strength: "#FAFAF7", // paper (different stroke style below)
} as const;

export function TimelineProjection({ picks }: { picks: SupplementPick[] }) {
  const data = useMemo(() => projectTimeline(picks), [picks]);
  const [activeDay, setActiveDay] = useState<TimelinePoint | null>(null);

  if (!picks.length) return null;

  return (
    <section
      aria-label="30-day expected effects timeline"
      className="border border-paper/15 rounded-lg p-5 sm:p-6 flex flex-col gap-4"
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h3 className="font-serif text-xl sm:text-2xl text-paper leading-tight">
          What to expect, day by day
        </h3>
        <span className="font-mono text-[11px] uppercase tracking-wider text-paper/60">
          Pro · 30-day projection
        </span>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            onMouseMove={(s) => {
              const payload = (s as { activePayload?: { payload: TimelinePoint }[] })
                .activePayload?.[0]?.payload;
              if (payload) setActiveDay(payload);
            }}
            onMouseLeave={() => setActiveDay(null)}
          >
            <CartesianGrid strokeDasharray="2 4" stroke="#FAFAF7" strokeOpacity={0.1} />
            <XAxis
              dataKey="day"
              stroke="#FAFAF7"
              strokeOpacity={0.4}
              tick={{ fill: "#FAFAF7", fillOpacity: 0.6, fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#FAFAF7"
              strokeOpacity={0.4}
              tick={{ fill: "#FAFAF7", fillOpacity: 0.6, fontSize: 11 }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "#0A0A0A",
                border: "1px solid #FAFAF733",
                borderRadius: 6,
                color: "#FAFAF7",
                fontSize: 12,
              }}
              labelStyle={{ color: "#D4FF3A" }}
            />
            <Legend
              wrapperStyle={{ color: "#FAFAF7", fontSize: 11, paddingTop: 4 }}
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke={METRIC_COLOR.energy}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Energy"
            />
            <Line
              type="monotone"
              dataKey="focus"
              stroke={METRIC_COLOR.focus}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Focus"
            />
            <Line
              type="monotone"
              dataKey="sleep"
              stroke={METRIC_COLOR.sleep}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
              name="Sleep"
            />
            <Line
              type="monotone"
              dataKey="strength"
              stroke={METRIC_COLOR.strength}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              isAnimationActive={false}
              name="Strength"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-paper/80 leading-snug min-h-[3em]">
        {activeDay ? activeDay.note : data[data.length - 1]?.note ?? ""}
      </p>
    </section>
  );
}
