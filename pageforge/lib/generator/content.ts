// ═══════════════════════════════════════════════════════════════════
// Business content extractor
// Parses a freeform user prompt into structured content tokens that
// get woven into the generated HTML. This replaces the "AI" layer
// with deterministic, tasteful content assembly.
// ═══════════════════════════════════════════════════════════════════

export interface BusinessContent {
  productName: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  primaryCta: string;
  secondaryCta: string;
  features: Array<{ title: string; description: string; icon: string }>;
  stats: Array<{ value: string; label: string }>;
  testimonials: Array<{ quote: string; author: string; role: string; initials: string }>;
  pricingPlans: Array<{
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    featured: boolean;
    cta: string;
  }>;
  faqs: Array<{ question: string; answer: string }>;
  industry: string;
  logoLetter: string;
}

// Industry keyword map to infer tone and content
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  saas: ["saas", "software", "app", "platform", "tool", "dashboard", "api", "automation", "workflow", "productivity"],
  ecommerce: ["shop", "store", "buy", "sell", "product", "ecommerce", "retail", "shopify", "merchandise"],
  agency: ["agency", "studio", "consulting", "services", "clients", "marketing", "design agency"],
  fitness: ["fitness", "workout", "gym", "training", "exercise", "health", "wellness", "yoga", "pilates"],
  food: ["restaurant", "food", "cafe", "menu", "chef", "cuisine", "dining", "bakery", "coffee"],
  education: ["course", "learn", "education", "training", "student", "school", "academy", "tutorial", "bootcamp"],
  finance: ["finance", "bank", "invest", "crypto", "trading", "money", "payment", "wallet", "fintech"],
  portfolio: ["portfolio", "freelance", "designer", "developer", "artist", "photographer"],
  nonprofit: ["nonprofit", "charity", "foundation", "mission", "donate", "cause"],
  realestate: ["real estate", "property", "house", "rent", "apartment", "realtor"],
};

const ICON_LIBRARY = {
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

function detectIndustry(prompt: string): string {
  const lower = prompt.toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return industry;
  }
  return "saas";
}

