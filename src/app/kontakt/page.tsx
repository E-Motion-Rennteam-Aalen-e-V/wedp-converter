"use client";

import { useRef, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Paperclip, Send, X } from "lucide-react";
import { CONTACT_TOPICS, type ContactTopic } from "@/lib/contact/types";
import { formatBytes } from "@/lib/format";

const MAX_FILES = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];
const MAX_MESSAGE_LENGTH = 2000;

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function KontaktPage() {
  const [topic, setTopic] = useState<ContactTopic>(CONTACT_TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renderedAt] = useState(() => Date.now());

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFileError(null);
    const incoming = Array.from(newFiles);
    const combined = [...files, ...incoming];

    if (combined.length > MAX_FILES) {
      setFileError(`Maximal ${MAX_FILES} Dateien.`);
      return;
    }
    for (const file of incoming) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setFileError(`Dateityp von „${file.name}“ wird nicht unterstützt (nur Bilder oder PDF).`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`„${file.name}“ ist zu groß (max. 5 MB pro Datei).`);
        return;
      }
    }
    const totalSize = combined.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > MAX_TOTAL_SIZE) {
      setFileError("Anhänge zusammen zu groß (max. 15 MB).");
      return;
    }

    setFiles(combined);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMessage(null);

    const formData = new FormData();
    formData.set("topic", topic);
    formData.set("name", name);
    formData.set("email", email);
    formData.set("message", message);
    formData.set("renderedAt", String(renderedAt));
    formData.set("website", ""); // honeypot — must stay empty
    files.forEach((file) => formData.append("attachments", file));

    try {
      const response = await fetch("/api/contact", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setErrorMessage(data.error ?? "Nachricht konnte nicht gesendet werden.");
        setState("error");
        return;
      }
      setState("success");
      setName("");
      setEmail("");
      setMessage("");
      setFiles([]);
      setTopic(CONTACT_TOPICS[0]);
    } catch {
      setErrorMessage("Netzwerkfehler. Bitte versuche es erneut.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <h1 className="text-2xl sm:text-3xl">Nachricht gesendet</h1>
          <p className="mt-3 text-muted">Danke für deine Nachricht — wir melden uns so schnell wie möglich.</p>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-6 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent-2 hover:text-foreground"
          >
            Weitere Nachricht senden
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl sm:text-4xl">Kontakt</h1>
        <p className="mt-3 text-muted">
          Frage, Sponsoring-Anliegen oder Feedback? Schreib uns über das Formular oder direkt an{" "}
          <a href="mailto:info@emotion-rennteam.de" className="text-accent-text underline">
            info@emotion-rennteam.de
          </a>
          .
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6"
        >
          {/* Honeypot: hidden from real users, real browsers never fill this in. */}
          <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div>
            <label htmlFor="topic" className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
              Anliegen
            </label>
            <select
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value as ContactTopic)}
              className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            >
              {CONTACT_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
              Nachricht
            </label>
            <textarea
              id="message"
              required
              rows={5}
              maxLength={MAX_MESSAGE_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="glow-focus w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
            />
            <p className="mt-1 text-right font-mono text-[11px] text-muted">
              {message.length} / {MAX_MESSAGE_LENGTH}
            </p>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
              Anhänge (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(",")}
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_FILES}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-accent-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Paperclip className="h-4 w-4" />
              Bilder oder PDF anhängen
            </button>
            <p className="mt-1 font-mono text-[11px] text-muted">Max. {MAX_FILES} Dateien, je 5 MB, insgesamt 15 MB.</p>

            {files.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-1.5 text-xs"
                  >
                    <span className="truncate text-foreground">{file.name}</span>
                    <span className="ml-2 flex shrink-0 items-center gap-2">
                      <span className="font-mono text-muted">{formatBytes(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        aria-label={`${file.name} entfernen`}
                        className="rounded p-1 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {fileError && <p className="mt-1.5 text-sm text-red-400">{fileError}</p>}
          </div>

          {state === "error" && errorMessage && (
            <p role="alert" className="text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={state === "submitting"}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_0_16px_-4px_var(--color-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {state === "submitting" ? "Wird gesendet…" : "Nachricht senden"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
