import { MongoClient } from "mongodb";

const requiredVars = [
  "MONGODB_URI",
  "IP_HASH_SALT",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
];

function getMissingVars() {
  return requiredVars.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });
}

async function checkMongoConnection() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "landing";

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  await client.db(dbName).command({ ping: 1 });
  await client.close();
}

async function run() {
  const missingVars = getMissingVars();
  if (missingVars.length > 0) {
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Variáveis ausentes:", missingVars.join(", "));
    process.exit(1);
  }

  try {
    await checkMongoConnection();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("PROD_PREFLIGHT_FAILED");
    console.error("Falha na conexão com MongoDB:", message);
    process.exit(1);
  }

  console.log("PROD_PREFLIGHT_OK");
}

run();