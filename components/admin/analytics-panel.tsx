"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AnalyticsSnapshot } from "@/app/api/admin/analytics/route";
import { DailyChart } from "./daily-chart";
import { RankingTable } from "./ranking-table";
import {
  type SummaryCard,
  SummaryCards,
  PeriodPanelLayout,
} from "./admin-panel-shared";

type Period = "24h" | "7d" | "30d";

async function fetchAnalyticsData(period: Period) {
  const response = await fetch(`/api/admin/analytics?period=${period}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.code ?? "ADMIN_ANALYTICS_FETCH_ERROR");
  }

  return (await response.json()) as AnalyticsSnapshot;
}

export function AnalyticsPanel() {
  const [period, setPeriod] = useState<Period>("7d");

  const {
    data: analytics,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["admin-analytics", period],
    queryFn: () => fetchAnalyticsData(period),
    refetchInterval: 30_000,
  });

  function buildSummaryCards(data: AnalyticsSnapshot): SummaryCard[] {
    return [
      {
        label: "Page Views",
        value: data.summary.pageViews,
        gradient: "from-violet-500/15 via-violet-500/5 to-transparent",
        badge: "border-violet-200 bg-violet-50 text-violet-700",
      },
      {
        label: "Visitantes",
        value: data.summary.visitors,
        gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
        badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      },
      {
        label: "Sessões",
        value: data.summary.sessions,
        gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
        badge: "border-sky-200 bg-sky-50 text-sky-700",
      },
    ];
  }

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-zinc-400">Carregando analytics...</span>
        </div>
      );
    }

    if (!analytics) {
      return (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os dados de analytics.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <SummaryCards
          cards={buildSummaryCards(analytics)}
          period={period}
          isFetching={isFetching}
        />

        {/* Daily chart */}
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            Page views &amp; visitantes por dia
          </p>
          <DailyChart data={analytics.daily} />
        </section>

        {/* Rankings grid */}
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2">
          <section className="min-h-[200px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Páginas mais visitadas
              </p>
            </div>
            <RankingTable
              rows={analytics.topPages.map((p) => ({
                label: p.path,
                value: p.views,
              }))}
              labelHeader="Página"
              valueHeader="Views"
            />
          </section>

          <section className="min-h-[200px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Referrers
              </p>
            </div>
            <RankingTable
              rows={analytics.topReferrers.map((r) => ({
                label: r.referrer,
                value: r.count,
              }))}
              labelHeader="Origem"
              valueHeader="Visitas"
            />
          </section>

          <section className="min-h-[200px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Países
              </p>
            </div>
            <RankingTable
              rows={analytics.topCountries.map((c) => ({
                label: c.country,
                value: c.count,
              }))}
              labelHeader="País"
              valueHeader="Visitas"
            />
          </section>

          <section className="min-h-[200px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Navegadores
              </p>
            </div>
            <RankingTable
              rows={analytics.topBrowsers.map((b) => ({
                label: b.browser,
                value: b.count,
              }))}
              labelHeader="Browser"
              valueHeader="Visitas"
            />
          </section>
        </div>

        {/* Devices */}
        {analytics.topDevices.length > 0 && (
          <section className="min-h-[200px] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:max-w-sm">
            <div className="border-b border-zinc-100 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                Dispositivos
              </p>
            </div>
            <RankingTable
              rows={analytics.topDevices.map((d) => ({
                label: d.deviceType,
                value: d.count,
              }))}
              labelHeader="Tipo"
              valueHeader="Visitas"
            />
          </section>
        )}
      </div>
    );
  })();

  return (
    <PeriodPanelLayout
      period={period}
      onPeriodChange={setPeriod}
      isFetching={isFetching}
    >
      {content}
    </PeriodPanelLayout>
  );
}