function extractProductName(prompt: string): string {
  // Look for "called X" or "named X" or first capitalized multi-word phrase
  const calledMatch = prompt.match(/(?:called|named)\s+["']?([A-Z][\w\s]{2,30})["']?/i);
  if (calledMatch) return calledMatch[1].trim();

  // Grab the first noun phrase from the prompt
  const words = prompt.split(/\s+/).slice(0, 6);
  const meaningful = words.filter((w) => w.length > 3 && !/^(the|and|for|with|that|this|your|our|from)$/i.test(w));
  if (meaningful.length > 0) {
    return meaningful[0].charAt(0).toUpperCase() + meaningful[0].slice(1).toLowerCase();
  }
  return "Acme";
}

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h;
}

/**
 * Extract structured business content from a user prompt.
 */
export function extractContent(prompt: string, providedIndustry?: string): BusinessContent {
  const industry = providedIndustry || detectIndustry(prompt);
  const productName = extractProductName(prompt);
  const seed = seedFrom(prompt);

  // Industry-specific content pools
  const TAGLINES: Record<string, string[]> = {
    saas: ["Built for builders.", "Ship faster. Sleep better.", "The modern way to work.", "Work without the friction."],
    ecommerce: ["Shop what you love.", "Crafted with care.", "For every taste, every moment.", "Made to be loved."],
    agency: ["Ideas that move markets.", "Design with intention.", "Your vision, amplified.", "We turn ambition into impact."],
    fitness: ["Train smarter. Live stronger.", "Your strongest self awaits.", "Move with purpose.", "Built for the long run."],
    food: ["Fresh from the source.", "Every bite, a moment.", "Crafted daily.", "Taste, perfected."],
    education: ["Learn without limits.", "Your next chapter starts here.", "Knowledge that compounds.", "Master what matters."],
    finance: ["Money, made simple.", "Finance without the friction.", "Your wealth, your way.", "Built for the new economy."],
    portfolio: ["Selected works.", "Design & development.", "Making things that matter.", "Digital craftsmanship."],
    nonprofit: ["Together, we go further.", "Change starts with you.", "Impact, measured.", "A mission worth joining."],
    realestate: ["Your next home awaits.", "Where stories begin.", "Spaces that inspire.", "Home, reimagined."],
  };

  const HEADLINES: Record<string, string[]> = {
    saas: [
      `The operating system for modern teams.`,
      `Everything your team needs. Nothing they don't.`,
      `Stop stitching tools. Start shipping.`,
      `Built for the way you actually work.`,
    ],
    ecommerce: [
      `Objects of everyday beauty.`,
      `Designed to last. Made to love.`,
      `Timeless pieces, delivered worldwide.`,
      `Quality you can feel.`,
    ],
    agency: [
      `We design brands that behave like products.`,
      `Strategy, design, and code — under one roof.`,
      `Your brand, done right.`,
      `Creative work with commercial impact.`,
    ],
    fitness: [
      `Your strongest year is ahead.`,
      `Training that works as hard as you do.`,
      `Stronger. Leaner. Faster.`,
      `Built for athletes. Loved by everyone.`,
    ],
    food: [
      `Honest food, made with love.`,
      `A table set for every moment.`,
      `Flavor, the way it was meant to be.`,
      `Every ingredient has a story.`,
    ],
    education: [
      `Skills that change careers.`,
      `The shortcut you've been looking for.`,
      `Learn from operators, not influencers.`,
      `Real skills. Real outcomes.`,
    ],
    finance: [
      `Your money, working harder.`,
      `Finance, finally on your side.`,
      `Simple tools for serious money.`,
      `Built for the way money works now.`,
    ],
    portfolio: [
      `I build interfaces people love to use.`,
      `A small studio with a big obsession.`,
      `Selected work, shared honestly.`,
      `Design-led. Engineering-proud.`,
    ],
    nonprofit: [
      `Small actions, measurable change.`,
      `A movement worth joining.`,
      `Change what can be changed.`,
      `Impact, one donation at a time.`,
    ],
    realestate: [
      `Homes that tell your story.`,
      `Find the one. Love the one.`,
      `Your space, your rules.`,
      `The modern way to find home.`,
    ],
  };

  const FEATURES: Record<string, Array<{ title: string; description: string; icon: keyof typeof ICON_LIBRARY }>> = {
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

  // Fallback to SaaS content for industries without dedicated pools
  const featurePool = FEATURES[industry] ?? FEATURES.saas;
  const headlinePool = HEADLINES[industry] ?? HEADLINES.saas;
  const taglinePool = TAGLINES[industry] ?? TAGLINES.saas;

  const heroHeadline = pickRandom(headlinePool, seed);
  const tagline = pickRandom(taglinePool, seed + 1);

  const heroSubhead = `${productName} is the ${industry === "saas" ? "platform" : industry === "agency" ? "studio" : "brand"} ${
    industry === "saas" ? "teams use to ship what matters — faster, with less noise, and without the tool sprawl." : "trusted by people who care about the details."
  }`;

  const features = featurePool.slice(0, 6).map((f) => ({
    title: f.title,
    description: f.description,
    icon: ICON_LIBRARY[f.icon],
  }));

  const stats = [
    { value: "10k+", label: "Active users" },
    { value: "99.99%", label: "Uptime" },
    { value: "4.9", label: "Average rating" },
    { value: "<50ms", label: "Response time" },
  ];

  const testimonials = [
    {
      quote: `${productName} replaced four tools we were paying for and somehow made our team faster at the same time. Genuinely didn't expect that.`,
      author: "Sarah Chen",
      role: "VP Engineering, Lattice",
      initials: "SC",
    },
    {
      quote: `The onboarding took ten minutes. The payback took a week. We use it every day now.`,
      author: "Marcus Whitfield",
      role: "Founder, Forge Labs",
      initials: "MW",
    },
    {
      quote: `What I like most is what's missing — no clutter, no feature creep. Just the things that matter, done beautifully.`,
      author: "Aisha Patel",
      role: "Head of Design, Northwind",
      initials: "AP",
    },
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      period: "forever",
      description: "For individuals getting started.",
      features: ["Up to 3 projects", "Core features", "Community support", "Standard templates"],
      featured: false,
      cta: "Start free",
    },
    {
      name: "Pro",
      price: "$29",
      period: "per month",
      description: "For growing teams and serious builders.",
      features: ["Unlimited projects", "All integrations", "Priority support", "Custom domain", "Advanced analytics", "API access"],
      featured: true,
      cta: "Start 14-day trial",
    },
    {
      name: "Scale",
      price: "Custom",
      period: "let's talk",
      description: "For teams with specific needs.",
      features: ["Everything in Pro", "SSO & SAML", "Dedicated support", "Custom integrations", "SLA", "On-prem option"],
      featured: false,
      cta: "Contact sales",
    },
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
    productName,
    tagline,
    heroHeadline,
    heroSubhead,
    primaryCta: industry === "ecommerce" ? "Shop the collection" : industry === "agency" ? "Start a project" : "Get started free",
    secondaryCta: "See how it works",
    features,
    stats,
    testimonials,
    pricingPlans,
    faqs,
    industry,
    logoLetter: productName.charAt(0).toUpperCase(),
  };
}
