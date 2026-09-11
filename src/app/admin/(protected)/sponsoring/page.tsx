import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";
import { canAccessSection } from "@/lib/admin/roles";

export default async function AdminSponsoringPage() {
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session || !canAccessSection(session.r, "sponsoring")) {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl">Sponsoring</h1>
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6 text-muted">
        Noch keine Sponsoring-Inhalte hinterlegt.
      </section>
    </div>
  );
}
