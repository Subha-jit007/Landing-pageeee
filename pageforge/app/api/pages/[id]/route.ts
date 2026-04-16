// ═══════════════════════════════════════════════════════════════════
// GET    /api/pages/:id  — fetch one page (owner only)
// PATCH  /api/pages/:id  — update title / html / design
// DELETE /api/pages/:id  — delete
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { pagesDb } from "@/lib/db";
import {
  runGuards,
  safeParse,
  updatePageSchema,
  sanitizeHtml,
  RateLimits,
} from "@/lib/security";

async function ownedPage(id: string, userId: string) {
  const page = await pagesDb.findById(id);
  if (!page || page.userId !== userId) return null;
  return page;
}

export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await runGuards(request, {
    requireAuth: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;
  const { id } = await ctx.params;
  const page = await ownedPage(id, guard.userId!);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ page });
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await runGuards(request, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;
  const { id } = await ctx.params;
  const page = await ownedPage(id, guard.userId!);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeParse(updatePageSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (parsed.data.title) patch.title = parsed.data.title;
  if (parsed.data.htmlContent) patch.htmlContent = sanitizeHtml(parsed.data.htmlContent);
  if (parsed.data.designSystem) patch.designSystem = parsed.data.designSystem;

  const updated = await pagesDb.update(id, patch);
  return NextResponse.json({ page: updated });
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const guard = await runGuards(request, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;
  const { id } = await ctx.params;
  const page = await ownedPage(id, guard.userId!);
  if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await pagesDb.delete(id);
  return NextResponse.json({ ok: true });
}
