import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_SESSION_COOKIE_NAME,
  hasAdminAuthConfig,
  isAdminSessionTokenValid,
} from "@/lib/admin-auth";
import { AdminLoginForm } from "@/components/admin-login-form";

export const metadata: Metadata = {
  title: "Numa Admin | Login",
  description: "Acesso administrativo global da landing da Numa.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (isAdminSessionTokenValid(token)) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        {hasAdminAuthConfig() ? (
          <AdminLoginForm />
        ) : (
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-zinc-950">Admin não configurado</h1>
            <p className="text-sm text-zinc-600">
              Defina as variáveis `LANDING_ADMIN_PASSWORD` e `LANDING_ADMIN_SECRET` para ativar o
              login admin.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
