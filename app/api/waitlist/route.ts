import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getWaitlistCollection, type WaitlistEntry } from "@/lib/mongodb";
import { getWaitlistRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

type WaitlistPayload = Partial<
  Pick<WaitlistEntry, "email" | "name" | "onboarding" | "utm" | "referrer">
> & {
  website?: string | null;
};

const MAX_EMAIL_LENGTH = 254;
const MAX_NAME_LENGTH = 80;
const MAX_REFERRER_LENGTH = 500;
const MAX_UTM_LENGTH = 120;
const MAX_HONEYPOT_LENGTH = 120;
const MAX_ONBOARDING_FIELD_LENGTH = 120;

type WaitlistRateLimit = {
  limit: (key: string) => Promise<{ success: boolean }>;
};

type SanitizedWaitlistPayload = {
  email: string;
  name: string | null;
  website: string | null;
  onboarding: WaitlistPayload["onboarding"] | undefined;
  utm: WaitlistPayload["utm"] | undefined;
  referrer: string | null;
};

type PersistWaitlistInput = {
  email: string;
  name: string | null;
  onboarding: WaitlistPayload["onboarding"] | undefined;
  utm: WaitlistPayload["utm"] | undefined;
  referrer: string | null;
  ipHash: string | null;
};

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  if (value.includes(" ")) {
    return false;
  }

  const atIndex = value.indexOf("@");
  const hasSingleAt = atIndex > 0 && atIndex === value.lastIndexOf("@");
  if (!hasSingleAt) {
    return false;
  }

  const localPart = value.slice(0, atIndex);
  const domain = value.slice(atIndex + 1);
  if (!localPart || !domain || domain.startsWith(".") || domain.endsWith(".")) {
    return false;
  }

  if (domain.includes("..")) {
    return false;
  }

  const dotIndex = domain.lastIndexOf(".");
  return dotIndex > 0 && dotIndex < domain.length - 1;
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
    messageVolume: getOptionalString(
      input.messageVolume,
      MAX_ONBOARDING_FIELD_LENGTH,
    ),
    painPoint: getOptionalString(input.painPoint, MAX_ONBOARDING_FIELD_LENGTH),
    routineChannel: getOptionalString(
      input.routineChannel,
      MAX_ONBOARDING_FIELD_LENGTH,
    ),
    weeklyNotificationHours: getOptionalString(
      input.weeklyNotificationHours,
      MAX_ONBOARDING_FIELD_LENGTH,
    ),
  };

  const hasValue = Object.values(onboarding).some(Boolean);
  return hasValue ? onboarding : undefined;
}

function getClientIp(headers: Headers) {
  const cfIp = headers.get("cf-connecting-ip");
  const forwarded = headers.get("x-forwarded-for");
  const realIp = headers.get("x-real-ip");
  const ip =
    cfIp?.trim() || forwarded?.split(",")[0]?.trim() || realIp?.trim() || null;
  return ip;
}

function getIpHash(headers: Headers, salt: string) {
  const ip = getClientIp(headers);
  if (!ip) return null;
  return createHash("sha256").update(`${salt}${ip}`).digest("hex");
}

function isPayloadObject(value: unknown): value is WaitlistPayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function parsePayload(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!isPayloadObject(payload)) {
      return {
        response: NextResponse.json(
          { error: "Invalid payload" },
          { status: 400 },
        ),
      };
    }
    return { payload };
  } catch {
    return {
      response: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }),
    };
  }
}

