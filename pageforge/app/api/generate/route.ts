// ═══════════════════════════════════════════════════════════════════
// POST /api/generate — generate a landing page from a prompt
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { usersDb, pagesDb } from "@/lib/db";
import { generatePage } from "@/lib/generator";
import {
  generationSchema,
  safeParse,
  sanitizeHtml,
  runGuards,
  RateLimits,
} from "@/lib/security";

export async function POST(request: Request) {
  const guard = await runGuards(request, {
    requireAuth: true,
    requireCsrf: true,
    rateLimit: { scope: "generate", config: RateLimits.generate },
  });
  if (guard.response) return guard.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = safeParse(generationSchema, body);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  // Enforce per-user quota
  const user = await usersDb.findById(guard.userId!);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.generationsUsed >= user.generationsLimit) {
    return NextResponse.json(
      { error: `Monthly limit reached (${user.generationsLimit}). Upgrade to continue.` },
      { status: 402 },
    );
  }

  // Generate the page
  const result = generatePage({
    prompt: parsed.data.prompt,
    theme: parsed.data.theme,
    fontPair: parsed.data.fontPair,
    animationLevel: parsed.data.animationLevel,
    industry: parsed.data.industry,
  });

  // SECURITY LAYER 2: sanitize HTML before storing
  const safeHtml = sanitizeHtml(result.html);

  const page = await pagesDb.create({
    id: nanoid(16),
    userId: user.id,
    title: result.title,
    prompt: parsed.data.prompt,
    htmlContent: safeHtml,
    designSystem: result.designSystem,
    status: "draft",
    slug: null,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await usersDb.incrementGenerations(user.id);

  return NextResponse.json({
    pageId: page.id,
    title: page.title,
    htmlContent: page.htmlContent,
    designSystem: page.designSystem,
  });
}
