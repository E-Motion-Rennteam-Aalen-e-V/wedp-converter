import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { LocalUser } from "@/lib/admin/types";

// Local, file-based admin accounts — the middle tier between the
// break-glass admin (env vars) and the optional remote credentials repo.
//
// Storage caveat: this writes to a JSON file under the project root, which
// requires a writable, persistent filesystem. That holds for local dev and
// a traditional/self-hosted server, but Vercel and Netlify serverless
// functions run on an ephemeral, effectively read-only filesystem outside
// /tmp — password changes for local users will fail there in production.
// For a serverless deployment, prefer the remote credentials-repo source
// (or swap this module's read/write for a real database) for any account
// whose password needs to change at runtime.

const USERS_FILE = path.join(process.cwd(), ".admin-users.json");

interface UsersFile {
  users: LocalUser[];
}

export function readLocalUsers(): LocalUser[] {
  if (!existsSync(USERS_FILE)) return [];
  try {
    const raw = readFileSync(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw) as UsersFile;
    return Array.isArray(parsed.users) ? parsed.users : [];
  } catch {
    return [];
  }
}

export function getLocalUser(username: string): LocalUser | null {
  return readLocalUsers().find((u) => u.username === username) ?? null;
}

function writeLocalUsers(users: LocalUser[]): void {
  writeFileSync(USERS_FILE, `${JSON.stringify({ users }, null, 2)}\n`, "utf8");
}

/** Returns false (never throws) if the user doesn't exist or the write fails. */
export function setLocalUserPassword(username: string, passwordHash: string, mustChangePassword: boolean): boolean {
  const users = readLocalUsers();
  const index = users.findIndex((u) => u.username === username);
  if (index === -1) return false;
  const existing = users[index];
  if (!existing) return false;
  users[index] = { ...existing, passwordHash, mustChangePassword };
  try {
    writeLocalUsers(users);
    return true;
  } catch {
    return false;
  }
}
