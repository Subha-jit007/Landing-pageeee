// ═══════════════════════════════════════════════════════════════════
// PageForge AI — Type Definitions
// ═══════════════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  plan: "free" | "starter" | "pro";
  generationsUsed: number;
  generationsLimit: number;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  plan: User["plan"];
  generationsUsed: number;
  generationsLimit: number;
}

export interface Page {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  htmlContent: string;
  designSystem: DesignSystem;
  status: "draft" | "published";
  slug: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface DesignSystem {
  theme: ThemeKey;
  fontPair: FontPairKey;
  animationLevel: AnimationLevel;
  sections: SectionType[];
}

export type ThemeKey =
  | "dark-minimal"
  | "electric-indigo"
  | "forest-emerald"
  | "sunset-coral"
  | "bold-monochrome"
  | "royal-amber"
  | "cyber-neon"
  | "warm-cream";

export type FontPairKey =
  | "clash-satoshi"
  | "cabinet-satoshi"
  | "serif-elegant"
  | "geometric-modern"
  | "editorial-bold";

export type AnimationLevel = "none" | "subtle" | "dynamic" | "bold";

export type SectionType =
  | "navbar"
  | "hero"
  | "logos"
  | "features"
  | "bento"
  | "stats"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "footer";

export interface Session {
  userId: string;
  email: string;
  exp: number;
}

export interface GenerationRequest {
  prompt: string;
  theme?: ThemeKey;
  fontPair?: FontPairKey;
  animationLevel?: AnimationLevel;
  industry?: string;
}

export interface ApiError {
  error: string;
  code?: string;
}
