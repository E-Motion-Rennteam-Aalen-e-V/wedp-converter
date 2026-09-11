import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";
import { ROLE_LABELS } from "@/lib/admin/roles";

export default async function AdminOverviewPage() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl">Übersicht</h1>
        <p className="mt-2 font-normal text-muted">Angemeldet als {session?.u}.</p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="mb-4 text-base sm:text-lg">Sitzung</h2>
        <dl className="grid gap-3 font-mono text-xs font-normal sm:grid-cols-2">
          <div>
            <dt className="text-muted">Benutzername</dt>
            <dd className="mt-1 text-foreground">{session?.u}</dd>
          </div>
          <div>
            <dt className="text-muted">Rollen</dt>
            <dd className="mt-1 text-foreground">{session?.r.map((role) => ROLE_LABELS[role]).join(", ")}</dd>
          </div>
          <div>
            <dt className="text-muted">Gültig bis</dt>
            <dd className="mt-1 text-foreground">
              {session ? new Date(session.exp * 1000).toLocaleString("de-DE") : "—"}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
