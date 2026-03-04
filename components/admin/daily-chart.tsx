"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatMetric } from "./format";

type DailyRow = { date: string; pageViews: number; visitors: number };

type Props = {
  data: DailyRow[];
};

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

export function DailyChart({ data }: Props) {
  if (data.length === 0) {
    return <p className="py-6 text-center text-sm text-zinc-400">Sem dados no período.</p>;
  }

  const rows = data.map((d) => ({ ...d, label: shortDate(d.date) }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e4e4e7" />
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
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            fontSize: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          }}
          formatter={(value, name) => [
            formatMetric(Number(value)),
            name === "pageViews" ? "Page Views" : "Visitantes",
          ]}
          labelFormatter={(label) => String(label)}
        />
        <Bar dataKey="pageViews" fill="#18181b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="visitors" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
