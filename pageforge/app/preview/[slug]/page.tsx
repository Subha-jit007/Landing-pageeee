import { notFound } from "next/navigation";
import { pagesDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await pagesDb.findBySlug(slug);
  if (!page) notFound();

  // Increment view counter (fire and forget)
  pagesDb.incrementViews(page.id).catch(() => {});

  return (
    <div
      className="min-h-screen"
      dangerouslySetInnerHTML={{ __html: page.htmlContent }}
    />
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await pagesDb.findBySlug(slug);
  if (!page) return { title: "Not found" };
  return {
    title: page.title,
    description: page.prompt.slice(0, 160),
  };
}
