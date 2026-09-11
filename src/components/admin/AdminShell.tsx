"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, ShieldCheck } from "lucide-react";
import { accessibleSections, ROLE_LABELS } from "@/lib/admin/roles";
import type { AdminRole } from "@/lib/admin/types";

interface AdminShellProps {
  username: string;
  roles: AdminRole[];
  children: React.ReactNode;
}

export function AdminShell({ username, roles, children }: AdminShellProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const sections = accessibleSections(roles);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent-text" />
            <span className="text-lg">Admin</span>
          </div>

          <nav className="flex flex-1 flex-wrap gap-1">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-accent-2/30 hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono text-xs font-normal text-muted">
              <div className="text-foreground">{username}</div>
              <div>{roles.map((role) => ROLE_LABELS[role]).join(", ")}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              aria-label="Abmelden"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
