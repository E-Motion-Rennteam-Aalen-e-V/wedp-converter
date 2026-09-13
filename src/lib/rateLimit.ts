// IP-based sliding-window rate limiter factory.
//
// This is process-local, in-memory state: it works as a real deterrent on
// a long-lived server process (self-hosted, Docker, a persistent Node
// server) but is only a best-effort speed bump on serverless platforms
// (Vercel, Netlify Functions) — each invocation can land on a different,
// short-lived instance with its own empty map. It still costs an attacker
// something there; it just isn't a hard guarantee on serverless. A shared
// store (Redis, Upstash, etc.) is a drop-in replacement for the two
// returned functions if that guarantee matters.
export function createRateLimiter(windowMs: number, maxAttempts: number) {
  const attemptsByKey = new Map<string, number[]>();

  function recentAttempts(key: string): number[] {
    const now = Date.now();
    const timestamps = (attemptsByKey.get(key) ?? []).filter((t) => now - t < windowMs);
    attemptsByKey.set(key, timestamps);
    return timestamps;
  }

  return {
    isRateLimited(key: string): boolean {
      return recentAttempts(key).length >= maxAttempts;
    },
    recordAttempt(key: string): void {
      const timestamps = recentAttempts(key);
      timestamps.push(Date.now());
      attemptsByKey.set(key, timestamps);
    },
  };
}
