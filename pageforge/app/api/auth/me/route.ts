// ═══════════════════════════════════════════════════════════════════
// GET /api/auth/me — current session info
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { getSession } from "@/lib/security";
import { usersDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await usersDb.findById(session.userId);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      plan: user.plan,
      generationsUsed: user.generationsUsed,
      generationsLimit: user.generationsLimit,
    },
  });
}
