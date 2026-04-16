// ═══════════════════════════════════════════════════════════════════
// POST /api/auth/signup — create new account
// Applies security layers 1 (validation) + 3 (password hash) + 4 (session) + 6 (rate limit)
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { usersDb } from "@/lib/db";
import {
  signupSchema,
  safeParse,
  hashPassword,
  createSession,
  setSessionCookie,
  runGuards,
  RateLimits,
} from "@/lib/security";
import { PLAN_LIMITS } from "@/lib/utils";

export async function POST(request: Request) {
  // SECURITY LAYERS 6 + 5: rate limit + CSRF
  const guard = await runGuards(request, {
    requireCsrf: true,
    rateLimit: { scope: "signup", config: RateLimits.signup },
  });
  if (guard.response) return guard.response;

  // SECURITY LAYER 1: input validation
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeParse(signupSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { email, password } = parsed.data;

  // Check for existing user (case-insensitive via normalized lookup)
  const existing = await usersDb.findByEmail(email);
  if (existing) {
    // Intentionally identical to "bad credentials" language to avoid user enumeration
    return NextResponse.json({ error: "Unable to create account with these details" }, { status: 409 });
  }

  // SECURITY LAYER 3: hash password with bcrypt (12 rounds)
  const passwordHash = await hashPassword(password);

  const user = await usersDb.create({
    id: nanoid(16),
    email,
    passwordHash,
    plan: "free",
    generationsUsed: 0,
    generationsLimit: PLAN_LIMITS.free,
    createdAt: new Date().toISOString(),
  });

  // SECURITY LAYER 4: signed JWT in HTTP-only cookie
  const token = await createSession(user.id, user.email);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, email: user.email, plan: user.plan },
  });
}
