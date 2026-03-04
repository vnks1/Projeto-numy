import type { Collection } from "mongodb";
import type { ConnectedUsersSnapshot } from "./mongodb";

const SNAPSHOT_INTERVAL_MS = 5 * 60_000; // 5 minutes

/**
 * Insert a snapshot if enough time has passed since the last one.
 * Checks MongoDB for the latest `recordedAt` instead of relying on
 * in-memory globals (which don't survive serverless cold starts).
 */
export async function maybeStoreConnectedUsersSnapshot(
  collection: Collection<ConnectedUsersSnapshot>,
  count: number,
) {
  try {
    const latest = await collection.findOne(
      {},
      { sort: { recordedAt: -1 }, projection: { recordedAt: 1 } },
    );

    const lastAt = latest?.recordedAt?.getTime() ?? 0;
    if (Date.now() - lastAt < SNAPSHOT_INTERVAL_MS) return;

    await collection.insertOne({ count, recordedAt: new Date() });
  } catch (error) {
    console.error("CONNECTED_USERS_SNAPSHOT_ERROR:", error);
  }
}
