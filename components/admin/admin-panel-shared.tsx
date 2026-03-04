"use client";

import type { ReactNode } from "react";
import { formatMetric } from "./format";

export type SummaryCard = {
  label: string;
  value: number;
  gradient: string;
  badge: string;
};

type Period = "24h" | "7d" | "30d";

const PERIODS: { id: Period; label: string }[] = [
  { id: "24h", label: "24h" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
];

export function SummaryCards({
  cards,
  period,
  isFetching,
}: {
  cards: SummaryCard[];
  period: string;
  isFetching: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 md:grid md:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="relative min-h-[130px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.gradient}`}
          />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                {card.label}
              </p>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${card.badge}`}
              >
                {period}
              </span>
            </div>
            <p
              className={`mt-4 text-4xl font-bold leading-none tracking-tight text-zinc-950 ${isFetching ? "opacity-80" : ""}`}
            >
              {formatMetric(card.value)}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export function PeriodPanelLayout({
  period,
  onPeriodChange,
  isFetching,
  children,
}: {
  period: Period;
  onPeriodChange: (p: Period) => void;
  isFetching: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <nav className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onPeriodChange(p.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                period === p.id
                  ? "bg-zinc-950 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </nav>
        {isFetching && (
          <span className="text-xs text-zinc-400">Atualizando...</span>
        )}
      </div>

      {children}
    </div>
  );
}
