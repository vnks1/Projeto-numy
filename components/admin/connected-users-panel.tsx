"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ConnectedUsersAdminSnapshot } from "@/app/api/admin/connected-users/route";
import { ConnectedUsersChart } from "./connected-users-chart";
import {
  type SummaryCard,
  SummaryCards,
  PeriodPanelLayout,
} from "./admin-panel-shared";

type Period = "24h" | "7d" | "30d";

async function fetchConnectedUsersAdmin(period: Period) {
  const response = await fetch(`/api/admin/connected-users?period=${period}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.code ?? "ADMIN_CONNECTED_USERS_FETCH_ERROR");
  }

  return (await response.json()) as ConnectedUsersAdminSnapshot;
}

function buildSummaryCards(data: ConnectedUsersAdminSnapshot): SummaryCard[] {
  return [
    {
      label: "Agora",
      value: data.current,
      gradient: "from-green-500/15 via-green-500/5 to-transparent",
      badge: "border-green-200 bg-green-50 text-green-700",
    },
    {
      label: "Pico",
      value: data.peak,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    },
    {
      label: "Média",
      value: data.average,
      gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
      badge: "border-sky-200 bg-sky-50 text-sky-700",
    },
  ];
}

export function ConnectedUsersPanel() {
  const [period, setPeriod] = useState<Period>("7d");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admin-connected-users", period],
    queryFn: () => fetchConnectedUsersAdmin(period),
    refetchInterval: 30_000,
  });

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-zinc-400">
            Carregando dados de conectados...
          </span>
        </div>
      );
    }

    if (!data) {
      return (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Não foi possível carregar os dados de usuários conectados.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        <SummaryCards
          cards={buildSummaryCards(data)}
          period={period}
          isFetching={isFetching}
        />

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
            {period === "24h" ? "Conectados por hora" : "Conectados por dia"}
          </p>
          <ConnectedUsersChart data={data.timeline} period={period} />
        </section>
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
