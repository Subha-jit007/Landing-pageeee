// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 6: Rate limiting (sliding-window, in-memory)
// Caps request rates per-key (IP or userId). Prevents brute-force
// login attacks, generation abuse, and resource exhaustion.
// ═══════════════════════════════════════════════════════════════════

interface Bucket {
  timestamps: number[];
}

// Per-scope buckets, cleaned lazily on access
const buckets: Record<string, Map<string, Bucket>> = {};

export interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  max: number;
  /** Window size in milliseconds */
  windowMs: number;
}

export const RateLimits = {
  login: { max: 5, windowMs: 60_000 } as RateLimitConfig, // 5 attempts/min
  signup: { max: 3, windowMs: 60 * 60_000 } as RateLimitConfig, // 3/hour
  generate: { max: 10, windowMs: 60_000 } as RateLimitConfig, // 10/min
  api: { max: 120, windowMs: 60_000 } as RateLimitConfig, // 120/min general
};

/**
 * Check whether a key is within its rate limit. Returns remaining
 * allowance and retryAfter (ms) if blocked.
 */
export function checkRateLimit(
  scope: keyof typeof RateLimits | string,
  key: string,
  config: RateLimitConfig,
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const scopeMap = buckets[scope] ?? (buckets[scope] = new Map());

  let bucket = scopeMap.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    scopeMap.set(key, bucket);
  }

  // Drop timestamps outside the window
  const cutoff = now - config.windowMs;
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  // Lazy cleanup of stale buckets (random 1% chance per call)
  if (Math.random() < 0.01) {
    for (const [k, b] of scopeMap.entries()) {
      if (b.timestamps.length === 0) scopeMap.delete(k);
    }
  }

  if (bucket.timestamps.length >= config.max) {
    const oldest = bucket.timestamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, config.windowMs - (now - oldest)),
    };
  }

  bucket.timestamps.push(now);
  return {
    allowed: true,
    remaining: config.max - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}

/**
 * Extract a reasonable client identifier from request headers.
 * Prefers X-Forwarded-For (when behind a proxy), falls back to a
 * hashed user-agent if no IP is available.
 */
export function getClientKey(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return request.headers.get("user-agent")?.slice(0, 60) ?? "anon";
}
