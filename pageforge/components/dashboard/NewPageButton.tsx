"use client";
import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import GenerationForm from "@/components/generation/GenerationForm";

export default function NewPageButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
      >
        <Plus className="w-4 h-4" />
        New page
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl animate-scale-in"
          >
            <div className="sticky top-0 flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur border-b border-border z-10">
              <div>
                <h2 className="font-display text-xl font-semibold">Generate a new page</h2>
                <p className="text-xs text-muted">Describe your business. We&apos;ll handle the rest.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-surface text-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <GenerationForm onDone={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
