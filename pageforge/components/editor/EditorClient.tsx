"use client";
import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Globe, Download, Monitor, Tablet, Smartphone,
  Palette, Type, Sparkles, Check, Loader2, ExternalLink, RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/lib/client";
import { THEMES, FONT_PAIRS } from "@/lib/generator/themes";
import type { Page, ThemeKey, FontPairKey, AnimationLevel } from "@/types";

type Device = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function EditorClient({ page: initial }: { page: Page }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [html, setHtml] = useState(initial.htmlContent);
  const [title, setTitle] = useState(initial.title);
  const [device, setDevice] = useState<Device>("desktop");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [publishing, startPublish] = useTransition();
  const [published, setPublished] = useState(initial.status === "published");
  const [slug, setSlug] = useState(initial.slug);
  const [regenerating, startRegen] = useTransition();
  const [design, setDesign] = useState(initial.designSystem);

  // Inject HTML into the iframe whenever it changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [html]);

  // Debounced autosave
  useEffect(() => {
    if (html === initial.htmlContent && title === initial.title) return;
    const t = setTimeout(async () => {
      setSaving(true);
      await apiFetch(`/api/pages/${initial.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, htmlContent: html }),
      });
      setSaving(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 2000);
    }, 1500);
    return () => clearTimeout(t);
  }, [html, title, initial.id, initial.htmlContent, initial.title]);

  const handlePublish = useCallback(() => {
    startPublish(async () => {
      const res = await apiFetch("/api/publish", {
        method: "POST",
        body: JSON.stringify({ pageId: initial.id }),
      });
      const data = await res.json();
      if (res.ok && data.page) {
        setPublished(true);
        setSlug(data.page.slug);
      }
    });
  }, [initial.id]);

  const handleRegenerate = useCallback(
    (updates: Partial<typeof design>) => {
      const nextDesign = { ...design, ...updates };
      setDesign(nextDesign);
      startRegen(async () => {
        const res = await apiFetch("/api/generate", {
          method: "POST",
          body: JSON.stringify({
            prompt: initial.prompt,
            theme: nextDesign.theme,
            fontPair: nextDesign.fontPair,
            animationLevel: nextDesign.animationLevel,
          }),
        });
        const data = await res.json();
        if (res.ok && data.htmlContent) {
          setHtml(data.htmlContent);
          router.refresh();
        }
      });
    },
    [design, initial.prompt, router],
  );

  return (
    <div className="h-[calc(100vh-61px)] flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface/50">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 bg-transparent font-display font-semibold text-lg focus:outline-none focus:bg-surface px-2 py-1 rounded-md max-w-md truncate"
          />
          <div className="text-xs text-muted min-w-[90px]">
            {saving ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" /> Saving
              </span>
            ) : justSaved ? (
              <span className="flex items-center gap-1.5 text-green-400">
                <Check className="w-3 h-3" /> Saved
              </span>
            ) : (
              <span>Auto-saved</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface rounded-lg p-1 mr-3">
          {(["desktop", "tablet", "mobile"] as Device[]).map((d) => {
            const Icon = d === "desktop" ? Monitor : d === "tablet" ? Tablet : Smartphone;
            return (
              <button
                key={d}
                onClick={() => setDevice(d)}
                className={`p-1.5 rounded-md transition-colors ${
                  device === d ? "bg-background text-foreground" : "text-muted hover:text-foreground"
                }`}
                title={d}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => (window.location.href = `/api/export?pageId=${initial.id}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border hover:bg-surface text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">ZIP</span>
          </button>
          {published && slug ? (
            <Link
              href={`/preview/${slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-semibold hover:bg-green-500/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden md:inline">Live</span>
            </Link>
          ) : (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {publishing ? "Publishing" : "Publish"}
            </button>
          )}
        </div>
      </div>

      {/* Main: left rail + preview */}
      <div className="flex-1 flex min-h-0">
        {/* Design panel */}
        <aside className="w-72 border-r border-border bg-surface/30 overflow-y-auto p-5 space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Theme</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(THEMES).map(([k, v]) => (
                <button
                  key={k}
                  disabled={regenerating}
                  onClick={() => handleRegenerate({ theme: k as ThemeKey })}
                  className={`text-left rounded-lg border overflow-hidden hover:scale-[1.02] transition-transform disabled:opacity-50 ${
                    design.theme === k ? "border-primary ring-2 ring-primary/30" : "border-border"
                  }`}
                >
                  <div className="h-10" style={{ background: v.gradient }} />
                  <div className="px-2 py-1.5 bg-background text-[11px] font-medium truncate">
                    {v.name}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Type className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Typography</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(FONT_PAIRS).map(([k, v]) => (
                <button
                  key={k}
                  disabled={regenerating}
                  onClick={() => handleRegenerate({ fontPair: k as FontPairKey })}
                  className={`w-full text-left rounded-lg border px-3 py-2 hover:border-muted transition-colors disabled:opacity-50 ${
                    design.fontPair === k ? "border-primary bg-primary/5" : "border-border bg-background"
                  }`}
                >
                  <div className="text-xs font-medium">{v.name}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Animation</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["none", "subtle", "dynamic", "bold"] as AnimationLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  disabled={regenerating}
                  onClick={() => handleRegenerate({ animationLevel: lvl })}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors disabled:opacity-50 ${
                    design.animationLevel === lvl
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-muted hover:border-muted hover:text-foreground"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-border">
            <button
              disabled={regenerating}
              onClick={() => handleRegenerate({})}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border hover:bg-surface text-sm font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin" : ""}`} />
              Regenerate page
            </button>
            <p className="text-[11px] text-muted mt-2 leading-relaxed">
              Using the same prompt with your current style selections.
            </p>
          </section>
        </aside>

        {/* Preview area */}
        <div className="flex-1 bg-background p-6 overflow-auto flex justify-center items-start">
          <div
            className="bg-white rounded-xl shadow-2xl border border-border overflow-hidden transition-all"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", minHeight: "calc(100vh - 200px)" }}
          >
            <iframe
              ref={iframeRef}
              title="Page preview"
              sandbox="allow-same-origin allow-scripts"
              className="w-full h-[calc(100vh-160px)] border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
