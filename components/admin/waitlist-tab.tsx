"use client";

import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard-data";
import { formatDate, formatMetric, formatSource } from "./format";

type Props = {
  initialData: AdminDashboardSnapshot;
  isFetching: boolean;
  errorMessage: string;
};

const METRICS_CONFIG = [
  {
    id: "total",
    label: "Total de inscritos",
    key: "total" as const,
    badge: "Acumulado",
    helper: "Todos os leads captados até agora.",
    gradientClass: "from-zinc-900/10 via-zinc-900/5 to-transparent",
    badgeClass: "border-zinc-300 bg-white text-zinc-700",
  },
  {
    id: "last24Hours",
    label: "Últimas 24 horas",
    key: "last24Hours" as const,
    badge: "Hoje",
    helper: "Leads recebidos no último dia.",
    gradientClass: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: "last7Days",
    label: "Últimos 7 dias",
    key: "last7Days" as const,
    badge: "Semana",
    helper: "Volume recente de inscrições.",
    gradientClass: "from-sky-500/15 via-sky-500/5 to-transparent",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
  },
] as const;

export function WaitlistTab({ initialData: data, isFetching, errorMessage }: Props) {
  return (
    <>
      <section className="flex flex-col gap-4 md:grid md:grid-cols-3">
        {METRICS_CONFIG.map((metric) => (
          <article
            key={metric.id}
            className="relative min-h-[170px] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${metric.gradientClass}`}
            />
            <div className="relative">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
                  {metric.label}
                </p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${metric.badgeClass}`}
                >
                  {metric.badge}
                </span>
              </div>
              <p
                className={`mt-5 text-4xl font-bold leading-none tracking-tight text-zinc-950 ${
                  isFetching ? "opacity-80" : ""
                }`}
              >
                {formatMetric(data.summary[metric.key])}
              </p>
              <p className="mt-2 text-xs text-zinc-600">{metric.helper}</p>
            </div>
          </article>
        ))}
      </section>

      {errorMessage && (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="max-h-[70vh] overflow-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
              <tr>
                <th className="px-4 py-3 font-semibold">Data</th>
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 font-semibold">Interesse principal</th>
                <th className="px-4 py-3 font-semibold">Dor principal</th>
                <th className="px-4 py-3 font-semibold">Canal da rotina</th>
                <th className="px-4 py-3 font-semibold">Horas semanais</th>
                <th className="px-4 py-3 font-semibold">Origem</th>
              </tr>
            </thead>
            <tbody>
              {data.entries.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-zinc-500" colSpan={8}>
                    Nenhuma inscrição encontrada.
                  </td>
                </tr>
              )}

              {data.entries.map((entry) => (
                <tr key={entry.id} className="border-t border-zinc-100 align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-zinc-900">{entry.name || "-"}</td>
                  <td className="px-4 py-3 text-zinc-900">{entry.email}</td>
                  <td className="px-4 py-3 text-zinc-700">
                    {entry.onboarding?.messageVolume || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {entry.onboarding?.painPoint || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {entry.onboarding?.routineChannel || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {entry.onboarding?.weeklyNotificationHours || "-"}
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    {entry.utm?.source || formatSource(entry.source)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
