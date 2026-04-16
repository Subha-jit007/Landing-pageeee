// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 5: CSRF protection (double-submit cookie pattern)
// On every state-changing request (POST/PUT/DELETE), we verify that
// the X-CSRF-Token header matches a cryptographically random cookie.
// Attackers cannot read the cookie from another origin, so they cannot
// forge requests even if a session cookie is automatically sent.
// ═══════════════════════════════════════════════════════════════════
import { cookies } from "next/headers";
import crypto from "crypto";
import { constantTimeEqual } from "./password";

const CSRF_COOKIE = "pf_csrf";
const CSRF_HEADER = "x-csrf-token";

export async function getOrCreateCsrfToken(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CSRF_COOKIE)?.value;
  if (existing && existing.length === 64) return existing;

  const fresh = crypto.randomBytes(32).toString("hex");
  jar.set(CSRF_COOKIE, fresh, {
    httpOnly: false, // must be readable by client JS to echo in header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return fresh;
}

export async function verifyCsrf(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER);
  if (!headerToken) return false;

  const jar = await cookies();
  const cookieToken = jar.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;

  return constantTimeEqual(headerToken, cookieToken);
}

export { CSRF_COOKIE, CSRF_HEADER };
