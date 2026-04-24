// ═══════════════════════════════════════════════════════════════════
// Generator orchestrator
// Assembles a complete, premium HTML landing page from a user prompt.
// This is the "AI" of PageForge — entirely deterministic, zero API keys.
// ═══════════════════════════════════════════════════════════════════
import { THEMES, FONT_PAIRS, type Theme, type FontPair } from "./themes";
import { extractContent, type BusinessContent } from "./content";
import {
  renderNavbar,
  renderHero,
  renderLogos,
  renderFeatures,
  renderStats,
  renderTestimonials,
  renderPricing,
  renderFAQ,
  renderCTA,
  renderFooter,
} from "./sections";
import type { ThemeKey, FontPairKey, AnimationLevel, DesignSystem } from "@/types";

export interface GenerateOptions {
  prompt: string;
  theme?: ThemeKey;
  fontPair?: FontPairKey;
  animationLevel?: AnimationLevel;
  industry?: string;
}

export interface GeneratedPage {
  html: string;
  title: string;
  designSystem: DesignSystem;
  content: BusinessContent;
}

function pickTheme(content: BusinessContent, override?: ThemeKey): ThemeKey {
  if (override) return override;
  const map: Record<string, ThemeKey> = {
    saas: "electric-indigo",
    ecommerce: "warm-cream",
    agency: "dark-minimal",
    fitness: "bold-monochrome",
    food: "sunset-coral",
    education: "forest-emerald",
    finance: "royal-amber",
    portfolio: "dark-minimal",
    nonprofit: "forest-emerald",
    realestate: "warm-cream",
  };
  return map[content.industry] ?? "electric-indigo";
}

function pickFontPair(content: BusinessContent, override?: FontPairKey): FontPairKey {
  if (override) return override;
  const map: Record<string, FontPairKey> = {
    saas: "clash-satoshi",
    ecommerce: "editorial-bold",
    agency: "clash-satoshi",
    fitness: "geometric-modern",
    food: "serif-elegant",
    education: "cabinet-satoshi",
    finance: "geometric-modern",
    portfolio: "clash-satoshi",
    nonprofit: "serif-elegant",
    realestate: "editorial-bold",
  };
  return map[content.industry] ?? "clash-satoshi";
}

function buildAnimationScript(level: AnimationLevel): string {
  if (level === "none") return "";

  const stagger = level === "bold" ? 0.1 : level === "dynamic" ? 0.08 : 0.06;
  const duration = level === "bold" ? 1.2 : level === "dynamic" ? 0.9 : 0.7;

  return `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js"></script>
<script>
  // Smooth scroll with Lenis
  const lenis = new Lenis({ duration: 1.1, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);

  // GSAP scroll-triggered reveals
  gsap.registerPlugin(ScrollTrigger);

  // Set initial state for all animated elements (prevents flash)
  gsap.set('[data-gsap="fade-up"]', { opacity: 0, y: 28 });

  // Animate sections as they scroll into view
  document.querySelectorAll('[data-section]').forEach((section) => {
    const items = section.querySelectorAll('[data-gsap="fade-up"]');
    if (items.length === 0) return;
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: ${duration},
      stagger: ${stagger},
      ease: "power3.out",
      scrollTrigger: { trigger: section, start: "top 82%", once: true }
    });
  });

  // Hero elements animate on load
  const hero = document.querySelector('[data-section="hero"]');
  if (hero) {
    gsap.to(hero.querySelectorAll('[data-gsap="fade-up"]'), {
      opacity: 1,
      y: 0,
      duration: ${duration},
      stagger: ${stagger},
      ease: "power3.out",
      delay: 0.1
    });
  }
</script>`;
}

/**
 * Wrap sections into a full HTML document.
 */
function wrapPage(
  sections: string,
  theme: Theme,
  fontPair: FontPair,
  animationScript: string,
  title: string,
  description: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  ${fontPair.link}
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: ${fontPair.body};
      background: ${theme.bg};
      color: ${theme.text};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.5;
    }
    :root {
      --font-heading: ${fontPair.heading};
      --font-body: ${fontPair.body};
      --color-primary: ${theme.primary};
      --color-bg: ${theme.bg};
      --color-text: ${theme.text};
    }
    h1, h2, h3, h4, h5, h6 { font-family: ${fontPair.heading}; }
    a { color: inherit; }
    img { max-width: 100%; height: auto; display: block; }
    ::selection { background: ${theme.primary}; color: ${theme.isDark ? "#000" : "#fff"}; }
    details > summary::-webkit-details-marker { display: none; }
    details[open] summary svg { transform: rotate(180deg); }
    @media (max-width: 768px) {
      [data-section="navbar"] > div > div:last-child a:not(:last-child) { display: none; }
    }
  </style>
</head>
<body>
${sections}
${animationScript}
</body>
</html>`;
}

/**
 * Main entry point: turn a user prompt into a complete landing page.
 */
export function generatePage(opts: GenerateOptions): GeneratedPage {
  const animationLevel = opts.animationLevel ?? "dynamic";
  const content = extractContent(opts.prompt, opts.industry);
  const themeKey = pickTheme(content, opts.theme);
  const fontPairKey = pickFontPair(content, opts.fontPair);
  const theme = THEMES[themeKey];
  const fontPair = FONT_PAIRS[fontPairKey];

  const sections: string[] = [
    renderNavbar(theme, content),
    renderHero(theme, content),
    renderLogos(theme),
    renderFeatures(theme, content),
    renderStats(theme, content),
    renderTestimonials(theme, content),
    renderPricing(theme, content),
    renderFAQ(theme, content),
    renderCTA(theme, content),
    renderFooter(theme, content),
  ];

  const title = `${content.productName} — ${content.tagline}`;
  const description = content.heroSubhead;
  const animationScript = buildAnimationScript(animationLevel);

  const html = wrapPage(sections.join("\n"), theme, fontPair, animationScript, title, description);

  const designSystem: DesignSystem = {
    theme: themeKey,
    fontPair: fontPairKey,
    animationLevel,
    sections: ["navbar", "hero", "logos", "features", "stats", "testimonials", "pricing", "faq", "cta", "footer"],
  };

  return { html, title, designSystem, content };
}
