import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

function toBase64Url(bytes: ArrayBuffer) {
  const bin = String.fromCharCode(...new Uint8Array(bytes));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacSign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(signature);
}

export async function createSessionToken(email: string) {
  const payload = JSON.stringify({ email, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = toBase64Url(new TextEncoder().encode(payload).buffer as ArrayBuffer);
  const signature = await hmacSign(encoded);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<{ email: string } | null> {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = await hmacSign(encoded);
  if (signature !== expected) return null;
  try {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(binary);
    if (payload.exp < Date.now()) return null;
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setAdminSessionCookie(email: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, await createSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export { COOKIE_NAME };
