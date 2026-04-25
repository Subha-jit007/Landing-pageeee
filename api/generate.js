// Deterministic landing page generator. No API keys, no external LLM.
// Given a prompt, infers industry + product name and assembles a complete
// themed HTML document from curated content pools and section renderers.

// ─────────────────────────────────────────────────────────────
// Themes
// ─────────────────────────────────────────────────────────────
const THEMES = {
  "dark-minimal": {
    name: "Dark Minimal",
    bg: "#0a0a0a", surface: "#111111", border: "#1f1f1f",
    text: "#fafafa", textMuted: "#a1a1aa",
    primary: "#ffffff", primaryHover: "#e5e5e5", accent: "#71717a",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
    isDark: true,
  },
  "electric-indigo": {
    name: "Electric Indigo",
    bg: "#0a0a0f", surface: "#12121a", border: "#1f1f2e",
    text: "#fafafa", textMuted: "#9ca3af",
    primary: "#6366f1", primaryHover: "#5558e3", accent: "#8b5cf6",
    gradient: "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 100%)",
    isDark: true,
  },
  "forest-emerald": {
    name: "Forest Emerald",
    bg: "#0a1410", surface: "#102018", border: "#1a2e24",
    text: "#f0fdf4", textMuted: "#a7c4b1",
    primary: "#10b981", primaryHover: "#059669", accent: "#34d399",
    gradient: "linear-gradient(135deg, #0a1410 0%, #064e3b 100%)",
    isDark: true,
  },
  "sunset-coral": {
    name: "Sunset Coral",
    bg: "#1a0f0a", surface: "#241610", border: "#3a2118",
    text: "#fff7ed", textMuted: "#fbc9a5",
    primary: "#f97316", primaryHover: "#ea580c", accent: "#fb923c",
    gradient: "linear-gradient(135deg, #1a0f0a 0%, #7c2d12 100%)",
    isDark: true,
  },
  "bold-monochrome": {
    name: "Bold Monochrome",
    bg: "#fafafa", surface: "#ffffff", border: "#e5e5e5",
    text: "#0a0a0a", textMuted: "#525252",
    primary: "#0a0a0a", primaryHover: "#1f1f1f", accent: "#404040",
    gradient: "linear-gradient(135deg, #fafafa 0%, #e5e5e5 100%)",
    isDark: false,
  },
  "royal-amber": {
    name: "Royal Amber",
    bg: "#110a00", surface: "#1a1308", border: "#2a1f10",
    text: "#fef3c7", textMuted: "#d4a574",
    primary: "#f59e0b", primaryHover: "#d97706", accent: "#fbbf24",
    gradient: "linear-gradient(135deg, #110a00 0%, #451a03 100%)",
    isDark: true,
  },
  "cyber-neon": {
    name: "Cyber Neon",
    bg: "#050511", surface: "#0a0a1f", border: "#1f1f3a",
    text: "#e0f2fe", textMuted: "#7dd3fc",
    primary: "#06b6d4", primaryHover: "#0891b2", accent: "#ec4899",
    gradient: "linear-gradient(135deg, #050511 0%, #164e63 50%, #831843 100%)",
    isDark: true,
  },
  "warm-cream": {
    name: "Warm Cream",
    bg: "#fdf8f3", surface: "#ffffff", border: "#e7dfd3",
    text: "#1c1917", textMuted: "#78716c",
    primary: "#c2410c", primaryHover: "#9a3412", accent: "#b45309",
    gradient: "linear-gradient(135deg, #fdf8f3 0%, #fed7aa 100%)",
    isDark: false,
  },
};

