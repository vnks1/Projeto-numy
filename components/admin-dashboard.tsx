"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { AdminDashboardSnapshot } from "@/lib/admin-dashboard-data";
import { AdminNav } from "./admin/admin-nav";
import { WaitlistTab } from "./admin/waitlist-tab";

type Props = {
  initialData: AdminDashboardSnapshot;
};

async function fetchDashboardData(limit: number) {
  const response = await fetch(`/api/admin/dashboard?limit=${limit}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.code ?? "ADMIN_DASHBOARD_FETCH_ERROR");
  }

  return (await response.json()) as AdminDashboardSnapshot;
}

function getErrorCode(error: unknown) {
  return error instanceof Error ? error.message : "ADMIN_DASHBOARD_FETCH_ERROR";
}

export function AdminDashboard({ initialData }: Props) {
  const router = useRouter();
  const limit = initialData.entries.length || 150;

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard", limit],
    queryFn: () => fetchDashboardData(limit),
    initialData,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  });

  const errorCode = dashboardQuery.isError
    ? getErrorCode(dashboardQuery.error)
    : "";
  const errorMessage =
    dashboardQuery.isError && errorCode !== "UNAUTHORIZED"
      ? "Não foi possível atualizar os dados agora."
      : "";

  useEffect(() => {
    if (errorCode === "UNAUTHORIZED") {
      router.replace("/admin/login");
      router.refresh();
    }
  }, [errorCode, router]);

  const data = dashboardQuery.data;
  if (!data) return null;

  const handleRefresh = () => {
    dashboardQuery.refetch().catch(() => undefined);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between gap-4">
        <AdminNav />
        <button
          type="button"
          onClick={handleRefresh}
          disabled={dashboardQuery.isFetching}
          className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {dashboardQuery.isFetching ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      <WaitlistTab
        initialData={data}
        isFetching={dashboardQuery.isFetching}
        errorMessage={errorMessage}
      />
    </div>
  );
}
