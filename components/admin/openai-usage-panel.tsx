"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { OpenAIUsageSnapshot } from "@/app/api/admin/openai-usage/route";
import { formatMetric } from "./format";
import { PeriodPanelLayout } from "./admin-panel-shared";

type Period = "24h" | "7d" | "30d";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

async function fetchOpenAIUsage(period: Period) {
  const response = await fetch(`/api/admin/openai-usage?period=${period}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.code ?? "ADMIN_OPENAI_USAGE_FETCH_ERROR");
  }

  return (await response.json()) as OpenAIUsageSnapshot;
}

function getErrorCode(error: unknown) {
  return error instanceof Error
    ? error.message
    : "ADMIN_OPENAI_USAGE_FETCH_ERROR";
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

function formatCompactMetric(value: number) {
  return formatMetric(value, "compact");
}

function formatMoney(value: number, currency: string) {
  const safeCurrency = currency.toUpperCase();
  const locale = safeCurrency === "BRL" ? "pt-BR" : "en-US";

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

function getErrorMessage(errorCode: string) {
  if (errorCode === "OPENAI_ADMIN_KEY_NOT_CONFIGURED") {
    return "Defina OPENAI_ADMIN_KEY (ou OPENAI_ADMIN_API_KEY) no ambiente para carregar o uso.";
  }

  if (errorCode === "OPENAI_USAGE_AUTH_FAILED") {
    return "A chave OpenAI está inválida ou não possui permissão admin da organização.";
  }

  if (errorCode === "OPENAI_USAGE_RATE_LIMITED") {
    return "A OpenAI limitou temporariamente as consultas de uso. Tente novamente em instantes.";
  }

  if (errorCode === "OPENAI_USAGE_UPSTREAM_ERROR") {
    return "A OpenAI retornou erro ao buscar uso de tokens.";
  }

  return "Não foi possível carregar os dados de uso da OpenAI.";
}

export function OpenAIUsagePanel() {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("7d");

  const usageQuery = useQuery({
    queryKey: ["admin-openai-usage", period],
    queryFn: () => fetchOpenAIUsage(period),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
  });

  const errorCode = usageQuery.isError ? getErrorCode(usageQuery.error) : "";
  const errorMessage = usageQuery.isError ? getErrorMessage(errorCode) : "";

  useEffect(() => {
    if (errorCode === "UNAUTHORIZED") {
      router.replace("/admin/login");
      router.refresh();
    }
  }, [errorCode, router]);

  const data = usageQuery.data;

  const content = (() => {
    if (usageQuery.isLoading) {
      return (
        <div className="flex h-40 items-center justify-center">
          <span className="text-sm text-zinc-400">
            Carregando uso de tokens...
          </span>
        </div>
      );
    }

    if (!data) {
      return (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      );
    }

    return (
      <>
        <section className="flex flex-col gap-4 md:grid md:grid-cols-5">
          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Tokens totais
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              {formatCompactMetric(data.summary.totalTokens)}
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Input tokens
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              {formatCompactMetric(data.summary.inputTokens)}
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Output tokens
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              {formatCompactMetric(data.summary.outputTokens)}
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Requests
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              {formatCompactMetric(data.summary.totalRequests)}
            </p>
          </article>

          <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Custo total
            </p>
            <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
              {formatMoney(data.summary.totalCost, data.summary.currency)}
            </p>
            {typeof data.summary.totalCostBrl === "number" && (
              <p className="mt-1 text-sm font-medium text-zinc-600">
                {formatMoney(data.summary.totalCostBrl, "BRL")}
              </p>
            )}
          </article>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-600">
            Cache input tokens:{" "}
            <span className="font-semibold text-zinc-900">
              {formatCompactMetric(data.summary.cachedInputTokens)}
            </span>
            {" · "}Input audio:{" "}
            <span className="font-semibold text-zinc-900">
              {formatCompactMetric(data.summary.inputAudioTokens)}
            </span>
            {" · "}Output audio:{" "}
            <span className="font-semibold text-zinc-900">
              {formatCompactMetric(data.summary.outputAudioTokens)}
            </span>
            {typeof data.fx.usdToBrl === "number" && (
              <>
                {" · "}USD/BRL:{" "}
                <span className="font-semibold text-zinc-900">
                  {data.fx.usdToBrl.toFixed(4)}
                </span>
                {data.fx.date && <> ({data.fx.date})</>}
              </>
            )}
            {" · "}Última atualização:{" "}
            <span className="font-semibold text-zinc-900">
              {formatDateTime(data.generatedAt)}
            </span>
          </p>
          {data.bucketWidth === "1h" && (
            <p className="mt-2 text-xs text-zinc-500">
              O custo detalhado por linha não é exibido em buckets horários.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Uso por período
            </p>
          </div>

          <div className="max-h-[46vh] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Início</th>
                  <th className="px-4 py-3 font-semibold">Fim</th>
                  <th className="px-4 py-3 font-semibold">Tokens</th>
                  <th className="px-4 py-3 font-semibold">Input</th>
                  <th className="px-4 py-3 font-semibold">Output</th>
                  <th className="px-4 py-3 font-semibold">Requests</th>
                  <th className="px-4 py-3 font-semibold">Custo</th>
                </tr>
              </thead>
              <tbody>
                {data.timeline.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-zinc-500" colSpan={7}>
                      Sem dados no período.
                    </td>
                  </tr>
                )}
                {data.timeline.map((row) => (
                  <tr
                    key={row.startTime}
                    className="border-t border-zinc-100 align-top"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                      {formatDateTime(row.startTime)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-700">
                      {formatDateTime(row.endTime)}
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {formatCompactMetric(row.totalTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.inputTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.outputTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.requests)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {typeof row.cost === "number" ? (
                        <div className="flex flex-col">
                          <span>
                            {formatMoney(row.cost, data.summary.currency)}
                          </span>
                          {typeof row.costBrl === "number" && (
                            <span className="text-xs text-zinc-500">
                              {formatMoney(row.costBrl, "BRL")}
                            </span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500">
              Consumo por modelo
            </p>
          </div>

          <div className="max-h-[40vh] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 bg-zinc-50 text-xs uppercase tracking-wide text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Modelo</th>
                  <th className="px-4 py-3 font-semibold">Tokens</th>
                  <th className="px-4 py-3 font-semibold">Input</th>
                  <th className="px-4 py-3 font-semibold">Output</th>
                  <th className="px-4 py-3 font-semibold">Cache input</th>
                  <th className="px-4 py-3 font-semibold">Requests</th>
                </tr>
              </thead>
              <tbody>
                {data.perModel.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-zinc-500" colSpan={6}>
                      Sem dados por modelo.
                    </td>
                  </tr>
                )}
                {data.perModel.map((row) => (
                  <tr
                    key={row.model}
                    className="border-t border-zinc-100 align-top"
                  >
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {row.model}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.totalTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.inputTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.outputTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.cachedInputTokens)}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">
                      {formatCompactMetric(row.requests)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </>
    );
  })();

  return (
    <PeriodPanelLayout
      period={period}
      onPeriodChange={setPeriod}
      isFetching={usageQuery.isFetching}
    >
      {content}
    </PeriodPanelLayout>
  );
}
