import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let waitlistRatelimit: Ratelimit | null = null;

export function getWaitlistRatelimit() {
  if (waitlistRatelimit) {
    return waitlistRatelimit;
  }

  const redis = Redis.fromEnv();
  waitlistRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(5, "1 m"),
    prefix: "waitlist",
  });

  return waitlistRatelimit;
}
