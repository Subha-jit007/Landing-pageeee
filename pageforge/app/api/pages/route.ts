// ═══════════════════════════════════════════════════════════════════
// GET  /api/pages       — list current user's pages
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { pagesDb } from "@/lib/db";
import { runGuards, RateLimits } from "@/lib/security";

export async function GET(request: Request) {
  const guard = await runGuards(request, {
    requireAuth: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;

  const pages = await pagesDb.findByUserId(guard.userId!);
  // Strip heavy htmlContent from list view; client can fetch by id
  const summary = pages.map((p) => ({
    id: p.id,
    title: p.title,
    prompt: p.prompt,
    status: p.status,
    slug: p.slug,
    views: p.views,
    designSystem: p.designSystem,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));
  return NextResponse.json({ pages: summary });
}
