import { NextResponse } from "next/server";
import { getConnectedUsersCollection } from "@/lib/mongodb";
import { maybeStoreConnectedUsersSnapshot } from "@/lib/connected-users-snapshot";

const NUMA_API_URL = process.env.NUMA_API_URL;
const STATS_API_KEY = process.env.STATS_API_KEY;

export async function GET() {
  if (!NUMA_API_URL || !STATS_API_KEY) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const res = await fetch(`${NUMA_API_URL}/api/stats/connected-users`, {
      headers: { "x-api-key": STATS_API_KEY },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      return NextResponse.json({ count: 0 });
    }

    const data = await res.json();
    const count: number = data.count ?? 0;
    const collection = await getConnectedUsersCollection();

    void maybeStoreConnectedUsersSnapshot(collection, count);

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
