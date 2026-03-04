import { createHash, createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE_NAME = "numa_landing_admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

function getAdminPassword() {
  return process.env.LANDING_ADMIN_PASSWORD;
}

function getAdminSecret() {
  return process.env.LANDING_ADMIN_SECRET;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(a: string, b: string) {
  return timingSafeEqual(digest(a), digest(b));
}

export function hasAdminAuthConfig() {
  const password = getAdminPassword();
  const secret = getAdminSecret();
  return Boolean(password && secret);
}

export function verifyAdminPassword(candidate: string) {
  const expected = getAdminPassword();
  if (!expected) {
    return false;
  }
  return safeEqual(candidate, expected);
}

function signExpiration(expirationUnixSeconds: string, secret: string) {
  return createHmac("sha256", secret)
    .update(expirationUnixSeconds)
    .digest("hex");
}

export function createAdminSessionToken(now = Date.now()) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("MISSING_LANDING_ADMIN_SECRET");
  }

  const expiration = String(Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS);
  const signature = signExpiration(expiration, secret);
  return `${expiration}.${signature}`;
}

export function isAdminSessionTokenValid(
  token: string | null | undefined,
  now = Date.now(),
) {
  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }

  if (!token) {
    return false;
  }

  const [expiration, signature] = token.split(".");

  if (!expiration || !signature || !/^\d+$/.test(expiration)) {
    return false;
  }

  if (Number(expiration) <= Math.floor(now / 1000)) {
    return false;
  }

  const expectedSignature = signExpiration(expiration, secret);
  return safeEqual(signature, expectedSignature);
}
