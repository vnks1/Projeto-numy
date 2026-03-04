import { NextResponse } from "next/server";
import { getAdminDashboardSnapshot } from "@/lib/admin-dashboard-data";
import { getAdminApiAuthErrorResponse } from "@/lib/admin-session";

export const runtime = "nodejs";

function parseLimit(url: string) {
  const limitRaw = new URL(url).searchParams.get("limit");
  const parsed = Number(limitRaw);
  if (!Number.isInteger(parsed)) {
    return 150;
  }
  return Math.max(1, Math.min(parsed, 500));
}

export async function GET(request: Request) {
  const authError = await getAdminApiAuthErrorResponse();
  if (authError) {
    return authError;
  }

  try {
    const snapshot = await getAdminDashboardSnapshot(parseLimit(request.url));
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("ADMIN_DASHBOARD_FETCH_ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
        code: "ADMIN_DASHBOARD_FETCH_ERROR",
      },
      { status: 500 },
    );
  }
}
