// ═══════════════════════════════════════════════════════════════════
// POST /api/auth/login — authenticate existing user
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import {
  loginSchema,
  safeParse,
  verifyPassword,
  createSession,
  setSessionCookie,
  runGuards,
  RateLimits,
} from "@/lib/security";

export async function POST(request: Request) {
  const guard = await runGuards(request, {
    requireCsrf: true,
    rateLimit: { scope: "login", config: RateLimits.login },
  });
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeParse(loginSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { email, password } = parsed.data;
  const user = await usersDb.findByEmail(email);

  // Always run bcrypt.compare to prevent timing attacks that could
  // reveal whether the email exists.
  const dummyHash = "$2a$12$K9h.........................................";
  const ok = user
    ? await verifyPassword(password, user.passwordHash)
    : await verifyPassword(password, dummyHash).then(() => false);

  if (!ok || !user) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSession(user.id, user.email);
  await setSessionCookie(token);

  return NextResponse.json({
    user: { id: user.id, email: user.email, plan: user.plan },
  });
}
