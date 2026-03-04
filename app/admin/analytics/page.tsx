import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { AnalyticsPanel } from "@/components/admin/analytics-panel";
import { requireAdminPageSession } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics - Numa Admin",
  description: "Web Analytics da landing.",
  robots: { index: false, follow: false },
};

export default async function AdminAnalyticsPage() {
  await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
        <AdminNav />
        <AnalyticsPanel />
      </div>
    </main>
  );
}
