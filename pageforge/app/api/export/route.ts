// ═══════════════════════════════════════════════════════════════════
// GET /api/export?pageId=... — download page as a ZIP file
// ═══════════════════════════════════════════════════════════════════
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { pagesDb } from "@/lib/db";
import { runGuards, RateLimits } from "@/lib/security";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  const guard = await runGuards(request, {
    requireAuth: true,
    rateLimit: { scope: "api", config: RateLimits.api },
  });
  if (guard.response) return guard.response;

  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");
  if (!pageId) return NextResponse.json({ error: "pageId required" }, { status: 400 });

  const page = await pagesDb.findById(pageId);
  if (!page || page.userId !== guard.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const zip = new JSZip();
  zip.file("index.html", page.htmlContent);
  zip.file(
    "README.md",
    `# ${page.title}

Generated with PageForge AI on ${new Date(page.createdAt).toLocaleDateString()}.

## How to use

1. Open \`index.html\` in any browser, or
2. Host the file on GitHub Pages, Netlify, Vercel, or any static host
3. Edit the HTML directly — fonts and animations are loaded from CDNs

## Credits

- Fonts via Fontshare + Google Fonts (free)
- Animations via GSAP + Lenis (free)
- Icons inline SVG

The entire file is self-contained. No build step required.
`,
  );

  const buffer = await zip.generateAsync({ type: "uint8array" });
  const filename = `${slugify(page.title) || "landing-page"}.zip`;

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
