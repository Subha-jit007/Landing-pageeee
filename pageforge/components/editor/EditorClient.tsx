"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Globe, Download, Monitor, Tablet, Smartphone,
  Palette, Type, Sparkles, Check, Loader2, ExternalLink, RefreshCw,
  Bold, Italic, Underline, Link as LinkIcon, Trash2, Copy, ArrowUp, ArrowDown,
  Undo2, Redo2, Image as ImageIcon, X,
} from "lucide-react";
import { apiFetch } from "@/lib/client";
import { THEMES, FONT_PAIRS } from "@/lib/generator/themes";
import type { Page, ThemeKey, FontPairKey, AnimationLevel } from "@/types";
import {
  injectEditorRuntime,
  type EditorChildMessage,
  type EditorParentMessage,
  type SelectionInfo,
} from "./editor-runtime";
import { useHistory } from "./useHistory";

type Device = "desktop" | "tablet" | "mobile";
const DEVICE_WIDTHS: Record<Device, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export default function EditorClient({ page: initial }: { page: Page }) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const history = useHistory(initial.htmlContent);
  const [title, setTitle] = useState(initial.title);
  const [device, setDevice] = useState<Device>("desktop");
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [publishing, startPublish] = useTransition();
  const [published, setPublished] = useState(initial.status === "published");
  const [slug, setSlug] = useState(initial.slug);
  const [regenerating, startRegen] = useTransition();
  const [design, setDesign] = useState(initial.designSystem);

  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [hoverSection, setHoverSection] = useState<SelectionInfo | null>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [imageEditorOpen, setImageEditorOpen] = useState(false);
  const [imageValue, setImageValue] = useState("");

  // Track whether the next value change came from the iframe itself,
  // so we don't re-write the iframe and wipe the user's caret.
  const fromIframeRef = useRef(false);
  // Track what HTML has been synced to the server.
  const lastSavedRef = useRef({ html: initial.htmlContent, title: initial.title });
  // Pending getHtml requests, keyed by id.
  const pendingHtmlRef = useRef<Map<number, (html: string) => void>>(new Map());
  const requestIdRef = useRef(0);

  // ─────────────────────────────────────────────────────────────
  // Send message to iframe
  // ─────────────────────────────────────────────────────────────
  const sendToIframe = useCallback((msg: EditorParentMessage) => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(msg, "*");
  }, []);

  const requestHtml = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      const id = ++requestIdRef.current;
      pendingHtmlRef.current.set(id, resolve);
      sendToIframe({ __pf: "parent", type: "getHtml", requestId: id });
      // Safety timeout
      setTimeout(() => {
        const fn = pendingHtmlRef.current.get(id);
        if (fn) { pendingHtmlRef.current.delete(id); resolve(""); }
      }, 1500);
    });
  }, [sendToIframe]);

  // ─────────────────────────────────────────────────────────────
  // Write HTML into the iframe (only when the change is external).
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (fromIframeRef.current) {
      fromIframeRef.current = false;
      return;
    }
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    setIframeReady(false);
    doc.open();
    doc.write(injectEditorRuntime(history.value));
    doc.close();
  }, [history.value]);

  // ─────────────────────────────────────────────────────────────
  // Listen for iframe messages
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      const iframe = iframeRef.current;
      if (!iframe || e.source !== iframe.contentWindow) return;
      const msg = e.data as EditorChildMessage;
      if (!msg || msg.__pf !== "child") return;

      switch (msg.type) {
        case "ready": {
          setIframeReady(true);
          break;
        }
        case "select": {
          setSelection(msg.info);
          if (msg.info.sectionRect && msg.info.sectionPath) {
            setHoverSection(msg.info);
          }
          break;
        }
        case "deselect": {
          setSelection(null);
          setLinkEditorOpen(false);
          setImageEditorOpen(false);
          break;
        }
        case "reposition": {
          setSelection((prev) => (prev ? { ...prev, rect: msg.info.rect, sectionRect: msg.info.sectionRect } : prev));
          setHoverSection((prev) => (prev ? { ...prev, rect: msg.info.rect, sectionRect: msg.info.sectionRect } : prev));
          break;
        }
        case "hover": {
          if (msg.info.sectionRect) setHoverSection(msg.info);
          break;
        }
        case "hoverMove": {
          if (msg.info.sectionRect) setHoverSection(msg.info);
          break;
        }
        case "hoverEnd": {
          if (!selection) setHoverSection(null);
          break;
        }
        case "dirty": {
          const html = await requestHtml();
          if (!html) break;
          fromIframeRef.current = true;
          history.set(html);
          break;
        }
        case "html": {
          const fn = pendingHtmlRef.current.get(msg.requestId);
          if (fn) { pendingHtmlRef.current.delete(msg.requestId); fn(msg.html); }
          break;
        }
        case "undoKey": {
          history.undo();
          break;
        }
        case "redoKey": {
          history.redo();
          break;
        }
        case "requestDelete": {
          sendToIframe({ __pf: "parent", type: "deleteSection", path: msg.path });
          break;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [history, requestHtml, selection, sendToIframe]);

  // ─────────────────────────────────────────────────────────────
  // Global keyboard shortcuts in the parent
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) history.redo(); else history.undo();
      } else if (meta && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        history.redo();
      } else if (e.key === "Escape") {
        sendToIframe({ __pf: "parent", type: "deselect" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [history, sendToIframe]);

  // ─────────────────────────────────────────────────────────────
  // Debounced autosave
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (history.value === lastSavedRef.current.html && title === lastSavedRef.current.title) return;
    const t = setTimeout(async () => {
      setSaving(true);
      const res = await apiFetch(`/api/pages/${initial.id}`, {
        method: "PATCH",
        body: JSON.stringify({ title, htmlContent: history.value }),
      });
      setSaving(false);
      if (res.ok) {
        lastSavedRef.current = { html: history.value, title };
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 1800);
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [history.value, title, initial.id]);

  // ─────────────────────────────────────────────────────────────
  // Publish
  // ─────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────
  // Regenerate via theme/font/animation change
  // ─────────────────────────────────────────────────────────────
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
          history.set(data.htmlContent);
          setSelection(null);
          setHoverSection(null);
          router.refresh();
        }
      });
    },
    [design, history, initial.prompt, router],
  );

  // ─────────────────────────────────────────────────────────────
  // Section-level actions (called from hover chrome or selection)
  // ─────────────────────────────────────────────────────────────
  const doSection = useCallback(
    (path: string, action: "up" | "down" | "duplicate" | "delete") => {
      if (action === "delete") {
        sendToIframe({ __pf: "parent", type: "deleteSection", path });
      } else if (action === "duplicate") {
        sendToIframe({ __pf: "parent", type: "duplicateSection", path });
      } else {
        sendToIframe({ __pf: "parent", type: "moveSection", path, dir: action });
      }
    },
    [sendToIframe],
  );

  const doFormat = useCallback(
    (cmd: string, value?: string) => {
      sendToIframe({ __pf: "parent", type: "formatText", cmd, value });
    },
    [sendToIframe],
  );

  const applyLink = useCallback(() => {
    if (!selection) return;
    doFormat("createLink", linkValue || "#");
    setLinkEditorOpen(false);
  }, [doFormat, linkValue, selection]);

  const applyImage = useCallback(() => {
    if (!selection) return;
    sendToIframe({ __pf: "parent", type: "setSrc", path: selection.path, value: imageValue });
    setImageEditorOpen(false);
  }, [imageValue, selection, sendToIframe]);

  // ─────────────────────────────────────────────────────────────
  // Compute toolbar/chrome positions. Iframe sits inside the white
  // card; the card is position:relative and we render overlays as
  // absolute children. Rects from the iframe are relative to the
  // iframe's own viewport, which is the same visual region.
  // ─────────────────────────────────────────────────────────────
  const textToolbar = useMemo(() => {
    if (!selection || !selection.isText) return null;
    const TW = 320, TH = 40;
    const top = Math.max(8, selection.rect.y - TH - 10);
    const left = Math.max(8, Math.min(selection.rect.x + selection.rect.w / 2 - TW / 2, 10000));
    return { top, left, width: TW };
  }, [selection]);

  const sectionChrome = useMemo(() => {
    const src = selection && selection.sectionRect && selection.sectionPath
      ? selection
      : hoverSection && hoverSection.sectionRect && hoverSection.sectionPath
      ? hoverSection
      : null;
    if (!src || !src.sectionRect || !src.sectionPath) return null;
    return {
      path: src.sectionPath,
      name: src.sectionName ?? "section",
      top: Math.max(6, src.sectionRect.y + 6),
      right: Math.max(6, src.sectionRect.w > 0 ? src.sectionRect.x + src.sectionRect.w - 6 : 6),
    };
  }, [hoverSection, selection]);

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────
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

        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => history.undo()}
            disabled={!history.canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 rounded-md hover:bg-surface text-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => history.redo()}
            disabled={!history.canRedo}
            title="Redo (Ctrl+Shift+Z)"
            className="p-2 rounded-md hover:bg-surface text-muted hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Redo2 className="w-4 h-4" />
          </button>
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

      {/* Main */}
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

          <section className="pt-4 border-t border-border text-[11px] text-muted leading-relaxed">
            <p className="font-semibold text-foreground mb-1">Editor shortcuts</p>
            <ul className="space-y-0.5">
              <li>Click text → edit inline</li>
              <li>Ctrl / ⌘ Z — Undo</li>
              <li>Ctrl / ⌘ Shift Z — Redo</li>
              <li>Esc — Deselect</li>
              <li>Del — Delete selected section</li>
            </ul>
          </section>
        </aside>

        {/* Canvas */}
        <div className="flex-1 bg-background p-6 overflow-auto flex justify-center items-start">
          <div
            ref={canvasRef}
            className="relative bg-white rounded-xl shadow-2xl border border-border overflow-hidden transition-all"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: "100%", minHeight: "calc(100vh - 200px)" }}
          >
            <iframe
              ref={iframeRef}
              title="Page preview"
              sandbox="allow-same-origin allow-scripts"
              className="w-full h-[calc(100vh-160px)] border-0 bg-white"
            />

            {/* Section hover/selection chrome */}
            {iframeReady && sectionChrome && (
              <div
                className="absolute z-20 pointer-events-auto"
                style={{ top: sectionChrome.top, left: sectionChrome.right - 180 }}
              >
                <div className="flex items-center gap-0.5 bg-neutral-900 text-white rounded-lg shadow-xl border border-black/40 px-1 py-1">
                  <span className="text-[10px] uppercase tracking-wide font-semibold text-neutral-400 px-2">
                    {sectionChrome.name}
                  </span>
                  <button
                    title="Move up"
                    onClick={() => doSection(sectionChrome.path, "up")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Move down"
                    onClick={() => doSection(sectionChrome.path, "down")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Duplicate"
                    onClick={() => doSection(sectionChrome.path, "duplicate")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => doSection(sectionChrome.path, "delete")}
                    className="p-1.5 rounded-md hover:bg-red-500/30 text-red-300"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Floating text-formatting toolbar */}
            {iframeReady && textToolbar && selection && (
              <div
                className="absolute z-30"
                style={{ top: textToolbar.top, left: textToolbar.left, width: textToolbar.width }}
              >
                <div className="flex items-center gap-0.5 bg-neutral-900 text-white rounded-lg shadow-xl border border-black/40 px-1 py-1">
                  <button
                    title="Bold"
                    onClick={() => doFormat("bold")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Italic"
                    onClick={() => doFormat("italic")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Underline"
                    onClick={() => doFormat("underline")}
                    className="p-1.5 rounded-md hover:bg-white/10"
                  >
                    <Underline className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-5 bg-white/15 mx-1" />
                  <button
                    title="Add link"
                    onClick={() => {
                      setLinkValue(selection.href ?? "");
                      setLinkEditorOpen(true);
                    }}
                    className={`p-1.5 rounded-md hover:bg-white/10 ${selection.href ? "text-primary" : ""}`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                {linkEditorOpen && (
                  <div className="mt-2 bg-neutral-900 text-white rounded-lg shadow-xl border border-black/40 p-2 flex items-center gap-2">
                    <input
                      autoFocus
                      value={linkValue}
                      onChange={(e) => setLinkValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") applyLink();
                        if (e.key === "Escape") setLinkEditorOpen(false);
                      }}
                      placeholder="https://..."
                      className="flex-1 bg-neutral-800 text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button onClick={applyLink} className="text-xs font-semibold bg-primary px-2 py-1 rounded-md">
                      Apply
                    </button>
                    <button onClick={() => setLinkEditorOpen(false)} className="text-muted hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Image swap popover */}
            {iframeReady && selection && selection.tag === "IMG" && (
              <div
                className="absolute z-30"
                style={{
                  top: Math.max(8, selection.rect.y + selection.rect.h + 8),
                  left: Math.max(8, selection.rect.x),
                }}
              >
                <div className="bg-neutral-900 text-white rounded-lg shadow-xl border border-black/40 p-2 flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5 text-muted" />
                  <input
                    value={imageEditorOpen ? imageValue : (selection.src ?? "")}
                    onFocus={() => {
                      setImageValue(selection.src ?? "");
                      setImageEditorOpen(true);
                    }}
                    onChange={(e) => setImageValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") applyImage();
                      if (e.key === "Escape") setImageEditorOpen(false);
                    }}
                    placeholder="Image URL"
                    className="w-72 bg-neutral-800 text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button onClick={applyImage} className="text-xs font-semibold bg-primary px-2 py-1 rounded-md">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}