function validateOrigin(headers: Headers) {
  const requestOrigin = headers.get("origin");
  const requestHost = headers.get("host");

  if (!requestOrigin || !requestHost) {
    return null;
  }

  try {
    const parsedOrigin = new URL(requestOrigin);
    if (parsedOrigin.host !== requestHost) {
      return NextResponse.json(
        { error: "Forbidden origin", code: "INVALID_ORIGIN" },
        { status: 403 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid origin", code: "INVALID_ORIGIN" },
      { status: 400 },
    );
  }

  return null;
}

function getValidatedEmail(
  payload: WaitlistPayload,
): { email: string } | { response: NextResponse } {
  const emailRaw = typeof payload.email === "string" ? payload.email : "";
  if (emailRaw.length > MAX_EMAIL_LENGTH) {
    return {
      response: NextResponse.json({ error: "Invalid email" }, { status: 400 }),
    };
  }

  const email = normalizeEmail(emailRaw);
  if (!email || !isValidEmail(email)) {
    return {
      response: NextResponse.json(
        { error: "Invalid email", code: "INVALID_EMAIL" },
        { status: 400 },
      ),
    };
  }

  return { email };
}

function sanitizePayload(
  payload: WaitlistPayload,
): SanitizedWaitlistPayload | { response: NextResponse } {
  const emailResult = getValidatedEmail(payload);
  if ("response" in emailResult) {
    return emailResult;
  }

  try {
    return {
      email: emailResult.email,
      name: getOptionalString(payload.name, MAX_NAME_LENGTH) ?? null,
      website: getOptionalString(payload.website, MAX_HONEYPOT_LENGTH) ?? null,
      onboarding: pickOnboarding(payload.onboarding),
      utm: pickUtm(payload.utm),
      referrer:
        getOptionalString(payload.referrer, MAX_REFERRER_LENGTH) ?? null,
    };
  } catch {
    return {
      response: NextResponse.json(
        { error: "Invalid payload", code: "INVALID_PAYLOAD" },
        { status: 400 },
      ),
    };
  }
}

function getIpSalt() {
  const ipSalt = process.env.IP_HASH_SALT;
  const isProd = process.env.NODE_ENV === "production";

  if (isProd && !ipSalt) {
    console.error("IP_HASH_SALT_MISSING");
    return {
      ipSalt,
      response: NextResponse.json(
        { error: "Server misconfigured", code: "IP_HASH_SALT_MISSING" },
        { status: 500 },
      ),
    };
  }

  return { ipSalt, response: null };
}

function getOptionalRatelimit(): WaitlistRateLimit | null {
  try {
    return getWaitlistRatelimit();
  } catch (error) {
    console.warn("RATE_LIMIT_DISABLED:", error);
    return null;
  }
}

async function enforceRateLimit(headers: Headers, ipHash: string | null) {
  const ratelimit = getOptionalRatelimit();
  if (!ratelimit) {
    return null;
  }

  const clientIp = getClientIp(headers);
  const rateKey = ipHash ?? clientIp ?? "unknown";
  const { success } = await ratelimit.limit(rateKey);

  if (!success) {
    return NextResponse.json(
      { error: "Rate limited", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  return null;
}

async function persistWaitlist(input: PersistWaitlistInput) {
  try {
    const collection = await getWaitlistCollection();

    const updateSet: Record<string, unknown> = {
      name: input.name,
      source: "waitlist",
      referrer: input.referrer,
      ipHash: input.ipHash,
    };

    if (input.utm) {
      updateSet.utm = input.utm;
    }

    if (input.onboarding) {
      updateSet.onboarding = input.onboarding;
    }

    await collection.updateOne(
      { email: input.email },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: updateSet,
      },
      { upsert: true },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database error";
    const isMissingUri = message.includes("MONGODB_URI");

    console.error("WAITLIST_DB_ERROR:", error);

    return NextResponse.json(
      {
        error: isMissingUri ? "Database not configured" : "Database error",
        code: isMissingUri ? "DB_NOT_CONFIGURED" : "DB_ERROR",
      },
      { status: 500 },
    );
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const payloadResult = await parsePayload(request);
    if ("response" in payloadResult) {
      return payloadResult.response;
    }

    const originError = validateOrigin(request.headers);
    if (originError) {
      return originError;
    }

    const sanitizedPayload = sanitizePayload(payloadResult.payload);
    if ("response" in sanitizedPayload) {
      return sanitizedPayload.response;
    }

    // Honeypot field expected to stay empty for legitimate users.
    if (sanitizedPayload.website) {
      return NextResponse.json({ status: "ok" });
    }

    const ipSaltResult = getIpSalt();
    if (ipSaltResult.response) {
      return ipSaltResult.response;
    }

    const ipHash = ipSaltResult.ipSalt
      ? getIpHash(request.headers, ipSaltResult.ipSalt)
      : null;

    const rateLimitError = await enforceRateLimit(request.headers, ipHash);
    if (rateLimitError) {
      return rateLimitError;
    }

    const persistError = await persistWaitlist({
      email: sanitizedPayload.email,
      name: sanitizedPayload.name,
      onboarding: sanitizedPayload.onboarding,
      utm: sanitizedPayload.utm,
      referrer: sanitizedPayload.referrer,
      ipHash,
    });
    if (persistError) {
      return persistError;
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("WAITLIST_ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "Internal error" },
      { status: 500 },
    );
  }
}
