// ═══════════════════════════════════════════════════════════════════
// Security module — composed guards for API routes
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { getSession } from "./session";
import { verifyCsrf } from "./csrf";
import { checkRateLimit, getClientKey, RateLimits, type RateLimitConfig } from "./rate-limit";

export * from "./validate";
export * from "./sanitize";
export * from "./password";
export * from "./session";
export * from "./csrf";
export * from "./rate-limit";

export interface GuardOptions {
  /** Require an authenticated session */
  requireAuth?: boolean;
  /** Require a valid CSRF token on the request */
  requireCsrf?: boolean;
  /** Apply a rate limit to this endpoint */
  rateLimit?: { scope: string; config: RateLimitConfig };
}

/**
 * Run the standard security stack on a request. Returns a response
 * object (null if the request should continue, or a NextResponse to
 * abort early). Attaches session info to the returned context.
 */
export async function runGuards(
  request: Request,
  options: GuardOptions = {},
): Promise<{ response?: NextResponse; userId?: string; email?: string }> {
  // Rate limiting (by IP) — first, before doing any work
  if (options.rateLimit) {
    const key = getClientKey(request);
    const result = checkRateLimit(options.rateLimit.scope, key, options.rateLimit.config);
    if (!result.allowed) {
      return {
        response: NextResponse.json(
          { error: "Too many requests. Please try again shortly." },
          {
            status: 429,
            headers: { "Retry-After": Math.ceil(result.retryAfterMs / 1000).toString() },
          },
        ),
      };
    }
  }

  // CSRF check on mutating requests
  if (options.requireCsrf) {
    const ok = await verifyCsrf(request);
    if (!ok) {
      return {
        response: NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 }),
      };
    }
  }

  // Auth check
  if (options.requireAuth) {
    const session = await getSession();
    if (!session) {
      return { response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
    }
    return { userId: session.userId, email: session.email };
  }

  return {};
}

export { RateLimits };
