// Password hashing for the "date of birth as password" login. Uses Node's
// built-in scrypt so no extra native dependency (e.g. bcrypt) is required.

import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(plainText: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plainText, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plainText: string, stored: string | undefined | null): boolean {
  if (!stored) return false;
  const [salt, derivedHex] = stored.split(":");
  if (!salt || !derivedHex) return false;
  const derivedBuffer = Buffer.from(derivedHex, "hex");
  const testBuffer = scryptSync(plainText, salt, KEY_LENGTH);
  return derivedBuffer.length === testBuffer.length && timingSafeEqual(derivedBuffer, testBuffer);
}
