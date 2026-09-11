"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Die neuen Passwörter stimmen nicht überein.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Passwort konnte nicht geändert werden.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Netzwerkfehler. Bitte erneut versuchen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">Passwort ändern</h1>
        <p className="mt-2 font-normal text-muted">
          Aus Sicherheitsgründen musst du dein Passwort ändern, bevor du fortfahren kannst.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-surface p-5 sm:p-6">
        <Field
          id="currentPassword"
          label="Aktuelles Passwort"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <Field
          id="newPassword"
          label="Neues Passwort"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <Field
          id="confirmPassword"
          label="Neues Passwort bestätigen"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-foreground shadow-[0_0_16px_-4px_var(--color-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <KeyRound className="h-4 w-4" />
          {isSubmitting ? "Wird gespeichert…" : "Passwort ändern"}
        </button>
      </form>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-mono text-xs font-normal uppercase tracking-wide text-muted">
        {label}
      </label>
      <input
        id={id}
        type="password"
        required
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="glow-focus w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none"
      />
    </div>
  );
}
