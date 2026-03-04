import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  hasAdminAuthConfig,
  isAdminSessionTokenValid,
} from "@/lib/admin-auth";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard-data";
import { AdminDashboard } from "@/components/admin-dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Numa Admin",
  description: "Painel administrativo global da landing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPage() {
  if (!hasAdminAuthConfig()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-zinc-950">Admin não configurado</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Defina `LANDING_ADMIN_PASSWORD` e `LANDING_ADMIN_SECRET` no ambiente para liberar o
            acesso.
          </p>
        </div>
      </main>
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!isAdminSessionTokenValid(token)) {
    redirect("/admin/login");
  }

  const snapshot = await getAdminDashboardSnapshot(200);

  return (
    <main className="min-h-screen bg-zinc-50">
      <AdminDashboard initialData={snapshot} />
    </main>
  );
}
