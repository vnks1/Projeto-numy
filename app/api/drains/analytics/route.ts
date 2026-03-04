import crypto from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getAnalyticsCollection, type AnalyticsEvent } from "@/lib/mongodb";

export const runtime = "nodejs";

type VercelAnalyticsPayload = {
  schema?: string;
  eventType?: string;
  eventName?: string;
  eventData?: string;
  timestamp?: number;
  sessionId?: number;
  deviceId?: number;
  origin?: string;
  path?: string;
  referrer?: string;
  queryParams?: string;
  route?: string;
  country?: string;
  city?: string;
  osName?: string;
  clientName?: string;
  deviceType?: string;
};

function verifySignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha1", secret)
    .update(body, "utf-8")
    .digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

type OptionalStringEventField =
  | "eventName"
  | "eventData"
  | "origin"
  | "referrer"
  | "queryParams"
  | "route"
  | "country"
  | "city"
  | "osName"
  | "clientName"
  | "deviceType";

function parseEventType(
  value: string | undefined,
): AnalyticsEvent["eventType"] | null {
  if (value === "pageview" || value === "event") {
    return value;
  }
  return null;
}

function setOptionalStringField(
  doc: AnalyticsEvent,
  field: OptionalStringEventField,
  value: string | undefined,
) {
  if (!value) {
    return;
  }
  doc[field] = value;
}

function toDoc(raw: VercelAnalyticsPayload): AnalyticsEvent | null {
  const eventType = parseEventType(raw.eventType);
  if (!eventType) return null;
  if (!raw.path) return null;

  const doc: AnalyticsEvent = {
    eventType,
    timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
    path: raw.path,
  };

  const optionalFields: {
    field: OptionalStringEventField;
    value: string | undefined;
  }[] = [
    { field: "eventName", value: raw.eventName },
    { field: "eventData", value: raw.eventData },
    { field: "origin", value: raw.origin },
    { field: "referrer", value: raw.referrer },
    { field: "queryParams", value: raw.queryParams },
    { field: "route", value: raw.route },
    { field: "country", value: raw.country },
    { field: "city", value: raw.city },
    { field: "osName", value: raw.osName },
    { field: "clientName", value: raw.clientName },
    { field: "deviceType", value: raw.deviceType },
  ];

  for (const optionalField of optionalFields) {
    setOptionalStringField(doc, optionalField.field, optionalField.value);
  }

  if (raw.sessionId != null) {
    doc.sessionId = raw.sessionId;
  }

  if (raw.deviceId != null) {
    doc.deviceId = raw.deviceId;
  }

  return doc;
}

export async function POST(request: NextRequest) {
  const secret = process.env.VERCEL_ANALYTICS_DRAIN_SECRET;
  if (!secret) {
    return NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-vercel-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ code: "INVALID_SIGNATURE" }, { status: 403 });
  }

  let payload: VercelAnalyticsPayload[];
  try {
    const parsed: unknown = JSON.parse(rawBody);
    payload = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ code: "INVALID_BODY" }, { status: 400 });
  }

  const docs = payload
    .map(toDoc)
    .filter((d): d is AnalyticsEvent => d !== null);

  if (docs.length > 0) {
    const collection = await getAnalyticsCollection();
    await collection.insertMany(docs, { ordered: false });
  }

  return NextResponse.json({ success: true, inserted: docs.length });
}
