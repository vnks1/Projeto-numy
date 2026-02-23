import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const isProd = process.env.NODE_ENV === "production";
const hasUpstashConfig =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let waitlistRatelimit: Ratelimit | null = null;

export function getWaitlistRatelimit() {
  if (waitlistRatelimit) {
    return waitlistRatelimit;
  }

  if (!hasUpstashConfig) {
    if (isProd) {
      throw new Error("Missing Upstash Redis configuration");
    }
    return null;
  }

  const redis = Redis.fromEnv();
  waitlistRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
    prefix: "waitlist",
    analytics: true,
  });

  return waitlistRatelimit;
}
