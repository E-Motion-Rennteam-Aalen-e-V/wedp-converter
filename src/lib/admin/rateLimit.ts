import { createRateLimiter } from "@/lib/rateLimit";

// 5 login attempts per 5 minutes per IP — see createRateLimiter for the
// in-memory/serverless caveat.
export const { isRateLimited, recordAttempt } = createRateLimiter(5 * 60 * 1000, 5);
