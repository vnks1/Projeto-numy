import { NextResponse } from "next/server";
import { getConnectedUsersCollection } from "@/lib/mongodb";
import { maybeStoreConnectedUsersSnapshot } from "@/lib/connected-users-snapshot";
import { getAdminApiAuthErrorResponse } from "@/lib/admin-session";
import { type Period, PERIOD_MS, parsePeriod } from "@/lib/admin-period";

export const runtime = "nodejs";

export type ConnectedUsersAdminSnapshot = {
  period: Period;
  current: number;
  peak: number;
  average: number;
  timeline: { date: string; hour?: string; count: number }[];
};

async function fetchLiveCount(): Promise<number | null> {
  const url = process.env.NUMA_API_URL;
  const key = process.env.STATS_API_KEY;
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/api/stats/connected-users`, {
      headers: { "x-api-key": key },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.count ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const authError = await getAdminApiAuthErrorResponse();
  if (authError) return authError;

  try {
    const period = parsePeriod(request.url);
    const since = new Date(Date.now() - PERIOD_MS[period]);
    const collection = await getConnectedUsersCollection();

    const dateFormat = period === "24h" ? "%Y-%m-%d-%H" : "%Y-%m-%d";

    const snapshotFilter = { recordedAt: { $gte: since } };

    const [timelineResult, statsResult, latestSnapshot, liveCount] =
      await Promise.all([
        collection
          .aggregate<{ _id: string; count: number }>([
            { $match: snapshotFilter },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: dateFormat,
                    date: "$recordedAt",
                  },
                },
                count: { $avg: "$count" },
              },
            },
            { $sort: { _id: 1 } },
          ])
          .toArray(),

        collection
          .aggregate<{ peak: number; average: number }>([
            { $match: snapshotFilter },
            {
              $group: {
                _id: null,
                peak: { $max: "$count" },
                average: { $avg: "$count" },
              },
            },
          ])
          .toArray(),

        collection.findOne(
          {},
          { sort: { recordedAt: -1 }, projection: { count: 1 } },
        ),

        fetchLiveCount(),
      ]);

    const current = liveCount ?? latestSnapshot?.count ?? 0;

    // Persist a snapshot so the chart stays up-to-date (throttled to 5 min)
    if (liveCount != null) {
      void maybeStoreConnectedUsersSnapshot(collection, liveCount);
    }

    const stats = statsResult[0] ?? { peak: 0, average: 0 };

    const timeline = timelineResult.map((row) => {
      if (period === "24h") {
        const parts = row._id.split("-");
        const date = parts.slice(0, 3).join("-");
        const hour = parts[3];
        return { date, hour, count: Math.round(row.count) };
      }
      return { date: row._id, count: Math.round(row.count) };
    });

    const snapshot: ConnectedUsersAdminSnapshot = {
      period,
      current,
      peak: stats.peak,
      average: Math.round(stats.average),
      timeline,
    };

    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("ADMIN_CONNECTED_USERS_FETCH_ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to load connected users data",
        code: "ADMIN_CONNECTED_USERS_FETCH_ERROR",
      },
      { status: 500 },
    );
  }
}
