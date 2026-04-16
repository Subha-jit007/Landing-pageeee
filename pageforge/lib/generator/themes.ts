// ═══════════════════════════════════════════════════════════════════
// Design system tokens — themes & font pairs
// ═══════════════════════════════════════════════════════════════════
import type { ThemeKey, FontPairKey } from "@/types";

export interface Theme {
  name: string;
  bg: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  accent: string;
  gradient: string;
  isDark: boolean;
}

export const THEMES: Record<ThemeKey, Theme> = {
  "dark-minimal": {
    name: "Dark Minimal",
    bg: "#0a0a0a",
    surface: "#111111",
    border: "#1f1f1f",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    primary: "#ffffff",
    primaryHover: "#e5e5e5",
    accent: "#71717a",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    isDark: true,
  },
  "electric-indigo": {
    name: "Electric Indigo",
    bg: "#0a0a0f",
    surface: "#12121a",
    border: "#1f1f2e",
    text: "#fafafa",
    textMuted: "#9ca3af",
    primary: "#6366f1",
    primaryHover: "#5558e3",
    accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 100%)",
    isDark: true,
  },
  "forest-emerald": {
    name: "Forest Emerald",
    bg: "#0a1410",
    surface: "#102018",
    border: "#1a2e24",
    text: "#f0fdf4",
    textMuted: "#a7c4b1",
    primary: "#10b981",
    primaryHover: "#059669",
    accent: "#34d399",
    gradient: "linear-gradient(135deg, #0a1410 0%, #064e3b 100%)",
    isDark: true,
  },
  "sunset-coral": {
    name: "Sunset Coral",
    bg: "#1a0f0a",
    surface: "#241610",
    border: "#3a2118",
    text: "#fff7ed",
    textMuted: "#fbc9a5",
    primary: "#f97316",
    primaryHover: "#ea580c",
    accent: "#fb923c",
    gradient: "linear-gradient(135deg, #1a0f0a 0%, #7c2d12 100%)",
    isDark: true,
  },
  "bold-monochrome": {
    name: "Bold Monochrome",
    bg: "#fafafa",
    surface: "#ffffff",
    border: "#e5e5e5",
    text: "#0a0a0a",
    textMuted: "#525252",
    primary: "#0a0a0a",
    primaryHover: "#1f1f1f",
    accent: "#404040",
    gradient: "linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)",
    isDark: false,
  },
  "royal-amber": {
    name: "Royal Amber",
    bg: "#110a00",
    surface: "#1a1308",
    border: "#2a1f10",
    text: "#fef3c7",
    textMuted: "#d4a574",
    primary: "#f59e0b",
    primaryHover: "#d97706",
    accent: "#fbbf24",
    gradient: "linear-gradient(135deg, #110a00 0%, #451a03 100%)",
    isDark: true,
  },
  "cyber-neon": {
    name: "Cyber Neon",
    bg: "#050511",
    surface: "#0a0a1f",
    border: "#1f1f3a",
    text: "#e0f2fe",
    textMuted: "#7dd3fc",
    primary: "#06b6d4",
    primaryHover: "#0891b2",
    accent: "#ec4899",
    gradient: "linear-gradient(135deg, #050511 0%, #164e63 50%, #831843 100%)",
    isDark: true,
  },
  "warm-cream": {
    name: "Warm Cream",
    bg: "#fdf8f3",
    surface: "#ffffff",
    border: "#e7dfd3",
    text: "#1c1917",
    textMuted: "#78716c",
    primary: "#c2410c",
    primaryHover: "#9a3412",
    accent: "#b45309",
    gradient: "linear-gradient(135deg, #fdf8f3 0%, #fed7aa 100%)",
    isDark: false,
  },
};

export interface FontPair {
  name: string;
  heading: string;
  body: string;
  /** link tag for external font loading */
  link: string;
}

export const FONT_PAIRS: Record<FontPairKey, FontPair> = {
  "clash-satoshi": {
    name: "Clash Display × Satoshi",
    heading: "'Clash Display', system-ui, sans-serif",
    body: "'Satoshi', system-ui, sans-serif",
    link: '<link href="https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet">',
  },
  "cabinet-satoshi": {
    name: "Cabinet Grotesk × Satoshi",
    heading: "'Cabinet Grotesk', system-ui, sans-serif",
    body: "'Satoshi', system-ui, sans-serif",
    link: '<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800&f[]=satoshi@400,500,700&display=swap" rel="stylesheet">',
  },
  "serif-elegant": {
    name: "Fraunces × Inter",
    heading: "'Fraunces', Georgia, serif",
    body: "'Inter', system-ui, sans-serif",
    link: '<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">',
  },
  "geometric-modern": {
    name: "Space Grotesk × Inter",
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    link: '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">',
  },
  "editorial-bold": {
    name: "Playfair × Source Sans",
    heading: "'Playfair Display', Georgia, serif",
    body: "'Source Sans 3', system-ui, sans-serif",
    link: '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700;900&family=Source+Sans+3:wght@400;500;600&display=swap" rel="stylesheet">',
  },
};
