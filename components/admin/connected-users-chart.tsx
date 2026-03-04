"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMetric } from "./format";

type TimelineRow = { date: string; hour?: string; count: number };
type Period = "24h" | "7d" | "30d";

type Props = {
  data: TimelineRow[];
  period: Period;
};

function formatLabel(row: TimelineRow, period: Period) {
  if (period === "24h" && row.hour) {
    return `${row.hour}h`;
  }
  const [, m, d] = row.date.split("-");
  return `${d}/${m}`;
}

export function ConnectedUsersChart({ data, period }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-zinc-400">
        Sem dados no período.
      </p>
    );
  }

  const rows = data.map((d) => ({ ...d, label: formatLabel(d, period) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart
        data={rows}
        margin={{ top: 4, right: 4, bottom: 0, left: -16 }}
      >
        <defs>
          <linearGradient id="connectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="#e4e4e7"
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#71717a" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => formatMetric(v)}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            fontSize: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
          formatter={(value) => [formatMetric(Number(value)), "Conectados"]}
          labelFormatter={(label) => String(label)}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#22c55e"
          strokeWidth={2}
          fill="url(#connectedFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
