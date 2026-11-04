"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { WeekCalories } from "@/lib/dashboard/stats";

// Single series, so one color and no legend (the heading names it).
// #3a7d44 passes the dataviz palette checks against the card surface (lightness, chroma, ≥3:1 contrast).
const BAR = "#3a7d44";
const INK_MUTED = "#6b6457";
const GRID = "#e8dfcf";

/** Round y-axis ticks (e.g. 0, 100, 200, 300, 400) instead of odd steps like 85, 170, 255. */
function niceTicks(max: number): number[] {
  if (max <= 0) return [0, 50, 100];
  const steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000];
  const step = steps.find((s) => max / s <= 4) ?? Math.ceil(max / 4);
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: top / step + 1 }, (_, i) => i * step);
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: WeekCalories }[] }) {
  if (!active || !payload?.length) return null;
  const week = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="muted">Week of {week.label}</div>
      <strong>{week.calories.toLocaleString("en-US")} cal</strong> <span className="muted">(est.)</span>
    </div>
  );
}

export default function CaloriesChart({ weeks }: { weeks: WeekCalories[] }) {
  const total = weeks.reduce((sum, w) => sum + w.calories, 0);
  const ticks = niceTicks(Math.max(...weeks.map((w) => w.calories)));

  return (
    <figure className="chart">
      <div
        className="chart-plot"
        role="img"
        aria-label={`Bar chart of estimated calories per week for the last ${weeks.length} weeks, ${total.toLocaleString("en-US")} calories in total. A table version follows.`}
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={weeks} margin={{ top: 8, right: 4, bottom: 0, left: -12 }} barCategoryGap={4}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: GRID }}
              tick={{ fill: INK_MUTED, fontSize: 12 }}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: INK_MUTED, fontSize: 12 }}
              ticks={ticks}
              domain={[0, ticks[ticks.length - 1]]}
              allowDecimals={false}
              width={44}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(58, 125, 68, 0.08)" }} />
            <Bar dataKey="calories" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={32} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <details className="chart-table">
        <summary>Show as a table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Week of</th>
              <th scope="col">Calories (est.)</th>
            </tr>
          </thead>
          <tbody>
            {weeks.map((w) => (
              <tr key={w.weekStart}>
                <td>{w.label}</td>
                <td>{w.calories.toLocaleString("en-US")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
