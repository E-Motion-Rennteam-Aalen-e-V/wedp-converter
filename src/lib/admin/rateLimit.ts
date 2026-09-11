// IP-based sliding-window rate limiter for the login endpoint.
//
// This is process-local, in-memory state: it works as a real brute-force
// deterrent on a long-lived server process (self-hosted, Docker, a
// persistent Node server) but is only a best-effort speed bump on
// serverless platforms (Vercel, Netlify Functions) — each invocation can
// land on a different, short-lived instance with its own empty map. It
// still costs an attacker something there; it just isn't a hard guarantee
// on serverless. A shared store (Redis, Upstash, etc.) is a drop-in
// replacement for this module's two functions if that guarantee matters.

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

const attemptsByKey = new Map<string, number[]>();

function recentAttempts(key: string): number[] {
  const now = Date.now();
  const timestamps = (attemptsByKey.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  attemptsByKey.set(key, timestamps);
  return timestamps;
}

export function isRateLimited(key: string): boolean {
  return recentAttempts(key).length >= MAX_ATTEMPTS;
}

export function recordAttempt(key: string): void {
  const timestamps = recentAttempts(key);
  timestamps.push(Date.now());
  attemptsByKey.set(key, timestamps);
}
