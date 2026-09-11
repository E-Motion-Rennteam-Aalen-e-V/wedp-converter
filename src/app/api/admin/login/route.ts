import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "@/lib/admin/auth";
import { burnPasswordVerificationTime, verifyPassword } from "@/lib/admin/password";
import { getLocalUser } from "@/lib/admin/users";
import { fetchRemoteUser, isRemoteAuthEnabled } from "@/lib/admin/remoteUsers";
import { isRateLimited, recordAttempt } from "@/lib/admin/rateLimit";
import type { AdminRole } from "@/lib/admin/types";

// scrypt-based password hashing requires node:crypto, which the Edge
// runtime doesn't provide — this route must run under Node.js.
export const runtime = "nodejs";

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function unauthorized() {
  return NextResponse.json({ error: "Benutzername oder Passwort ist falsch." }, { status: 401 });
}

async function issueSession(username: string, roles: AdminRole[], mustChangePassword: boolean) {
  const token = await createSessionToken({ u: username, r: roles, ...(mustChangePassword ? { p: true } : {}) });
  const response = NextResponse.json({ ok: true, mustChangePassword });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}

export async function POST(request: NextRequest) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 16) {
    return NextResponse.json(
      { error: "Server ist nicht korrekt konfiguriert (ADMIN_SESSION_SECRET fehlt oder ist zu kurz)." },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Zu viele Anmeldeversuche. Bitte in ein paar Minuten erneut versuchen." },
      { status: 429 }
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json({ error: "Benutzername und Passwort sind erforderlich." }, { status: 400 });
  }

  // 1) Break-glass admin
  const breakGlassUser = process.env.ADMIN_USER;
  const breakGlassHash = process.env.ADMIN_PASSWORD_HASH;
  if (breakGlassUser && breakGlassHash && username === breakGlassUser) {
    if (verifyPassword(password, breakGlassHash)) {
      return issueSession(username, ["superadmin"], false);
    }
    recordAttempt(ip);
    return unauthorized();
  }

  // 2) Local users (.admin-users.json)
  const localUser = getLocalUser(username);
  if (localUser) {
    if (verifyPassword(password, localUser.passwordHash)) {
      return issueSession(username, localUser.roles ?? ["admin"], Boolean(localUser.mustChangePassword));
    }
    recordAttempt(ip);
    return unauthorized();
  }

  // 3) Remote credentials repo — only consulted once the account is
  // confirmed absent from the two local sources, and only if configured.
  if (isRemoteAuthEnabled()) {
    const remoteUser = await fetchRemoteUser(username);
    if (remoteUser) {
      if (verifyPassword(password, remoteUser.passwordHash)) {
        return issueSession(username, remoteUser.roles ?? ["admin"], false);
      }
      recordAttempt(ip);
      return unauthorized();
    }
  }

  // No account anywhere matched this username — burn the same time a real
  // password check costs so the response can't be used to enumerate users.
  burnPasswordVerificationTime(password);
  recordAttempt(ip);
  return unauthorized();
}
