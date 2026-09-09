"use server";

import { redirect } from "next/navigation";
import { setAdminSessionCookie, clearAdminSessionCookie } from "@/lib/session";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function loginAdmin(email: string, password: string): Promise<LoginResult> {
  const validEmail = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return { ok: false, error: "Admin credentials are not configured." };
  }

  if (email.trim().toLowerCase() !== validEmail.toLowerCase() || password !== validPassword) {
    return { ok: false, error: "Invalid email or password." };
  }

  await setAdminSessionCookie(validEmail);
  return { ok: true };
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
