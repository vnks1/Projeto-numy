import { MongoClient, type Collection } from "mongodb";

type WaitlistEntry = {
  email: string;
  name: string | null;
  createdAt: Date;
  source: string;
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

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoIndexesEnsured: boolean | undefined;
}

let clientPromise: Promise<MongoClient>;

function getMongoClientPromise() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }

  return global._mongoClientPromise;
}

export async function getWaitlistCollection(): Promise<Collection<WaitlistEntry>> {
  clientPromise = getMongoClientPromise();
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB ?? "landing");
  const collection = db.collection<WaitlistEntry>(
    process.env.MONGODB_WAITLIST_COLLECTION ?? "waitlist"
  );
  if (!global._mongoIndexesEnsured) {
    await collection.createIndex({ email: 1 }, { unique: true });
    global._mongoIndexesEnsured = true;
  }
  return collection;
}
