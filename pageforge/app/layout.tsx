import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PageForge AI — Premium landing pages in 10 seconds",
  description: "Generate beautiful, animated, fully-editable landing pages from a single prompt. Zero API keys required.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="grain min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
