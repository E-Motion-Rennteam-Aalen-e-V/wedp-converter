import type { SessionPayload } from "@/lib/admin/types";

// HMAC-SHA256 signed, self-contained session tokens — built on the Web
// Crypto API (globalThis.crypto.subtle) rather than node:crypto so the
// exact same code verifies a session both in middleware (Edge runtime)
// and in Node-runtime API routes, with no behavioral drift between them.

const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h, matches the original spec

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_SECONDS;

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function requireSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET ist nicht gesetzt oder zu kurz (mindestens 16 Zeichen).");
  }
  return secret;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
    "verify",
  ]);
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">): Promise<string> {
  const secret = requireSecret();
  const full: SessionPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS };
  const encodedPayload = base64UrlEncode(new TextEncoder().encode(JSON.stringify(full)));
  const key = await importHmacKey(secret);
  const signatureBytes = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  const signature = base64UrlEncode(new Uint8Array(signatureBytes));
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies the HMAC signature (constant-time, via SubtleCrypto.verify),
 * the expiry, and the payload shape. Returns null for anything invalid,
 * missing, or expired — never throws on untrusted input.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  let secret: string;
  try {
    secret = requireSecret();
  } catch {
    return null;
  }

  try {
    const key = await importHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(encodedPayload)
    );
    if (!isValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as SessionPayload;
    if (typeof payload.u !== "string" || !payload.u) return null;
    if (typeof payload.exp !== "number" || payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!Array.isArray(payload.r)) return null;
    return payload;
  } catch {
    return null;
  }
}
