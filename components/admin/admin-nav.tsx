"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { logoutAdminAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Waitlist" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/connected-users", label: "Conectados" },
  { href: "/admin/openai-usage", label: "OpenAI Usage" },
] as const;

async function fetchConnectedUsers() {
  const res = await fetch("/api/stats/connected-users", { cache: "no-store" });
  if (!res.ok) return 0;
  const data = await res.json();
  return (data.count as number) ?? 0;
}

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: logoutAdminAction,
    onSuccess: () => {
      router.replace("/admin/login");
      router.refresh();
    },
  });

  const connectedQuery = useQuery({
    queryKey: ["connected-users"],
    queryFn: fetchConnectedUsers,
    refetchInterval: 15_000,
  });

  const connectedUsers = connectedQuery.data ?? null;

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <nav className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm">
          {LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-zinc-950 text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {connectedUsers != null && connectedUsers > 0 && (
          <span className="flex items-center gap-2 text-sm text-zinc-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <span className="font-semibold text-zinc-900">
              {connectedUsers}
            </span>{" "}
            {connectedUsers === 1 ? "conectado" : "conectados"}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="h-10 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        {logoutMutation.isPending ? "Saindo..." : "Sair"}
      </button>
    </header>
  );
}
