import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { OpenAIUsagePanel } from "@/components/admin/openai-usage-panel";
import { requireAdminPageSession } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "OpenAI Usage - Numa Admin",
  description: "Uso de tokens e custos da OpenAI via API.",
  robots: { index: false, follow: false },
};

export default async function AdminOpenAIUsagePage() {
  await requireAdminPageSession();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8">
        <AdminNav />
        <OpenAIUsagePanel />
      </div>
    </main>
  );
}
