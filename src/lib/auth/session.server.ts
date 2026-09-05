// Signed session cookie helpers. No JWT dependency needed — this is a small
// HMAC-signed payload, which is enough for a single first-party cookie.

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "kkm_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const SECRET = process.env.SESSION_SECRET || "dev-insecure-secret-change-me";

if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
  console.warn(
    "[auth] SESSION_SECRET is not set — using an insecure default. Set it in your production environment.",
  );
}

export type SessionPayload = {
  uid: string;
  role: "teacher" | "student";
  regNo: string;
  name?: string;
};

function sign(value: string): string {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

export function createSessionToken(payload: SessionPayload): string {
  const json = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${json}.${sign(json)}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [json, signature] = token.split(".");
  if (!json || !signature) return null;

  const expected = sign(json);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    return JSON.parse(Buffer.from(json, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}
