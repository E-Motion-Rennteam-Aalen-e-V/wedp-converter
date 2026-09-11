import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts already enforces this for every request; this re-check
  // is defense-in-depth so the layout never renders without a session,
  // and gives it the payload it needs for the shell (username, roles).
  const cookieStore = await cookies();
  const session = await verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell username={session.u} roles={session.r}>
      {children}
    </AdminShell>
  );
}
