export const CONTACT_TOPICS = ["Allgemeine Anfrage", "Sponsoring", "Support", "Sonstiges"] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export interface ContactAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
}

export interface ContactSubmission {
  topic: ContactTopic;
  name: string;
  email: string;
  message: string;
  attachments: ContactAttachment[];
}

export type SendContactEmailResult = { ok: true } | { ok: false; reason: "not_configured" | "send_failed" };
