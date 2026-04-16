import { getSession } from "@/lib/security";
import { pagesDb } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import EditorClient from "@/components/editor/EditorClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { pageId } = await params;
  const page = await pagesDb.findById(pageId);
  if (!page || page.userId !== session.userId) notFound();

  return <EditorClient page={page} />;
}
