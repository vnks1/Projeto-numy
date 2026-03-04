"use client";

import { formatMetric } from "./format";

type Props = {
  rows: { label: string; value: number }[];
  labelHeader: string;
  valueHeader: string;
};

export function RankingTable({ rows, labelHeader, valueHeader }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex min-h-[120px] items-center justify-center">
        <p className="text-sm text-zinc-400">Sem dados no período.</p>
      </div>
    );
  }

  const max = rows[0]?.value ?? 1;

  return (
    <div className="divide-y divide-zinc-100 text-sm">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        <span>{labelHeader}</span>
        <span>{valueHeader}</span>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="relative flex items-center justify-between px-4 py-2.5">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 bg-zinc-100"
            style={{ width: `${(row.value / max) * 100}%` }}
          />
          <span className="relative truncate text-zinc-800">{row.label}</span>
          <span className="relative font-medium tabular-nums text-zinc-950">
            {formatMetric(row.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
