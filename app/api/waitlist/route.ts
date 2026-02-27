import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getWaitlistCollection } from "@/lib/mongodb";
import { getWaitlistRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

type WaitlistPayload = {
  email?: string;
  name?: string | null;
  website?: string | null;
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

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;
const MAX_REFERRER_LENGTH = 500;
const MAX_UTM_LENGTH = 120;
const MAX_HONEYPOT_LENGTH = 120;
const MAX_ONBOARDING_FIELD_LENGTH = 120;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getOptionalString(input: unknown, maxLength: number) {
  if (typeof input !== "string") {
    return undefined;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length > maxLength) {
    throw new Error("PAYLOAD_TOO_LARGE");
  }

  return trimmed;
}

function pickUtm(input?: WaitlistPayload["utm"]) {
  if (!input) {
    return undefined;
  }

  const utm = {
    source: getOptionalString(input.source, MAX_UTM_LENGTH),
    medium: getOptionalString(input.medium, MAX_UTM_LENGTH),
    campaign: getOptionalString(input.campaign, MAX_UTM_LENGTH),
    term: getOptionalString(input.term, MAX_UTM_LENGTH),
    content: getOptionalString(input.content, MAX_UTM_LENGTH),
  };

  const hasValue = Object.values(utm).some(Boolean);
  return hasValue ? utm : undefined;
}

function pickOnboarding(input?: WaitlistPayload["onboarding"]) {
  if (!input) {
    return undefined;
  }

  const onboarding = {
    messageVolume: getOptionalString(input.messageVolume, MAX_ONBOARDING_FIELD_LENGTH),
    painPoint: getOptionalString(input.painPoint, MAX_ONBOARDING_FIELD_LENGTH),
    routineChannel: getOptionalString(input.routineChannel, MAX_ONBOARDING_FIELD_LENGTH),
    weeklyNotificationHours: getOptionalString(
      input.weeklyNotificationHours,
      MAX_ONBOARDING_FIELD_LENGTH
    ),
  };

  const hasValue = Object.values(onboarding).some(Boolean);
  return hasValue ? onboarding : undefined;
}

function getClientIp(headers: Headers) {
  const cfIp = headers.get("cf-connecting-ip");
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ip = cfIp?.trim() || forwarded?.split(",")[0]?.trim() || realIp?.trim() || null;
  return ip;
}

function getIpHash(headers: Headers, salt: string) {
  const ip = getClientIp(headers);
  if (!ip) return null;
  return createHash("sha256").update(`${salt}${ip}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    let payload: WaitlistPayload;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    console.log("BODY RECEIVED:", payload);

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const requestOrigin = request.headers.get("origin");
    const requestHost = request.headers.get("host");
    if (requestOrigin && requestHost) {
      try {
        const parsedOrigin = new URL(requestOrigin);
        if (parsedOrigin.host !== requestHost) {
          return NextResponse.json(
            { error: "Forbidden origin", code: "INVALID_ORIGIN" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json({ error: "Invalid origin", code: "INVALID_ORIGIN" }, { status: 400 });
      }
    }

    const emailRaw = typeof payload.email === "string" ? payload.email : "";

    if (emailRaw.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const email = normalizeEmail(emailRaw);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email", code: "INVALID_EMAIL" }, { status: 400 });
    }

    let name: string | null = null;
    let website: string | null = null;
    let utm: WaitlistPayload["utm"] | undefined;
    let onboarding: WaitlistPayload["onboarding"] | undefined;
    let referrer: string | null = null;

    try {
      name = getOptionalString(payload.name, MAX_NAME_LENGTH) ?? null;
      website = getOptionalString(payload.website, MAX_HONEYPOT_LENGTH) ?? null;
      utm = pickUtm(payload.utm);
      onboarding = pickOnboarding(payload.onboarding);
      referrer = getOptionalString(payload.referrer, MAX_REFERRER_LENGTH) ?? null;
    } catch {
      return NextResponse.json({ error: "Invalid payload", code: "INVALID_PAYLOAD" }, { status: 400 });
    }

    // Honeypot field expected to stay empty for legitimate users.
    if (website) {
      return NextResponse.json({ status: "ok" });
    }

    const isProd = process.env.NODE_ENV === "production";
    const ipSalt = process.env.IP_HASH_SALT;

    if (isProd && !ipSalt) {
      console.error("IP_HASH_SALT_MISSING");
      return NextResponse.json(
        { error: "Server misconfigured", code: "IP_HASH_SALT_MISSING" },
        { status: 500 }
      );
    }

    const clientIp = getClientIp(request.headers);
    const ipHash = ipSalt ? getIpHash(request.headers, ipSalt) : null;

    // ✅ Option B: Rate limit is OPTIONAL. If not configured, it is disabled (no 500).
    let ratelimit: null | { limit: (key: string) => Promise<{ success: boolean }> } = null;

    try {
      ratelimit = getWaitlistRatelimit();
    } catch (err) {
      console.warn("RATE_LIMIT_DISABLED:", err);
      ratelimit = null;
    }

    if (ratelimit) {
      const rateKey = ipHash ?? clientIp ?? "unknown";
      const { success } = await ratelimit.limit(rateKey);
      if (!success) {
        return NextResponse.json({ error: "Rate limited", code: "RATE_LIMITED" }, { status: 429 });
      }
    }

    try {
      const collection = await getWaitlistCollection();

      const updateSet: Record<string, unknown> = {
        name,
        source: "waitlist",
        referrer,
        ipHash,
      };

      if (utm) updateSet.utm = utm;
      if (onboarding) updateSet.onboarding = onboarding;

      await collection.updateOne(
        { email },
        {
          $setOnInsert: { createdAt: new Date() },
          $set: updateSet,
        },
        { upsert: true }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Database error";
      const isMissingUri = typeof message === "string" && message.includes("MONGODB_URI");

      console.error("WAITLIST_DB_ERROR:", error);

      return NextResponse.json(
        {
          error: isMissingUri ? "Database not configured" : "Database error",
          code: isMissingUri ? "DB_NOT_CONFIGURED" : "DB_ERROR",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("WAITLIST_ERROR:", err);
    return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}