const FONT_PAIRS = {
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

// ─────────────────────────────────────────────────────────────
// Content extraction
// ─────────────────────────────────────────────────────────────
const INDUSTRY_KEYWORDS = {
  saas: ["saas","software","app","platform","tool","dashboard","api","automation","workflow","productivity"],
  ecommerce: ["shop","store","buy","sell","product","ecommerce","retail","shopify","merchandise","ceramics","handmade"],
  agency: ["agency","studio","consulting","services","clients","marketing","design agency"],
  fitness: ["fitness","workout","gym","training","exercise","health","wellness","yoga","pilates"],
  food: ["restaurant","food","cafe","menu","chef","cuisine","dining","bakery","coffee","roaster"],
  education: ["course","learn","education","training","student","school","academy","tutorial","bootcamp"],
  finance: ["finance","bank","invest","crypto","trading","money","payment","wallet","fintech"],
  portfolio: ["portfolio","freelance","designer","developer","artist","photographer"],
  nonprofit: ["nonprofit","charity","foundation","mission","donate","cause"],
  realestate: ["real estate","property","house","rent","apartment","realtor"],
};

const ICON = {
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
};

const TAGLINES = {
  saas: ["Built for builders.","Ship faster. Sleep better.","The modern way to work.","Work without the friction."],
  ecommerce: ["Shop what you love.","Crafted with care.","For every taste, every moment.","Made to be loved."],
  agency: ["Ideas that move markets.","Design with intention.","Your vision, amplified.","We turn ambition into impact."],
  fitness: ["Train smarter. Live stronger.","Your strongest self awaits.","Move with purpose.","Built for the long run."],
  food: ["Fresh from the source.","Every bite, a moment.","Crafted daily.","Taste, perfected."],
  education: ["Learn without limits.","Your next chapter starts here.","Knowledge that compounds.","Master what matters."],
  finance: ["Money, made simple.","Finance without the friction.","Your wealth, your way.","Built for the new economy."],
  portfolio: ["Selected works.","Design & development.","Making things that matter.","Digital craftsmanship."],
  nonprofit: ["Together, we go further.","Change starts with you.","Impact, measured.","A mission worth joining."],
  realestate: ["Your next home awaits.","Where stories begin.","Spaces that inspire.","Home, reimagined."],
};

const HEADLINES = {
  saas: ["The operating system for modern teams.","Everything your team needs. Nothing they don't.","Stop stitching tools. Start shipping.","Built for the way you actually work."],
  ecommerce: ["Objects of everyday beauty.","Designed to last. Made to love.","Timeless pieces, delivered worldwide.","Quality you can feel."],
  agency: ["We design brands that behave like products.","Strategy, design, and code — under one roof.","Your brand, done right.","Creative work with commercial impact."],
  fitness: ["Your strongest year is ahead.","Training that works as hard as you do.","Stronger. Leaner. Faster.","Built for athletes. Loved by everyone."],
  food: ["Honest food, made with love.","A table set for every moment.","Flavor, the way it was meant to be.","Every ingredient has a story."],
  education: ["Skills that change careers.","The shortcut you've been looking for.","Learn from operators, not influencers.","Real skills. Real outcomes."],
  finance: ["Your money, working harder.","Finance, finally on your side.","Simple tools for serious money.","Built for the way money works now."],
  portfolio: ["I build interfaces people love to use.","A small studio with a big obsession.","Selected work, shared honestly.","Design-led. Engineering-proud."],
  nonprofit: ["Small actions, measurable change.","A movement worth joining.","Change what can be changed.","Impact, one donation at a time."],
  realestate: ["Homes that tell your story.","Find the one. Love the one.","Your space, your rules.","The modern way to find home."],
};

const FEATURES_BY_INDUSTRY = {
  saas: [
    { title: "Real-time collaboration", description: "Work with your team in the same space, at the same time, without the chaos.", icon: "users" },
    { title: "Built-in automation", description: "Let the routine run itself. Your team focuses on what actually matters.", icon: "zap" },
    { title: "Insights that act", description: "Dashboards that don't just show numbers — they surface the next move.", icon: "chart" },
    { title: "Enterprise-grade security", description: "SOC 2 Type II, SSO, audit logs. Everything you need, nothing to configure.", icon: "shield" },
    { title: "Works with your stack", description: "Native integrations with every tool your team already uses.", icon: "layers" },
    { title: "Global by default", description: "Edge-served from 200+ cities. Fast for every customer, everywhere.", icon: "globe" },
  ],
  ecommerce: [
    { title: "Curated collections", description: "Each piece is chosen, not stocked. Quality over quantity.", icon: "heart" },
    { title: "Free worldwide shipping", description: "On orders over $100. Tracked, insured, carbon-offset.", icon: "globe" },
    { title: "Made to last", description: "Materials we'd put in our own homes. Guaranteed for life.", icon: "shield" },
    { title: "Human support", description: "Real people, real answers, no chatbots. Available 7 days a week.", icon: "users" },
    { title: "30-day trial", description: "Try it in your space. Love it or send it back — on us.", icon: "heart" },
    { title: "Thoughtfully sourced", description: "We know every maker by name. You will too.", icon: "layers" },
  ],
  agency: [
    { title: "Brand strategy", description: "Positioning, messaging, and visual identity that make you the obvious choice.", icon: "zap" },
    { title: "Product design", description: "Interfaces that feel inevitable once you've used them.", icon: "layers" },
    { title: "Web & app development", description: "Hand-crafted code, built for performance and scale.", icon: "cpu" },
    { title: "Motion & interaction", description: "The micro-moments that turn visits into memories.", icon: "bolt" },
    { title: "Creative direction", description: "A steady hand on the tiller when everything's moving fast.", icon: "shield" },
    { title: "Launch support", description: "Go-to-market that actually goes to market.", icon: "globe" },
  ],
};

function detectIndustry(prompt) {
  const lower = prompt.toLowerCase();
  for (const key of Object.keys(INDUSTRY_KEYWORDS)) {
    if (INDUSTRY_KEYWORDS[key].some((kw) => lower.includes(kw))) return key;
  }
  return "saas";
}

// Curated set of plausible 1-2 syllable brand names. We never use the
// literal first word of the prompt as a brand — it produced gems like
// "Saas" and "Artisanal" as company names.
const BRAND_NAMES = [
  "Atlas","Aero","Arc","Beacon","Brio","Canvas","Cedar","Cinder","Compass","Cove",
  "Crest","Cypress","Drift","Echo","Ember","Fable","Forge","Frame","Gravity","Halo",
  "Harbor","Helix","Hush","Ivy","Junction","Kepler","Lattice","Linden","Loft","Loom",
  "Lumen","Mantle","Maple","Mesa","Mira","Moss","North","Nova","Oak","Onyx",
  "Orbit","Pace","Pact","Parallel","Pebble","Pine","Plume","Polar","Praxis","Quartz",
  "Ravel","Rivet","Sable","Sage","Shore","Slate","Sonder","Spark","Stack","Stellar",
  "Tally","Tempo","Terra","Tilt","Timber","Tonic","Trail","Tribe","Vail","Vector",
  "Vela","Vesper","Vine","Vista","Volt","Wake","Wander","Wedge","Whim","Yield","Zenith",
];

function extractProductName(prompt, seed) {
  // Honor explicit naming: "called X" or "named X"
  const called = prompt.match(/(?:called|named)\s+["']?([A-Z][\w\s]{2,30})["']?/i);
  if (called) return called[1].trim();
  // Otherwise pick a brand name deterministically from the curated pool
  // (prompt-seeded so it stays stable per-prompt, varies per session via variantSeed).
  const idx = Math.abs(seed | 0) % BRAND_NAMES.length;
  return BRAND_NAMES[idx];
}

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}
const pick = (arr, seed) => arr[Math.abs(seed) % arr.length];

function slugify(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "brand";
}

function extractContent(prompt, providedIndustry, extraSeed) {
  const industry = providedIndustry || detectIndustry(prompt);
  const seed = seedFrom(prompt) ^ (extraSeed | 0);
  const productName = extractProductName(prompt, seed);

  const featurePool = FEATURES_BY_INDUSTRY[industry] || FEATURES_BY_INDUSTRY.saas;
  const headlinePool = HEADLINES[industry] || HEADLINES.saas;
  const taglinePool = TAGLINES[industry] || TAGLINES.saas;

  const heroHeadline = pick(headlinePool, seed);
  const tagline = pick(taglinePool, seed + 1);

  const label = industry === "saas" ? "platform" : industry === "agency" ? "studio" : "brand";
  const heroSubhead = `${productName} is the ${label} ${
    industry === "saas"
      ? "teams use to ship what matters — faster, with less noise, and without the tool sprawl."
      : "trusted by people who care about the details."
  }`;

  const features = featurePool.slice(0, 6).map((f) => ({
    title: f.title, description: f.description, icon: ICON[f.icon],
  }));

  const stats = [
    { value: "10k+", label: "Active users" },
    { value: "99.99%", label: "Uptime" },
    { value: "4.9", label: "Average rating" },
    { value: "<50ms", label: "Response time" },
  ];

  const testimonials = [
    { quote: `${productName} replaced four tools we were paying for and somehow made our team faster at the same time. Genuinely didn't expect that.`, author: "Sarah Chen", role: "VP Engineering, Lattice", initials: "SC" },
    { quote: "The onboarding took ten minutes. The payback took a week. We use it every day now.", author: "Marcus Whitfield", role: "Founder, Forge Labs", initials: "MW" },
    { quote: "What I like most is what's missing — no clutter, no feature creep. Just the things that matter, done beautifully.", author: "Aisha Patel", role: "Head of Design, Northwind", initials: "AP" },
  ];

  const pricingPlans = [
    { name: "Starter", price: "$0", period: "forever", description: "For individuals getting started.", features: ["Up to 3 projects","Core features","Community support","Standard templates"], featured: false, cta: "Start free" },
    { name: "Pro", price: "$29", period: "per month", description: "For growing teams and serious builders.", features: ["Unlimited projects","All integrations","Priority support","Custom domain","Advanced analytics","API access"], featured: true, cta: "Start 14-day trial" },
    { name: "Scale", price: "Custom", period: "let's talk", description: "For teams with specific needs.", features: ["Everything in Pro","SSO & SAML","Dedicated support","Custom integrations","SLA","On-prem option"], featured: false, cta: "Contact sales" },
  ];

  const faqs = [
    { question: `What makes ${productName} different?`, answer: "We focus on the essentials and execute them exceptionally well. No feature bloat, no learning curve, no monthly surprise invoices." },
    { question: "Can I cancel anytime?", answer: "Yes. There are no contracts, no cancellation fees, and your data is exportable in one click." },
    { question: "Do you offer a free trial?", answer: "The Starter plan is free forever. Pro comes with a 14-day trial — no credit card required." },
    { question: "Is my data secure?", answer: "Yes. We're SOC 2 Type II certified, all data is encrypted at rest and in transit, and we never train models on your data." },
    { question: "What's your support like?", answer: "Real humans, real answers. Median response time is under 2 hours during business days." },
    { question: "Can I migrate from another tool?", answer: "Absolutely. We have importers for most major tools and our team will help you migrate at no cost." },
  ];

  return {
    productName, tagline, heroHeadline, heroSubhead,
    primaryCta: industry === "ecommerce" ? "Shop the collection" : industry === "agency" ? "Start a project" : "Get started free",
    secondaryCta: "See how it works",
    features, stats, testimonials, pricingPlans, faqs, industry,
    logoLetter: productName.charAt(0).toUpperCase(),
    seed,
  };
}

// ─────────────────────────────────────────────────────────────
// Section renderers
// ─────────────────────────────────────────────────────────────
const rgba = (hex, alpha) => {
  const h = hex.replace("#","");
  const r = parseInt(h.slice(0,2),16);
  const g = parseInt(h.slice(2,4),16);
  const b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${alpha})`;
};

function renderNavbar(t, c) {
  return `
<nav style="position:fixed;top:0;left:0;right:0;z-index:50;backdrop-filter:blur(16px);background:${rgba(t.bg,0.75)};border-bottom:1px solid ${t.border};" data-section="navbar">
  <div style="max-width:1280px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;">
    <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:${t.text};">
      <div style="width:32px;height:32px;border-radius:8px;background:${t.primary};display:flex;align-items:center;justify-content:center;color:${t.isDark?"#000":"#fff"};font-weight:700;font-family:var(--font-heading);">${c.logoLetter}</div>
      <span style="font-family:var(--font-heading);font-weight:600;font-size:18px;letter-spacing:-0.01em;">${c.productName}</span>
    </a>
    <div style="display:flex;align-items:center;gap:32px;">
      <a href="#features" style="color:${t.textMuted};text-decoration:none;font-size:14px;font-weight:500;">Features</a>
      <a href="#pricing" style="color:${t.textMuted};text-decoration:none;font-size:14px;font-weight:500;">Pricing</a>
      <a href="#faq" style="color:${t.textMuted};text-decoration:none;font-size:14px;font-weight:500;">FAQ</a>
      <a href="#cta" style="background:${t.primary};color:${t.isDark?"#000":"#fff"};text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;">${c.primaryCta}</a>
    </div>
  </div>
</nav>`;
}

function renderHero(t, c) {
  return `
<section style="position:relative;padding:180px 32px 120px;overflow:hidden;" data-section="hero">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%, ${rgba(t.primary,0.15)} 0%, transparent 70%);pointer-events:none;"></div>
  <div style="max-width:900px;margin:0 auto;text-align:center;position:relative;">
    <div data-gsap="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:1px solid ${t.border};border-radius:999px;background:${rgba(t.surface,0.5)};margin-bottom:32px;">
      <span style="width:6px;height:6px;border-radius:50%;background:${t.primary};box-shadow:0 0 12px ${t.primary};"></span>
      <span style="font-size:13px;color:${t.textMuted};font-weight:500;">${c.tagline}</span>
    </div>
    <h1 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(40px, 7vw, 80px);font-weight:600;line-height:1.02;letter-spacing:-0.03em;color:${t.text};margin:0 0 24px;">${c.heroHeadline}</h1>
    <p data-gsap="fade-up" style="font-size:clamp(17px, 2vw, 20px);line-height:1.5;color:${t.textMuted};max-width:640px;margin:0 auto 48px;">${c.heroSubhead}</p>
    <div data-gsap="fade-up" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#cta" style="background:${t.primary};color:${t.isDark?"#000":"#fff"};text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;display:inline-flex;align-items:center;gap:8px;">${c.primaryCta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <a href="#features" style="background:transparent;color:${t.text};text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid ${t.border};">${c.secondaryCta}</a>
    </div>
  </div>
  <div data-gsap="fade-up" style="max-width:1100px;margin:80px auto 0;position:relative;">
    <div style="position:absolute;inset:-40px;background:radial-gradient(60% 60% at 50% 30%, ${rgba(t.primary,0.22)} 0%, transparent 70%);pointer-events:none;filter:blur(20px);"></div>
    <div style="position:relative;aspect-ratio:16/10;border-radius:16px;background:${t.surface};border:1px solid ${t.border};overflow:hidden;box-shadow:0 30px 60px -20px ${rgba("#000000",0.55)};">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${rgba(t.primary,0.18)}, ${rgba(t.accent,0.08)});"></div>
      <div style="position:absolute;top:14px;left:16px;display:flex;gap:6px;z-index:2;">
        <span style="width:11px;height:11px;border-radius:50%;background:#ff5f57;"></span>
        <span style="width:11px;height:11px;border-radius:50%;background:#febc2e;"></span>
        <span style="width:11px;height:11px;border-radius:50%;background:#28c840;"></span>
      </div>
      <div style="position:absolute;top:14px;left:80px;right:80px;height:22px;border-radius:6px;background:${rgba(t.bg,0.35)};border:1px solid ${rgba(t.border,0.5)};"></div>
      <div style="position:absolute;inset:48px 20px 20px;display:grid;grid-template-columns:200px 1fr;gap:14px;">
        <div style="background:${rgba(t.bg,0.55)};border:1px solid ${t.border};border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:9px;">
          <div style="height:9px;width:55%;border-radius:3px;background:${t.primary};opacity:0.9;"></div>
          ${[68,52,72,46,60,38,64].map((w)=>`<div style="height:8px;width:${w}%;border-radius:3px;background:${rgba(t.text,0.18)};"></div>`).join("")}
        </div>
        <div style="background:${rgba(t.bg,0.55)};border:1px solid ${t.border};border-radius:10px;padding:18px;display:flex;flex-direction:column;gap:14px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div style="height:14px;width:36%;border-radius:3px;background:${t.text};opacity:0.85;"></div>
            <div style="height:22px;width:80px;border-radius:6px;background:${t.primary};"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;">
            ${[1,2,3].map(()=>`<div style="aspect-ratio:1.4;background:${rgba(t.text,0.08)};border:1px solid ${rgba(t.border,0.6)};border-radius:8px;padding:10px;display:flex;flex-direction:column;justify-content:space-between;"><div style="height:6px;width:50%;background:${rgba(t.text,0.3)};border-radius:2px;"></div><div style="height:14px;width:38%;background:${t.primary};border-radius:3px;"></div></div>`).join("")}
          </div>
          <div style="flex:1;background:${rgba(t.text,0.06)};border:1px solid ${rgba(t.border,0.5)};border-radius:8px;position:relative;overflow:hidden;">
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;">
              <path d="M0,50 L20,40 L40,42 L60,28 L80,30 L100,18 L120,22 L140,12 L160,16 L180,8 L200,12 L200,60 L0,60 Z" fill="${rgba(t.primary,0.25)}"/>
              <path d="M0,50 L20,40 L40,42 L60,28 L80,30 L100,18 L120,22 L140,12 L160,16 L180,8 L200,12" stroke="${t.primary}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderLogos(t) {
  const logos = ["NORTHWIND","FORGE","ORBIT","KEEPLEY","MANTRA","VANTAGE"];
  return `
<section style="padding:60px 32px;border-top:1px solid ${t.border};border-bottom:1px solid ${t.border};" data-section="logos">
  <div style="max-width:1280px;margin:0 auto;">
    <p style="text-align:center;font-size:13px;color:${t.textMuted};font-weight:500;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 32px;">Trusted by teams at</p>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:40px;">
      ${logos.map((n)=>`<span style="font-family:var(--font-heading);font-size:20px;font-weight:600;color:${t.textMuted};letter-spacing:0.05em;opacity:0.6;">${n}</span>`).join("")}
    </div>
  </div>
</section>`;
}

