// ═══════════════════════════════════════════════════════════════════
// POST /api/publish — publish a page to a public slug
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { pagesDb } from "@/lib/db";
import {
  runGuards,
  safeParse,
  publishSchema,
  RateLimits,
} from "@/lib/security";
import { slugify } from "@/lib/utils";

const RESERVED_SLUGS = new Set([
  "api", "app", "admin", "dashboard", "editor", "login", "signup",
  "preview", "www", "mail", "help", "support", "docs", "blog",
]);

export async function POST(request: Request) {
  const guard = await runGuards(request, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeParse(publishSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const page = await pagesDb.findById(parsed.data.pageId);
  if (!page || page.userId !== guard.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Pick a slug: user-provided, or derived from title with random suffix
  let slug = parsed.data.slug ?? slugify(page.title);
  if (!slug || RESERVED_SLUGS.has(slug)) {
    slug = `page-${page.id.slice(0, 6)}`;
  }

  // Ensure uniqueness — append suffix on collision
  const existing = await pagesDb.findBySlug(slug);
  if (existing && existing.id !== page.id) {
    slug = `${slug}-${page.id.slice(0, 6)}`;
  }

  const updated = await pagesDb.update(page.id, { status: "published", slug });
  return NextResponse.json({
    page: updated,
    url: `/preview/${slug}`,
  });
}
