import type { AdminRole } from "@/lib/admin/types";

export interface AdminSection {
  id: string;
  label: string;
  href: string;
}

export const ADMIN_SECTIONS: AdminSection[] = [
  { id: "overview", label: "Übersicht", href: "/admin" },
  { id: "sponsoring", label: "Sponsoring", href: "/admin/sponsoring" },
];

/**
 * "overview" is the universal landing page for any authenticated admin —
 * it only ever shows the current user's own session, so every role can
 * reach it. superadmin and admin can also reach every other section;
 * sponsoring is scoped to just the sponsoring section, mirroring the
 * original three-tier RBAC.
 */
export function canAccessSection(roles: AdminRole[], sectionId: string): boolean {
  if (sectionId === "overview") return true;
  if (roles.includes("superadmin") || roles.includes("admin")) return true;
  if (roles.includes("sponsoring")) return sectionId === "sponsoring";
  return false;
}

export function accessibleSections(roles: AdminRole[]): AdminSection[] {
  return ADMIN_SECTIONS.filter((section) => canAccessSection(roles, section.id));
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  superadmin: "Superadmin",
  admin: "Admin",
  sponsoring: "Sponsoring-Management",
};
