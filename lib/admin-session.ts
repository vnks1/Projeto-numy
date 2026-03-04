import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  hasAdminAuthConfig,
  isAdminSessionTokenValid,
} from "@/lib/admin-auth";

export async function getAdminApiAuthErrorResponse() {
  if (!hasAdminAuthConfig()) {
    return NextResponse.json(
      { error: "Admin auth not configured", code: "ADMIN_AUTH_NOT_CONFIGURED" },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!isAdminSessionTokenValid(token)) {
    return NextResponse.json(
      { error: "Unauthorized", code: "UNAUTHORIZED" },
      { status: 401 },
    );
  }

  return null;
}

export async function requireAdminPageSession() {
  if (!hasAdminAuthConfig()) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!isAdminSessionTokenValid(token)) {
    redirect("/admin/login");
  }
}