function renderFeatures(t, c) {
  return `
<section id="features" style="padding:120px 32px;" data-section="features">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${t.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Features</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${t.text};margin:0 0 20px;">Everything you need.<br/>Nothing you don't.</h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${t.textMuted};margin:0;">Built by operators who've felt the pain of over-engineered tools.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1px;background:${t.border};border:1px solid ${t.border};border-radius:16px;overflow:hidden;">
      ${c.features.map((f)=>`<div data-gsap="fade-up" style="background:${t.bg};padding:40px 32px;">
        <div style="width:44px;height:44px;border-radius:10px;background:${rgba(t.primary,0.12)};color:${t.primary};display:flex;align-items:center;justify-content:center;margin-bottom:24px;">${f.icon}</div>
        <h3 style="font-family:var(--font-heading);font-size:19px;font-weight:600;color:${t.text};margin:0 0 10px;letter-spacing:-0.01em;">${f.title}</h3>
        <p style="font-size:15px;line-height:1.55;color:${t.textMuted};margin:0;">${f.description}</p>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderStats(t, c) {
  return `
<section style="padding:80px 32px;border-top:1px solid ${t.border};border-bottom:1px solid ${t.border};background:${t.surface};" data-section="stats">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:40px;text-align:center;">
      ${c.stats.map((s)=>`<div data-gsap="fade-up">
        <div style="font-family:var(--font-heading);font-size:clamp(36px, 5vw, 56px);font-weight:600;color:${t.text};line-height:1;letter-spacing:-0.03em;margin-bottom:8px;">${s.value}</div>
        <div style="font-size:14px;color:${t.textMuted};font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">${s.label}</div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderTestimonials(t, c) {
  return `
<section style="padding:120px 32px;" data-section="testimonials">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${t.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">What people say</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${t.text};margin:0;">Loved by the teams that use it daily.</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:24px;">
      ${c.testimonials.map((x)=>`<div data-gsap="fade-up" style="background:${t.surface};border:1px solid ${t.border};border-radius:14px;padding:32px;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${t.primary}" style="margin-bottom:16px;opacity:0.8;"><path d="M7 8c-1.5 0-3 1.5-3 3v7h7v-7H8c0-1 1-2 2-2V8c-2 0-3 0-3 0zm9 0c-1.5 0-3 1.5-3 3v7h7v-7h-3c0-1 1-2 2-2V8c-2 0-3 0-3 0z"/></svg>
        <p style="font-size:17px;line-height:1.55;color:${t.text};margin:0 0 24px;font-weight:400;">&ldquo;${x.quote}&rdquo;</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:${t.primary};color:${t.isDark?"#000":"#fff"};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;">${x.initials}</div>
          <div>
            <div style="font-size:14px;font-weight:600;color:${t.text};">${x.author}</div>
            <div style="font-size:13px;color:${t.textMuted};">${x.role}</div>
          </div>
        </div>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderPricing(t, c) {
  return `
<section id="pricing" style="padding:120px 32px;" data-section="pricing">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${t.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Pricing</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${t.text};margin:0 0 20px;">Simple pricing. Zero surprises.</h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${t.textMuted};margin:0;">Start free. Upgrade when the value is obvious.</p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;max-width:1100px;margin:0 auto;">
      ${c.pricingPlans.map((p)=>`<div data-gsap="fade-up" style="background:${p.featured?t.surface:t.bg};border:${p.featured?`2px solid ${t.primary}`:`1px solid ${t.border}`};border-radius:16px;padding:36px 32px;position:relative;">
        ${p.featured?`<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${t.primary};color:${t.isDark?"#000":"#fff"};font-size:11px;font-weight:700;padding:5px 12px;border-radius:999px;letter-spacing:0.05em;text-transform:uppercase;">Most popular</div>`:""}
        <h3 style="font-family:var(--font-heading);font-size:20px;font-weight:600;color:${t.text};margin:0 0 8px;">${p.name}</h3>
        <p style="font-size:14px;color:${t.textMuted};margin:0 0 28px;">${p.description}</p>
        <div style="margin-bottom:28px;">
          <span style="font-family:var(--font-heading);font-size:44px;font-weight:600;color:${t.text};letter-spacing:-0.03em;">${p.price}</span>
          <span style="font-size:14px;color:${t.textMuted};margin-left:6px;">${p.period}</span>
        </div>
        <a href="#cta" style="display:block;text-align:center;background:${p.featured?t.primary:"transparent"};color:${p.featured?(t.isDark?"#000":"#fff"):t.text};border:${p.featured?"none":`1px solid ${t.border}`};padding:12px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;margin-bottom:28px;">${p.cta}</a>
        <ul style="list-style:none;padding:0;margin:0;">
          ${p.features.map((f)=>`<li style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:${t.text};margin-bottom:12px;line-height:1.5;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${t.primary}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${f}</span>
          </li>`).join("")}
        </ul>
      </div>`).join("")}
    </div>
  </div>
</section>`;
}

function renderFAQ(t, c) {
  return `
<section id="faq" style="padding:120px 32px;" data-section="faq">
  <div style="max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:64px;">
      <p data-gsap="fade-up" style="font-size:13px;color:${t.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">FAQ</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${t.text};margin:0;">Questions, answered.</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${c.faqs.map((f,i)=>`<details data-gsap="fade-up" style="background:${t.surface};border:1px solid ${t.border};border-radius:12px;padding:20px 24px;" ${i===0?"open":""}>
        <summary style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-heading);font-size:17px;font-weight:500;color:${t.text};list-style:none;cursor:pointer;">
          <span>${f.question}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <p style="font-size:15px;line-height:1.6;color:${t.textMuted};margin:16px 0 0;">${f.answer}</p>
      </details>`).join("")}
    </div>
  </div>
</section>`;
}

function renderCTA(t, c) {
  return `
<section id="cta" style="padding:120px 32px;" data-section="cta">
  <div style="max-width:900px;margin:0 auto;position:relative;border-radius:24px;overflow:hidden;background:${t.gradient};padding:80px 48px;text-align:center;border:1px solid ${t.border};">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 0%, ${rgba(t.primary,0.3)} 0%, transparent 60%);pointer-events:none;"></div>
    <div style="position:relative;">
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${t.text};margin:0 0 20px;">Ready when you are.</h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${t.textMuted};margin:0 0 40px;max-width:500px;margin-left:auto;margin-right:auto;">Join thousands of teams already building with ${c.productName}. Free to start, no credit card required.</p>
      <div data-gsap="fade-up" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="#" style="background:${t.primary};color:${t.isDark?"#000":"#fff"};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">${c.primaryCta}</a>
        <a href="#" style="background:transparent;color:${t.text};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid ${t.border};">Talk to us</a>
      </div>
    </div>
  </div>
</section>`;
}

function renderFooter(t, c) {
  const year = new Date().getFullYear();
  const cols = [
    { title: "Product", links: ["Features","Pricing","Changelog","Docs"] },
    { title: "Company", links: ["About","Customers","Careers","Blog"] },
    { title: "Legal", links: ["Privacy","Terms","Security","Cookies"] },
  ];
  return `
<footer style="border-top:1px solid ${t.border};padding:60px 32px 40px;" data-section="footer">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px;">
      <div>
        <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:${t.text};margin-bottom:16px;">
          <div style="width:28px;height:28px;border-radius:7px;background:${t.primary};display:flex;align-items:center;justify-content:center;color:${t.isDark?"#000":"#fff"};font-weight:700;font-family:var(--font-heading);">${c.logoLetter}</div>
          <span style="font-family:var(--font-heading);font-weight:600;font-size:17px;">${c.productName}</span>
        </a>
        <p style="font-size:14px;color:${t.textMuted};margin:0;line-height:1.5;max-width:280px;">${c.tagline}</p>
      </div>
      ${cols.map((col)=>`<div>
        <div style="font-size:13px;font-weight:600;color:${t.text};margin-bottom:16px;">${col.title}</div>
        ${col.links.map((l)=>`<a href="#" style="display:block;font-size:14px;color:${t.textMuted};text-decoration:none;margin-bottom:10px;">${l}</a>`).join("")}
      </div>`).join("")}
    </div>
    <div style="padding-top:32px;border-top:1px solid ${t.border};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
      <p style="font-size:13px;color:${t.textMuted};margin:0;">© ${year} ${c.productName}. All rights reserved.</p>
      <p style="font-size:13px;color:${t.textMuted};margin:0;">Made with Awesome Crew.</p>
    </div>
  </div>
</footer>`;
}

// ─────────────────────────────────────────────────────────────
// Orchestrator
// ─────────────────────────────────────────────────────────────
const THEME_BY_INDUSTRY = {
  saas: "electric-indigo", ecommerce: "warm-cream", agency: "dark-minimal",
  fitness: "bold-monochrome", food: "sunset-coral", education: "forest-emerald",
  finance: "royal-amber", portfolio: "dark-minimal", nonprofit: "forest-emerald",
  realestate: "warm-cream",
};
const FONT_BY_INDUSTRY = {
  saas: "clash-satoshi", ecommerce: "editorial-bold", agency: "clash-satoshi",
  fitness: "geometric-modern", food: "serif-elegant", education: "cabinet-satoshi",
  finance: "geometric-modern", portfolio: "clash-satoshi", nonprofit: "serif-elegant",
  realestate: "editorial-bold",
};

function buildAnimationScript(level) {
  if (level === "none") return "";
  const stagger = level === "bold" ? 0.1 : level === "dynamic" ? 0.08 : 0.06;
  const duration = level === "bold" ? 1.2 : level === "dynamic" ? 0.9 : 0.7;
  return `
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script>
(function(){
  function reveal(){
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(function(el){
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'opacity .8s ease, transform .8s ease';
    });
  }
  if (!window.gsap) { setTimeout(reveal, 50); return; }
  gsap.registerPlugin(ScrollTrigger);
  gsap.set('[data-gsap="fade-up"]', { opacity: 0, y: 28 });
  document.querySelectorAll('[data-section]').forEach(function(section){
    var items = section.querySelectorAll('[data-gsap="fade-up"]');
    if (!items.length) return;
    gsap.to(items, { opacity: 1, y: 0, duration: ${duration}, stagger: ${stagger}, ease: "power3.out", scrollTrigger: { trigger: section, start: "top 85%", once: true } });
  });
  var hero = document.querySelector('[data-section="hero"]');
  if (hero) gsap.to(hero.querySelectorAll('[data-gsap="fade-up"]'), { opacity: 1, y: 0, duration: ${duration}, stagger: ${stagger}, ease: "power3.out", delay: 0.1 });
  // Safety net — if a section never enters viewport, force-reveal at 3s
  setTimeout(function(){
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(function(el){
      if (parseFloat(getComputedStyle(el).opacity) < 0.5) { el.style.opacity = '1'; el.style.transform = 'none'; }
    });
  }, 3000);
})();
</script>`;
}

function wrapPage(sections, t, fp, animationScript, title, description) {
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
${fp.link}
<style>
  *, *::before, *::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: ${fp.body}; background: ${t.bg}; color: ${t.text}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; line-height: 1.5; }
  :root { --font-heading: ${fp.heading}; --font-body: ${fp.body}; --color-primary: ${t.primary}; --color-bg: ${t.bg}; --color-text: ${t.text}; }
  h1, h2, h3, h4, h5, h6 { font-family: ${fp.heading}; }
  a { color: inherit; }
  img { max-width: 100%; height: auto; display: block; }
  ::selection { background: ${t.primary}; color: ${t.isDark?"#000":"#fff"}; }
  details > summary::-webkit-details-marker { display: none; }
  details[open] summary svg { transform: rotate(180deg); transition: transform 0.2s ease; }
  details summary svg { transition: transform 0.2s ease; }
  /* Hover polish (survives DOMPurify since it's CSS not inline JS) */
  a, button { transition: all 0.2s ease; }
  [data-section="navbar"] a:hover { color: ${t.text} !important; }
  [data-section="hero"] a[href="#cta"]:hover { background: ${t.primaryHover} !important; transform: translateY(-2px); box-shadow: 0 12px 30px -10px ${rgba(t.primary, 0.6)}; }
  [data-section="hero"] a[href="#features"]:hover { background: ${t.surface} !important; border-color: ${t.textMuted} !important; }
  [data-section="features"] > div > div > div:hover { background: ${t.surface} !important; }
  [data-section="testimonials"] > div > div > div:hover { transform: translateY(-4px); border-color: ${t.textMuted} !important; }
  [data-section="pricing"] > div > div > div:hover { border-color: ${t.textMuted} !important; }
  [data-section="cta"] a:hover { transform: translateY(-2px); }
  [data-section="footer"] a:hover { color: ${t.text} !important; }
  details:hover { border-color: ${t.textMuted} !important; }
  @media (max-width: 768px) { [data-section="navbar"] > div > div:last-child a:not(:last-child) { display: none; } }
</style>
</head>
<body>
${sections}
${animationScript}
</body>
</html>`;
}

function generatePage(opts) {
  const level = opts.animationLevel || "dynamic";
  const variantSeed = (opts.seed | 0) || (Date.now() & 0x7fffffff) ^ Math.floor(Math.random() * 0x7fffffff);
  const content = extractContent(opts.prompt, opts.industry, variantSeed);

  // When the caller doesn't lock a theme/font, vary on every call so
  // repeated generates with the same prompt feel different.
  const themeKeys = Object.keys(THEMES);
  const fontKeys = Object.keys(FONT_PAIRS);
  const themeKey = opts.theme || themeKeys[Math.abs(variantSeed) % themeKeys.length];
  const fontKey = opts.fontPair || fontKeys[Math.abs(variantSeed >> 3) % fontKeys.length];
  const theme = THEMES[themeKey] || THEMES["electric-indigo"];
  const fp = FONT_PAIRS[fontKey] || FONT_PAIRS["clash-satoshi"];

  const sections = [
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
  const html = wrapPage(sections.join("\n"), theme, fp, buildAnimationScript(level), title, description);
  return { html, title };
}

// ─────────────────────────────────────────────────────────────
// Vercel serverless handler
// ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Vercel-CDN-Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { prompt, originalPrompt, existingHtml, instructions, theme, fontPair, animationLevel, industry } = body || {};

  // Refine: blend the original prompt with the user's edit instructions
  // and roll a fresh seed → genuinely different page in the same brand.
  if (existingHtml && instructions) {
    const base = (originalPrompt || prompt || "").trim();
    if (!base) {
      res.status(400).json({ error: 'Refine requires {originalPrompt} or {prompt} alongside {instructions}.' });
      return;
    }
    try {
      const { html } = generatePage({
        prompt: `${base}. ${instructions}`,
        theme, fontPair, animationLevel, industry,
      });
      res.status(200).json({ html });
    } catch (err) {
      res.status(500).json({ error: 'Refine failed', detail: String(err).slice(0, 500) });
    }
    return;
  }

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 4) {
    res.status(400).json({ error: 'Provide a non-empty {prompt} string (4+ chars).' });
    return;
  }

  try {
    const { html } = generatePage({ prompt: prompt.trim(), theme, fontPair, animationLevel, industry });
    res.status(200).json({ html });
  } catch (err) {
    res.status(500).json({ error: 'Generation failed', detail: String(err).slice(0, 500) });
  }
}