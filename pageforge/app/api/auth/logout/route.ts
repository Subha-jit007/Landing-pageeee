// ═══════════════════════════════════════════════════════════════════
// POST /api/auth/logout — clear session cookie
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { clearSessionCookie, runGuards } from "@/lib/security";

export async function POST(request: Request) {
  const guard = await runGuards(request, { requireCsrf: true });
  if (guard.response) return guard.response;
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
