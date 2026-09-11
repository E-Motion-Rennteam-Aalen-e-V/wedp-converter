import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, verifySessionToken } from "@/lib/admin/auth";
import { getLocalUser, setLocalUserPassword } from "@/lib/admin/users";
import { hashPassword, verifyPassword } from "@/lib/admin/password";

export const runtime = "nodejs";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Neues Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.` },
      { status: 400 }
    );
  }

  const localUser = getLocalUser(session.u);
  if (!localUser) {
    // Break-glass admin and remote-repo accounts aren't stored in the
    // local file, so there's nothing here for them to update.
    return NextResponse.json({ error: "Passwort-Änderung ist für dieses Konto nicht verfügbar." }, { status: 400 });
  }

  if (!verifyPassword(currentPassword, localUser.passwordHash)) {
    return NextResponse.json({ error: "Aktuelles Passwort ist falsch." }, { status: 401 });
  }

  const updated = setLocalUserPassword(session.u, hashPassword(newPassword), false);
  if (!updated) {
    return NextResponse.json(
      { error: "Passwort konnte nicht gespeichert werden (evtl. schreibgeschütztes Dateisystem)." },
      { status: 500 }
    );
  }

  const freshToken = await createSessionToken({ u: session.u, r: session.r });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, freshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
