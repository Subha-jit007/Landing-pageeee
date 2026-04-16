// ═══════════════════════════════════════════════════════════════════
// SECURITY LAYER 4: Session security (signed JWT in HTTP-only cookies)
// Sessions use JOSE-signed JWTs with HS256. Cookies are HTTP-only,
// SameSite=Strict, and Secure in production. Secret is auto-generated
// on first run if not provided via env var.
// ═══════════════════════════════════════════════════════════════════
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { Session } from "@/types";

const COOKIE_NAME = "pf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

let cachedSecret: Uint8Array | null = null;

/**
 * Lazy-load or generate the session secret. If SESSION_SECRET is set
 * via env, use it. Otherwise generate a strong random secret and
 * persist it to data/.session-secret so it survives restarts.
 */
async function getSecret(): Promise<Uint8Array> {
  if (cachedSecret) return cachedSecret;

  const envSecret = process.env.SESSION_SECRET;
  if (envSecret && envSecret.length >= 32) {
    cachedSecret = new TextEncoder().encode(envSecret);
    return cachedSecret;
  }

  // Generate + persist a strong secret
  const DATA_DIR = path.join(process.cwd(), "data");
  const secretFile = path.join(DATA_DIR, ".session-secret");
  try {
    const existing = await fs.readFile(secretFile, "utf-8");
    if (existing && existing.length >= 32) {
      cachedSecret = new TextEncoder().encode(existing.trim());
      return cachedSecret;
    }
  } catch {
    /* no existing secret */
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const fresh = crypto.randomBytes(48).toString("hex");
  await fs.writeFile(secretFile, fresh, { mode: 0o600 });
  cachedSecret = new TextEncoder().encode(fresh);
  return cachedSecret;
}

export async function createSession(userId: string, email: string): Promise<string> {
  const secret = await getSecret();
  const token = await new SignJWT({ userId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .setIssuer("pageforge")
    .setAudience("pageforge-app")
    .sign(secret);
  return token;
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const secret = await getSecret();
    const { payload } = await jwtVerify(token, secret, {
      issuer: "pageforge",
      audience: "pageforge-app",
    });
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") return null;
    return {
      userId: payload.userId,
      email: payload.email,
      exp: (payload.exp as number) ?? 0,
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  return session;
}

export { COOKIE_NAME as SESSION_COOKIE_NAME };
