import { NextRequest, NextResponse } from "next/server";
import { createRateLimiter } from "@/lib/rateLimit";
import { sendContactEmail } from "@/lib/contact/sendEmail";
import { CONTACT_TOPICS, type ContactAttachment, type ContactTopic } from "@/lib/contact/types";

export const runtime = "nodejs";

const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 2000;
const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_ATTACHMENT_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"]);
const MIN_FILL_TIME_MS = 3000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const { isRateLimited, recordAttempt } = createRateLimiter(10 * 60 * 1000, 5);

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function badRequest(error: string) {
  return NextResponse.json({ ok: false, error }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Zu viele Anfragen. Bitte versuche es in ein paar Minuten erneut." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return badRequest("Ungültige Anfrage.");
  }

  // Honeypot: a real browser never fills this hidden field in.
  const honeypot = formData.get("website");
  if (typeof honeypot === "string" && honeypot.length > 0) {
    recordAttempt(ip);
    return badRequest("Ungültige Anfrage.");
  }

  // Fill-time heuristic: bots typically submit within milliseconds of
  // loading the page. Client-supplied and therefore spoofable — a
  // deterrent layer, not a security boundary on its own.
  const renderedAtRaw = formData.get("renderedAt");
  const renderedAt = typeof renderedAtRaw === "string" ? Number(renderedAtRaw) : NaN;
  if (!Number.isFinite(renderedAt) || Date.now() - renderedAt < MIN_FILL_TIME_MS) {
    recordAttempt(ip);
    return badRequest("Ungültige Anfrage.");
  }

  const topic = formData.get("topic");
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  if (typeof topic !== "string" || !CONTACT_TOPICS.includes(topic as ContactTopic)) {
    return badRequest("Bitte wähle ein gültiges Anliegen aus.");
  }
  if (typeof name !== "string" || !name.trim() || name.length > MAX_NAME_LENGTH) {
    return badRequest(`Bitte gib einen Namen an (max. ${MAX_NAME_LENGTH} Zeichen).`);
  }
  if (typeof email !== "string" || !EMAIL_PATTERN.test(email)) {
    return badRequest("Bitte gib eine gültige E-Mail-Adresse an.");
  }
  if (typeof message !== "string" || !message.trim() || message.length > MAX_MESSAGE_LENGTH) {
    return badRequest(`Bitte gib eine Nachricht an (max. ${MAX_MESSAGE_LENGTH} Zeichen).`);
  }

  const fileEntries = formData.getAll("attachments").filter((entry): entry is File => entry instanceof File);
  if (fileEntries.length > MAX_FILES) {
    return badRequest(`Maximal ${MAX_FILES} Dateien erlaubt.`);
  }

  let totalSize = 0;
  const attachments: ContactAttachment[] = [];
  for (const file of fileEntries) {
    if (file.size === 0) continue;
    if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
      return badRequest(`Dateityp „${file.type || "unbekannt"}“ wird nicht unterstützt.`);
    }
    if (file.size > MAX_FILE_SIZE) {
      return badRequest(`Datei „${file.name}“ ist zu groß (max. 5 MB pro Datei).`);
    }
    totalSize += file.size;
    if (totalSize > MAX_TOTAL_SIZE) {
      return badRequest("Anhänge zusammen zu groß (max. 15 MB).");
    }
    attachments.push({
      filename: file.name,
      contentType: file.type,
      content: Buffer.from(await file.arrayBuffer()),
    });
  }

  recordAttempt(ip);

  const result = await sendContactEmail({
    topic: topic as ContactTopic,
    name: name.trim(),
    email,
    message: message.trim(),
    attachments,
  });

  if (result.ok) {
    return NextResponse.json({ ok: true });
  }

  if (result.reason === "not_configured") {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Der Versand ist aktuell noch nicht eingerichtet. Bitte schreib uns bis dahin direkt an info@emotion-rennteam.de.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      ok: false,
      error: "Nachricht konnte nicht gesendet werden. Bitte versuche es später erneut oder schreib uns direkt an info@emotion-rennteam.de.",
    },
    { status: 502 }
  );
}
