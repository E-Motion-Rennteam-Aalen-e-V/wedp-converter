import type { ContactSubmission, SendContactEmailResult } from "@/lib/contact/types";

// Integration point for actually delivering contact-form submissions —
// deliberately left unwired here; the form itself, validation, anti-spam
// checks, and this call site are all complete and working. Wiring this up
// later is meant to be a single, isolated change:
//
//   1. `npm install resend`
//   2. Set RESEND_API_KEY and CONTACT_RECIPIENT_EMAIL in the environment
//      (Vercel/Netlify project settings, or .env.local for local dev).
//   3. Replace the body of this function with something like:
//
//        import { Resend } from "resend";
//        const resend = new Resend(process.env.RESEND_API_KEY);
//        const { error } = await resend.emails.send({
//          from: "WEDP Converter Kontaktformular <kontakt@…verified-domain>",
//          to: process.env.CONTACT_RECIPIENT_EMAIL!,
//          replyTo: submission.email,
//          subject: `[${submission.topic}] Neue Kontaktanfrage von ${submission.name}`,
//          text: submission.message,
//          attachments: submission.attachments.map((a) => ({
//            filename: a.filename,
//            content: a.content,
//          })),
//        });
//        return error ? { ok: false, reason: "send_failed" } : { ok: true };
//
// Any provider works the same way (Resend, Postmark, SendGrid, SMTP via
// nodemailer, …) — only this function needs to change; the API route and
// the UI are provider-agnostic.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unused until a provider is wired in, see comment above
export async function sendContactEmail(submission: ContactSubmission): Promise<SendContactEmailResult> {
  const isConfigured = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_RECIPIENT_EMAIL);
  if (!isConfigured) {
    return { ok: false, reason: "not_configured" };
  }

  // Unreachable until the block above is wired up to a real provider.
  return { ok: false, reason: "send_failed" };
}
