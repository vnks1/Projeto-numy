import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getWaitlistCollection } from "@/lib/mongodb";
import { getWaitlistRatelimit } from "@/lib/ratelimit";

type WaitlistPayload = {
  email?: string;
  name?: string | null;
  turnstileToken?: string;
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

const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "icloud.com",
  "hotmail.com",
  "outlook.com",
]);

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAllowedEmailDomain(email: string) {
  const domain = email.split("@")[1]?.toLowerCase();
  return Boolean(domain && ALLOWED_EMAIL_DOMAINS.has(domain));
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

function getClientIp(headers: Headers) {
  const cfIp = headers.get("cf-connecting-ip");
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ip =
    cfIp?.trim() ||
    forwarded?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    null;
  return ip;
}

function getIpHash(headers: Headers, salt: string) {
  const ip = getClientIp(headers);
  if (!ip) {
    return null;
  }

  return createHash("sha256").update(`${salt}${ip}`).digest("hex");
}

async function verifyTurnstile(token: string, ip: string | null) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing TURNSTILE_SECRET_KEY");
  }

  const form = new URLSearchParams();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) {
    form.append("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: false };
  }

  return response.json() as Promise<{ success: boolean }>;
}

export async function POST(request: Request) {
  let payload: WaitlistPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const emailRaw = typeof payload.email === "string" ? payload.email : "";

  if (emailRaw.length > MAX_EMAIL_LENGTH) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const email = normalizeEmail(emailRaw);

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email", code: "INVALID_EMAIL" }, { status: 400 });
  }

  if (!isAllowedEmailDomain(email)) {
    return NextResponse.json(
      { error: "Esse tipo de E-mail não é permitido", code: "INVALID_EMAIL_DOMAIN" },
      { status: 400 }
    );
  }

  let name: string | null = null;
  let utm: WaitlistPayload["utm"] | undefined;
  let referrer: string | null = null;

  try {
    name = getOptionalString(payload.name, MAX_NAME_LENGTH) ?? null;
    utm = pickUtm(payload.utm);
    referrer = getOptionalString(payload.referrer, MAX_REFERRER_LENGTH) ?? null;
  } catch {
    return NextResponse.json({ error: "Invalid payload", code: "INVALID_PAYLOAD" }, { status: 400 });
  }

  const isProd = process.env.NODE_ENV === "production";
  const ipSalt = process.env.IP_HASH_SALT;
  if (isProd && !ipSalt) {
    return NextResponse.json(
      { error: "Server misconfigured", code: "IP_HASH_SALT_MISSING" },
      { status: 500 }
    );
  }

  const clientIp = getClientIp(request.headers);
  const ipHash = ipSalt ? getIpHash(request.headers, ipSalt) : null;

  let ratelimit = null;
  try {
    ratelimit = getWaitlistRatelimit();
  } catch {
    return NextResponse.json(
      { error: "Server misconfigured", code: "RATE_LIMIT_NOT_CONFIGURED" },
      { status: 500 }
    );
  }

  if (ratelimit) {
    const rateKey = ipHash ?? clientIp ?? "unknown";
    const { success } = await ratelimit.limit(rateKey);
    if (!success) {
      return NextResponse.json({ error: "Rate limited", code: "RATE_LIMITED" }, { status: 429 });
    }
  }

  const turnstileToken = typeof payload.turnstileToken === "string" ? payload.turnstileToken : "";
  if (!turnstileToken) {
    return NextResponse.json(
      { error: "Bot verification failed", code: "BOT_VERIFICATION_FAILED" },
      { status: 400 }
    );
  }

  try {
    const verification = await verifyTurnstile(turnstileToken, clientIp);
    if (!verification.success) {
      return NextResponse.json(
        { error: "Bot verification failed", code: "BOT_VERIFICATION_FAILED" },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Turnstile error";
    const isMissingSecret = message.includes("TURNSTILE_SECRET_KEY");
    return NextResponse.json(
      {
        error: isMissingSecret ? "Server misconfigured" : "Bot verification failed",
        code: isMissingSecret ? "TURNSTILE_SECRET_MISSING" : "BOT_VERIFICATION_FAILED",
      },
      { status: isMissingSecret ? 500 : 400 }
    );
  }

  try {
    const collection = await getWaitlistCollection();
    const updateSet: Record<string, unknown> = {
      name,
      source: "waitlist",
      referrer,
      ipHash,
    };

    if (utm) {
      updateSet.utm = utm;
    }

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
    const isMissingUri = message.includes("MONGODB_URI");
    return NextResponse.json(
      {
        error: isMissingUri ? "Database not configured" : "Database error",
        code: isMissingUri ? "DB_NOT_CONFIGURED" : "DB_ERROR",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" });
}
