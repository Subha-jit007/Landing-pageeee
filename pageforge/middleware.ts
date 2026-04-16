// ═══════════════════════════════════════════════════════════════════
// Middleware — route protection for /dashboard, /editor
// Redirects unauthenticated users to /login, and sets the CSRF cookie
// on first visit so client-side forms can include the token header.
// ═══════════════════════════════════════════════════════════════════
import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "pf_session";
const CSRF_COOKIE = "pf_csrf";

// Protected path prefixes — auth required
const PROTECTED = ["/dashboard", "/editor"];

async function isValidSession(token: string, secret: string): Promise<boolean> {
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "pageforge",
      audience: "pageforge-app",
    });
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Always ensure a CSRF cookie exists so client forms can pick it up
  if (!request.cookies.get(CSRF_COOKIE)) {
    const fresh = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    response.cookies.set(CSRF_COOKIE, fresh, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  // Route guarding
  const needsAuth = PROTECTED.some((prefix) => pathname.startsWith(prefix));
  if (needsAuth) {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    const secret = process.env.SESSION_SECRET;

    // If no session or no env secret (session will be verified later at API level),
    // at least check if a cookie exists. Full verification happens in the route.
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If SESSION_SECRET is set via env, we can verify here for belt-and-braces.
    // If it isn't (using auto-generated secret), route handlers will verify.
    if (secret && secret.length >= 32) {
      const ok = await isValidSession(token, secret);
      if (!ok) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Apply to all paths except static assets and Next internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)).*)",
  ],
};
