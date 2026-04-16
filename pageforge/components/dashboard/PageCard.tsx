"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, Trash2, Edit3, Download } from "lucide-react";
import { apiFetch } from "@/lib/client";
import { timeAgo } from "@/lib/utils";
import { THEMES } from "@/lib/generator/themes";
import type { Page } from "@/types";

export default function PageCard({ page }: { page: Omit<Page, "htmlContent" | "userId"> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const theme = THEMES[page.designSystem.theme];

  function handleDelete() {
    if (!confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    start(async () => {
      const res = await apiFetch(`/api/pages/${page.id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    });
  }

  function handleExport() {
    window.location.href = `/api/export?pageId=${page.id}`;
  }

  return (
    <div className="group rounded-xl border border-border bg-surface overflow-hidden hover:border-muted transition-all hover:-translate-y-1">
      {/* Thumbnail */}
      <div
        className="aspect-[16/10] relative overflow-hidden"
        style={{ background: theme.gradient }}
      >
        <div className="absolute inset-0 flex items-center justify-center p-6 opacity-70">
          <div className="text-center space-y-2">
            <div
              className="h-3 mx-auto rounded"
              style={{ background: theme.text, opacity: 0.2, width: "60%" }}
            />
            <div
              className="h-5 mx-auto rounded"
              style={{ background: theme.text, opacity: 0.4, width: "85%" }}
            />
            <div
              className="h-5 mx-auto rounded"
              style={{ background: theme.text, opacity: 0.4, width: "70%" }}
            />
            <div className="flex justify-center gap-1.5 pt-2">
              <div
                className="h-6 w-16 rounded"
                style={{ background: theme.primary }}
              />
              <div
                className="h-6 w-16 rounded border"
                style={{ borderColor: theme.text, opacity: 0.3 }}
              />
            </div>
          </div>
        </div>
        {page.status === "published" && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/50 backdrop-blur text-[11px] font-semibold text-green-400 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Live
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-base truncate mb-1">{page.title}</h3>
        <p className="text-xs text-muted truncate mb-3">{page.prompt}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted mb-4">
          <span>{timeAgo(page.updatedAt)}</span>
          <span>·</span>
          <span>{page.views} views</span>
          <span>·</span>
          <span className="capitalize">{page.designSystem.theme.replace("-", " ")}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/editor/${page.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </Link>
          {page.status === "published" && page.slug && (
            <Link
              href={`/preview/${page.slug}`}
              target="_blank"
              className="p-2 rounded-md border border-border hover:bg-background text-muted hover:text-foreground transition-colors"
              title="View live"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
          <button
            onClick={handleExport}
            className="p-2 rounded-md border border-border hover:bg-background text-muted hover:text-foreground transition-colors"
            title="Download ZIP"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="p-2 rounded-md border border-border hover:bg-red-500/10 hover:border-red-500/40 text-muted hover:text-red-400 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
