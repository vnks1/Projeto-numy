import { NextResponse } from "next/server";
import { getAnalyticsCollection } from "@/lib/mongodb";
import { getAdminApiAuthErrorResponse } from "@/lib/admin-session";
import { type Period, PERIOD_MS, parsePeriod } from "@/lib/admin-period";

export const runtime = "nodejs";

export type AnalyticsSnapshot = {
  period: Period;
  summary: {
    pageViews: number;
    visitors: number;
    sessions: number;
  };
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; count: number }[];
  topCountries: { country: string; count: number }[];
  topDevices: { deviceType: string; count: number }[];
  topBrowsers: { browser: string; count: number }[];
  daily: { date: string; pageViews: number; visitors: number }[];
};

export async function GET(request: Request) {
  const authError = await getAdminApiAuthErrorResponse();
  if (authError) {
    return authError;
  }

  try {
    const period = parsePeriod(request.url);
    const since = new Date(Date.now() - PERIOD_MS[period]);
    const collection = await getAnalyticsCollection();

    const baseMatch = {
      eventType: "pageview" as const,
      timestamp: { $gte: since },
    };

    const [
      summaryResult,
      topPages,
      topReferrers,
      topCountries,
      topDevices,
      topBrowsers,
      daily,
    ] = await Promise.all([
      collection
        .aggregate<{ pageViews: number; visitors: number; sessions: number }>([
          { $match: baseMatch },
          {
            $group: {
              _id: null,
              pageViews: { $sum: 1 },
              visitors: { $addToSet: "$deviceId" },
              sessions: { $addToSet: "$sessionId" },
            },
          },
          {
            $project: {
              _id: 0,
              pageViews: 1,
              visitors: { $size: "$visitors" },
              sessions: { $size: "$sessions" },
            },
          },
        ])
        .toArray(),

      collection
        .aggregate<{
          path: string;
          views: number;
        }>([
          { $match: baseMatch },
          { $group: { _id: "$path", views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, path: "$_id", views: 1 } },
        ])
        .toArray(),

      collection
        .aggregate<{
          referrer: string;
          count: number;
        }>([
          { $match: { ...baseMatch, referrer: { $exists: true, $ne: "" } } },
          { $group: { _id: "$referrer", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, referrer: "$_id", count: 1 } },
        ])
        .toArray(),

      collection
        .aggregate<{
          country: string;
          count: number;
        }>([
          { $match: { ...baseMatch, country: { $exists: true, $ne: "" } } },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, country: "$_id", count: 1 } },
        ])
        .toArray(),

      collection
        .aggregate<{
          deviceType: string;
          count: number;
        }>([
          { $match: { ...baseMatch, deviceType: { $exists: true, $ne: "" } } },
          { $group: { _id: "$deviceType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, deviceType: "$_id", count: 1 } },
        ])
        .toArray(),

      collection
        .aggregate<{
          browser: string;
          count: number;
        }>([
          { $match: { ...baseMatch, clientName: { $exists: true, $ne: "" } } },
          { $group: { _id: "$clientName", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
          { $project: { _id: 0, browser: "$_id", count: 1 } },
        ])
        .toArray(),

      collection
        .aggregate<{ date: string; pageViews: number; visitors: number }>([
          { $match: baseMatch },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              pageViews: { $sum: 1 },
              visitors: { $addToSet: "$deviceId" },
            },
          },
          {
            $project: {
              _id: 0,
              date: "$_id",
              pageViews: 1,
              visitors: { $size: "$visitors" },
            },
          },
          { $sort: { date: 1 } },
        ])
        .toArray(),
    ]);

    const summary = summaryResult[0] ?? {
      pageViews: 0,
      visitors: 0,
      sessions: 0,
    };

    const snapshot: AnalyticsSnapshot = {
      period,
      summary,
      topPages,
      topReferrers,
      topCountries,
      topDevices,
      topBrowsers,
      daily,
    };

    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("ADMIN_ANALYTICS_FETCH_ERROR:", error);
    return NextResponse.json(
      {
        error: "Failed to load analytics data",
        code: "ADMIN_ANALYTICS_FETCH_ERROR",
      },
      { status: 500 },
    );
  }
}
