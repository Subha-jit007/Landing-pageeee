"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/client";
import { THEMES } from "@/lib/generator/themes";
import { FONT_PAIRS } from "@/lib/generator/themes";
import type { ThemeKey, FontPairKey, AnimationLevel } from "@/types";

const SUGGESTIONS = [
  "A SaaS platform called Orbit for remote engineering teams",
  "A minimalist coffee subscription service from small-batch roasters",
  "A fitness coaching app focused on strength training",
  "A design agency that builds brands for climate startups",
  "An online course for aspiring frontend developers",
  "A handmade leather goods e-commerce store",
];

export default function GenerationForm({ onDone }: { onDone?: () => void }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [theme, setTheme] = useState<ThemeKey | "">("");
  const [fontPair, setFontPair] = useState<FontPairKey | "">("");
  const [animationLevel, setAnimationLevel] = useState<AnimationLevel>("dynamic");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await apiFetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          theme: theme || undefined,
          fontPair: fontPair || undefined,
          animationLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      onDone?.();
      router.push(`/editor/${data.pageId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-2">Describe your business</label>
        <textarea
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A minimalist note-taking app for writers that focuses on flow state and distraction-free composition..."
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors resize-none"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPrompt(s)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-muted text-muted hover:text-foreground transition-colors"
            >
              {s.split(" ").slice(0, 4).join(" ")}…
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as ThemeKey)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Auto (based on industry)</option>
            {Object.entries(THEMES).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Typography</label>
          <select
            value={fontPair}
            onChange={(e) => setFontPair(e.target.value as FontPairKey)}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Auto (based on industry)</option>
            {Object.entries(FONT_PAIRS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Animation level</label>
        <div className="grid grid-cols-4 gap-2">
          {(["none", "subtle", "dynamic", "bold"] as AnimationLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setAnimationLevel(lvl)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors ${
                animationLevel === lvl
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-surface text-muted hover:border-muted hover:text-foreground"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || prompt.length < 10}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary font-semibold text-white transition-all hover:-translate-y-0.5 disabled:translate-y-0 shadow-lg shadow-primary/20"
      >
        {pending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Forging your page...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generate landing page
          </>
        )}
      </button>
    </form>
  );
}
