import type { AdminRole } from "@/lib/admin/types";

// Optional third authentication source: a private GitHub repo holding a
// JSON file of centrally-managed accounts and roles. Entirely inert
// unless CREDENTIALS_REPO_URL is configured — the login route only calls
// this when a username matched neither the break-glass admin nor a local
// user.

interface RemoteUserRecord {
  username: string;
  passwordHash: string;
  roles?: AdminRole[];
  locked?: boolean;
}

interface RemoteCredentialsFile {
  users?: RemoteUserRecord[];
}

export function isRemoteAuthEnabled(): boolean {
  return Boolean(process.env.CREDENTIALS_REPO_URL);
}

function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = /github\.com[/:]([^/]+)\/([^/.]+?)(?:\.git)?\/?$/.exec(url.trim());
  if (!match) return null;
  const [, owner, repo] = match;
  return owner && repo ? { owner, repo } : null;
}

export async function fetchRemoteUser(username: string): Promise<RemoteUserRecord | null> {
  const repoUrl = process.env.CREDENTIALS_REPO_URL;
  if (!repoUrl) return null;

  const parsed = parseGithubRepoUrl(repoUrl);
  if (!parsed) return null;

  const branch = process.env.CREDENTIALS_REPO_BRANCH || "main";
  const filePath = process.env.CREDENTIALS_REPO_PATH || "credentials.json";
  const token = process.env.CREDENTIALS_REPO_TOKEN;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Accept: "application/vnd.github.raw+json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: "no-store",
      }
    );
    if (!response.ok) return null;

    const data = (await response.json()) as RemoteCredentialsFile;
    const user = data.users?.find((u) => u.username === username);
    return user && !user.locked ? user : null;
  } catch {
    return null;
  }
}
