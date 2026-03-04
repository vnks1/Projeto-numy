"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSessionToken,
  hasAdminAuthConfig,
  verifyAdminPassword,
} from "@/lib/admin-auth";

type LoginAdminActionResult =
  | { ok: true }
  | {
      ok: false;
      code: "ADMIN_AUTH_NOT_CONFIGURED" | "INVALID_CREDENTIALS";
    };

const MAX_PASSWORD_LENGTH = 256;

export async function loginAdminAction(password: string): Promise<LoginAdminActionResult> {
  if (!hasAdminAuthConfig()) {
    return { ok: false, code: "ADMIN_AUTH_NOT_CONFIGURED" };
  }

  if (!password || password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }

  if (!verifyAdminPassword(password)) {
    return { ok: false, code: "INVALID_CREDENTIALS" };
  }

  const token = createAdminSessionToken();
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  revalidatePath("/admin");
  return { ok: true };
}

export async function logoutAdminAction(): Promise<{ ok: true }> {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ADMIN_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  revalidatePath("/admin");
  return { ok: true };
}
