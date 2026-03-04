import { MongoClient, type Collection, type MongoClientOptions } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

export type WaitlistEntry = {
  email: string;
  name: string | null;
  createdAt: Date;
  source: string;
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
  ipHash?: string | null;
};

export type ConnectedUsersSnapshot = {
  count: number;
  recordedAt: Date;
};

export type AnalyticsEvent = {
  eventType: "pageview" | "event";
  eventName?: string;
  eventData?: string;
  timestamp: Date;
  sessionId?: number;
  deviceId?: number;
  path: string;
  origin?: string;
  referrer?: string;
  queryParams?: string;
  route?: string;
  country?: string;
  city?: string;
  osName?: string;
  clientName?: string;
  deviceType?: string;
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoIndexesEnsured: boolean | undefined;
  var _analyticsIndexesEnsured: boolean | undefined;
  var _connectedUsersIndexesEnsured: boolean | undefined;
}

let clientPromise: Promise<MongoClient>;
const mongoClientOptions: MongoClientOptions = {
  appName: "numa.landing.vercel",
  maxIdleTimeMS: 5000,
};

function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, mongoClientOptions);
    // Ensure Vercel can clean up suspended function connections.
    attachDatabasePool(client);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function getWaitlistCollection(): Promise<
  Collection<WaitlistEntry>
> {
  clientPromise = getMongoClientPromise();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB ?? "landing");
  const collection = db.collection<WaitlistEntry>(
    process.env.MONGODB_WAITLIST_COLLECTION ?? "waitlist",
  );
  if (!global._mongoIndexesEnsured) {
    await collection.createIndex({ email: 1 }, { unique: true });
    global._mongoIndexesEnsured = true;
  }
  return collection;
}

export async function getAnalyticsCollection(): Promise<
  Collection<AnalyticsEvent>
> {
  clientPromise = getMongoClientPromise();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB ?? "landing");
  const collection = db.collection<AnalyticsEvent>("analytics_events");
  if (!global._analyticsIndexesEnsured) {
    await Promise.all([
      collection.createIndex({ timestamp: -1 }),
      collection.createIndex({ eventType: 1, timestamp: -1 }),
      collection.createIndex({ path: 1, timestamp: -1 }),
    ]);
    global._analyticsIndexesEnsured = true;
  }
  return collection;
}

export async function getConnectedUsersCollection(): Promise<
  Collection<ConnectedUsersSnapshot>
> {
  clientPromise = getMongoClientPromise();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB ?? "landing");
  const collection = db.collection<ConnectedUsersSnapshot>(
    "connected_users_snapshots",
  );
  if (!global._connectedUsersIndexesEnsured) {
    await collection.createIndex({ recordedAt: -1 });
    global._connectedUsersIndexesEnsured = true;
  }
  return collection;
}
