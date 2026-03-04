import type { WithId } from "mongodb";
import { getWaitlistCollection, type WaitlistEntry } from "@/lib/mongodb";

export type AdminLeadEntry = {
  id: string;
  email: string;
  name: string | null;
  source: string;
  createdAt: string | null;
  onboarding?: {
    messageVolume?: string;
    painPoint?: string;
    routineChannel?: string;
    weeklyNotificationHours?: string;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
  referrer?: string | null;
};

export type AdminDashboardSnapshot = {
  summary: {
    total: number;
    last24Hours: number;
    last7Days: number;
  };
  entries: AdminLeadEntry[];
};

function serializeEntry(entry: WithId<WaitlistEntry>): AdminLeadEntry {
  return {
    id: entry._id.toString(),
    email: entry.email,
    name: entry.name,
    source: entry.source,
    createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : null,
    onboarding: entry.onboarding,
    utm: entry.utm,
    referrer: entry.referrer ?? null,
  };
}

export async function getAdminDashboardSnapshot(limit = 150): Promise<AdminDashboardSnapshot> {
  const collection = await getWaitlistCollection();
  const now = Date.now();
  const twentyFourHoursAgo = new Date(now - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

  const [total, last24Hours, last7Days, entries] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ createdAt: { $gte: twentyFourHoursAgo } }),
    collection.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    collection.find({}).sort({ createdAt: -1 }).limit(limit).toArray(),
  ]);

  return {
    summary: {
      total,
      last24Hours,
      last7Days,
    },
    entries: entries.map(serializeEntry),
  };
}
