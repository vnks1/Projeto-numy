import { MongoClient } from "mongodb";
import { Redis } from "@upstash/redis";

const requiredVars = [
  "MONGODB_URI",
  "IP_HASH_SALT",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

const IP_HASH_SALT_MIN_LENGTH = 32;

function getMissingVars() {
  return requiredVars.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });
}

function validateIpHashSalt() {
  const salt = process.env.IP_HASH_SALT ?? "";
  if (salt.length < IP_HASH_SALT_MIN_LENGTH) {
    throw new Error(`IP_HASH_SALT must have at least ${IP_HASH_SALT_MIN_LENGTH} characters`);
  }
}

function validateUpstashUrl() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("UPSTASH_REDIS_REST_URL is not a valid URL");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("UPSTASH_REDIS_REST_URL must use https");
  }
}

async function checkMongoConnection() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "landing";

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  await client.close();
}

async function checkUpstashConnection() {
  const redis = Redis.fromEnv();
  const result = await redis.ping();
  if (typeof result !== "string" || result.toUpperCase() !== "PONG") {
    throw new Error(`Unexpected Upstash ping result: ${String(result)}`);
  }
}

async function run() {
  const missingVars = getMissingVars();
  if (missingVars.length > 0) {
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Missing environment variables:", missingVars.join(", "));
    process.exit(1);
  }

  try {
    validateIpHashSalt();
    validateUpstashUrl();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Invalid environment config:", message);
    process.exit(1);
  }

  try {
    await checkMongoConnection();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Failed MongoDB connection:", message);
    process.exit(1);
  }

  try {
    await checkUpstashConnection();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Failed Upstash connection:", message);
    process.exit(1);
  }

  console.log("PROD_PREFLIGHT_OK");
  console.log("Using MONGODB_DB:", process.env.MONGODB_DB || "landing (default)");
  console.log(
    "Using MONGODB_WAITLIST_COLLECTION:",
    process.env.MONGODB_WAITLIST_COLLECTION || "waitlist (default)"
  );
}

run();
