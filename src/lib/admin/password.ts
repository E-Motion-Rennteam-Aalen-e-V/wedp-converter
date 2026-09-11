import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// node:crypto — Node-runtime only. Never imported from middleware.

const KEY_LENGTH = 64;
// Fixed, well-formed salt used only to burn CPU time on a lookup miss —
// never used to hash a real password.
const DUMMY_SALT = "0000000000000000000000000000000000000000000000000000000000000000";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  let hashBuffer: Buffer;
  try {
    hashBuffer = Buffer.from(hash, "hex");
  } catch {
    return false;
  }
  const candidate = scryptSync(password, salt, hashBuffer.length || KEY_LENGTH);
  if (candidate.length !== hashBuffer.length) return false;
  return timingSafeEqual(candidate, hashBuffer);
}

/**
 * Runs the same scrypt work a real verification would, without a real
 * account to check against — so "no such user" takes the same wall-clock
 * time as "wrong password" and a valid username can't be inferred from
 * response latency.
 */
export function burnPasswordVerificationTime(password: string): void {
  scryptSync(password, DUMMY_SALT, KEY_LENGTH);
}
