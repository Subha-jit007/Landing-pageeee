// ═══════════════════════════════════════════════════════════════════
// Section renderers — premium HTML components for each page section
// Each function accepts a theme + content and returns a full HTML
// section with inline styles and GSAP animation hooks.
// ═══════════════════════════════════════════════════════════════════
import type { Theme } from "./themes";
import type { BusinessContent } from "./content";

const rgba = (hex: string, alpha: number): string => {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export function renderNavbar(theme: Theme, content: BusinessContent): string {
  return `
<nav style="position:fixed;top:0;left:0;right:0;z-index:50;backdrop-filter:blur(16px);background:${rgba(theme.bg, 0.75)};border-bottom:1px solid ${theme.border};" data-section="navbar">
  <div style="max-width:1280px;margin:0 auto;padding:18px 32px;display:flex;align-items:center;justify-content:space-between;">
    <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:${theme.text};">
      <div style="width:32px;height:32px;border-radius:8px;background:${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.isDark ? "#000" : "#fff"};font-weight:700;font-family:var(--font-heading);">${content.logoLetter}</div>
      <span style="font-family:var(--font-heading);font-weight:600;font-size:18px;letter-spacing:-0.01em;">${content.productName}</span>
    </a>
    <div style="display:flex;align-items:center;gap:32px;">
      <a href="#features" style="color:${theme.textMuted};text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;" onmouseover="this.style.color='${theme.text}'" onmouseout="this.style.color='${theme.textMuted}'">Features</a>
      <a href="#pricing" style="color:${theme.textMuted};text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;" onmouseover="this.style.color='${theme.text}'" onmouseout="this.style.color='${theme.textMuted}'">Pricing</a>
      <a href="#faq" style="color:${theme.textMuted};text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s;" onmouseover="this.style.color='${theme.text}'" onmouseout="this.style.color='${theme.textMuted}'">FAQ</a>
      <a href="#cta" style="background:${theme.primary};color:${theme.isDark ? "#000" : "#fff"};text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;transition:all 0.2s;" onmouseover="this.style.background='${theme.primaryHover}';this.style.transform='translateY(-1px)'" onmouseout="this.style.background='${theme.primary}';this.style.transform='translateY(0)'">${content.primaryCta}</a>
    </div>
  </div>
</nav>`;
}

export function renderHero(theme: Theme, content: BusinessContent): string {
  return `
<section style="position:relative;padding:180px 32px 120px;overflow:hidden;" data-section="hero">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 80% 50% at 50% 0%, ${rgba(theme.primary, 0.15)} 0%, transparent 70%);pointer-events:none;"></div>
  <div style="position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, ${rgba(theme.primary, 0.5)}, transparent);"></div>

  <div style="max-width:900px;margin:0 auto;text-align:center;position:relative;">
    <div data-gsap="fade-up" style="display:inline-flex;align-items:center;gap:8px;padding:6px 14px;border:1px solid ${theme.border};border-radius:999px;background:${rgba(theme.surface, 0.5)};margin-bottom:32px;">
      <span style="width:6px;height:6px;border-radius:50%;background:${theme.primary};box-shadow:0 0 12px ${theme.primary};"></span>
      <span style="font-size:13px;color:${theme.textMuted};font-weight:500;">${content.tagline}</span>
    </div>
    <h1 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(40px, 7vw, 80px);font-weight:600;line-height:1.02;letter-spacing:-0.03em;color:${theme.text};margin:0 0 24px;">
      ${content.heroHeadline}
    </h1>
    <p data-gsap="fade-up" style="font-size:clamp(17px, 2vw, 20px);line-height:1.5;color:${theme.textMuted};max-width:640px;margin:0 auto 48px;">
      ${content.heroSubhead}
    </p>
    <div data-gsap="fade-up" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <a href="#cta" style="background:${theme.primary};color:${theme.isDark ? "#000" : "#fff"};text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;transition:all 0.25s cubic-bezier(0.16,1,0.3,1);display:inline-flex;align-items:center;gap:8px;" onmouseover="this.style.background='${theme.primaryHover}';this.style.transform='translateY(-2px)';this.style.boxShadow='0 12px 30px -10px ${rgba(theme.primary, 0.6)}'" onmouseout="this.style.background='${theme.primary}';this.style.transform='translateY(0)';this.style.boxShadow='none'">${content.primaryCta}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </a>
      <a href="#features" style="background:transparent;color:${theme.text};text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid ${theme.border};transition:all 0.25s;" onmouseover="this.style.background='${theme.surface}';this.style.borderColor='${theme.textMuted}'" onmouseout="this.style.background='transparent';this.style.borderColor='${theme.border}'">${content.secondaryCta}</a>
    </div>
  </div>

  <div data-gsap="fade-up" style="max-width:1100px;margin:100px auto 0;position:relative;">
    <div style="aspect-ratio:16/10;border-radius:16px;background:${theme.surface};border:1px solid ${theme.border};overflow:hidden;position:relative;box-shadow:0 30px 60px -20px ${rgba("#000000", 0.5)};">
      <div style="position:absolute;inset:0;background:linear-gradient(135deg, ${rgba(theme.primary, 0.15)}, ${rgba(theme.accent, 0.08)});"></div>
      <div style="position:absolute;top:16px;left:16px;display:flex;gap:6px;">
        <span style="width:12px;height:12px;border-radius:50%;background:#ff5f57;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#febc2e;"></span>
        <span style="width:12px;height:12px;border-radius:50%;background:#28c840;"></span>
      </div>
      <div style="position:absolute;inset:50px 24px 24px;display:grid;grid-template-columns:200px 1fr;gap:16px;">
        <div style="background:${rgba(theme.bg, 0.5)};border:1px solid ${theme.border};border-radius:10px;padding:16px;">
          ${[1, 2, 3, 4, 5].map((i) => `<div style="height:10px;background:${theme.border};border-radius:3px;margin-bottom:10px;width:${50 + (i % 3) * 15}%;"></div>`).join("")}
        </div>
        <div style="background:${rgba(theme.bg, 0.5)};border:1px solid ${theme.border};border-radius:10px;padding:20px;">
          <div style="height:14px;background:${theme.primary};border-radius:3px;width:30%;margin-bottom:16px;"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;">
            ${[1, 2, 3].map((i) => `<div style="aspect-ratio:1;background:${theme.border};border-radius:8px;"></div>`).join("")}
          </div>
          <div style="margin-top:16px;">
            <div style="height:8px;background:${theme.border};border-radius:3px;margin-bottom:8px;"></div>
            <div style="height:8px;background:${theme.border};border-radius:3px;margin-bottom:8px;width:80%;"></div>
            <div style="height:8px;background:${theme.border};border-radius:3px;width:60%;"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

export function renderLogos(theme: Theme): string {
  const logos = ["NORTHWIND", "FORGE", "ORBIT", "KEEPLEY", "MANTRA", "VANTAGE"];
  return `
<section style="padding:60px 32px;border-top:1px solid ${theme.border};border-bottom:1px solid ${theme.border};" data-section="logos">
  <div style="max-width:1280px;margin:0 auto;">
    <p style="text-align:center;font-size:13px;color:${theme.textMuted};font-weight:500;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 32px;">Trusted by teams at</p>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:40px;">
      ${logos
        .map(
          (name) => `<span style="font-family:var(--font-heading);font-size:20px;font-weight:600;color:${theme.textMuted};letter-spacing:0.05em;opacity:0.6;transition:opacity 0.2s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.6'">${name}</span>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderFeatures(theme: Theme, content: BusinessContent): string {
  return `
<section id="features" style="padding:120px 32px;" data-section="features">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${theme.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Features</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${theme.text};margin:0 0 20px;">
        Everything you need.<br/>Nothing you don't.
      </h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${theme.textMuted};margin:0;">
        Built by operators who've felt the pain of over-engineered tools.
      </p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1px;background:${theme.border};border:1px solid ${theme.border};border-radius:16px;overflow:hidden;">
      ${content.features
        .map(
          (f) => `<div data-gsap="fade-up" style="background:${theme.bg};padding:40px 32px;transition:background 0.3s;" onmouseover="this.style.background='${theme.surface}'" onmouseout="this.style.background='${theme.bg}'">
        <div style="width:44px;height:44px;border-radius:10px;background:${rgba(theme.primary, 0.12)};color:${theme.primary};display:flex;align-items:center;justify-content:center;margin-bottom:24px;">${f.icon}</div>
        <h3 style="font-family:var(--font-heading);font-size:19px;font-weight:600;color:${theme.text};margin:0 0 10px;letter-spacing:-0.01em;">${f.title}</h3>
        <p style="font-size:15px;line-height:1.55;color:${theme.textMuted};margin:0;">${f.description}</p>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderStats(theme: Theme, content: BusinessContent): string {
  return `
<section style="padding:80px 32px;border-top:1px solid ${theme.border};border-bottom:1px solid ${theme.border};background:${theme.surface};" data-section="stats">
  <div style="max-width:1100px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:40px;text-align:center;">
      ${content.stats
        .map(
          (s) => `<div data-gsap="fade-up">
        <div style="font-family:var(--font-heading);font-size:clamp(36px, 5vw, 56px);font-weight:600;color:${theme.text};line-height:1;letter-spacing:-0.03em;margin-bottom:8px;">${s.value}</div>
        <div style="font-size:14px;color:${theme.textMuted};font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">${s.label}</div>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderTestimonials(theme: Theme, content: BusinessContent): string {
  return `
<section style="padding:120px 32px;" data-section="testimonials">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${theme.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">What people say</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${theme.text};margin:0;">
        Loved by the teams that use it daily.
      </h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:24px;">
      ${content.testimonials
        .map(
          (t) => `<div data-gsap="fade-up" style="background:${theme.surface};border:1px solid ${theme.border};border-radius:14px;padding:32px;transition:all 0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.borderColor='${theme.textMuted}'" onmouseout="this.style.transform='translateY(0)';this.style.borderColor='${theme.border}'">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${theme.primary}" style="margin-bottom:16px;opacity:0.8;"><path d="M7 8c-1.5 0-3 1.5-3 3v7h7v-7H8c0-1 1-2 2-2V8c-2 0-3 0-3 0zm9 0c-1.5 0-3 1.5-3 3v7h7v-7h-3c0-1 1-2 2-2V8c-2 0-3 0-3 0z"/></svg>
        <p style="font-size:17px;line-height:1.55;color:${theme.text};margin:0 0 24px;font-weight:400;">"${t.quote}"</p>
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:50%;background:${theme.primary};color:${theme.isDark ? "#000" : "#fff"};display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;">${t.initials}</div>
          <div>
            <div style="font-size:14px;font-weight:600;color:${theme.text};">${t.author}</div>
            <div style="font-size:13px;color:${theme.textMuted};">${t.role}</div>
          </div>
        </div>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderPricing(theme: Theme, content: BusinessContent): string {
  return `
<section id="pricing" style="padding:120px 32px;" data-section="pricing">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="max-width:700px;margin:0 auto 80px;text-align:center;">
      <p data-gsap="fade-up" style="font-size:13px;color:${theme.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">Pricing</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${theme.text};margin:0 0 20px;">
        Simple pricing. Zero surprises.
      </h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${theme.textMuted};margin:0;">
        Start free. Upgrade when the value is obvious.
      </p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:24px;max-width:1100px;margin:0 auto;">
      ${content.pricingPlans
        .map(
          (p) => `<div data-gsap="fade-up" style="background:${p.featured ? theme.surface : theme.bg};border:${p.featured ? `2px solid ${theme.primary}` : `1px solid ${theme.border}`};border-radius:16px;padding:36px 32px;position:relative;transition:all 0.25s;" ${!p.featured ? `onmouseover="this.style.borderColor='${theme.textMuted}'" onmouseout="this.style.borderColor='${theme.border}'"` : ""}>
        ${p.featured ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${theme.primary};color:${theme.isDark ? "#000" : "#fff"};font-size:11px;font-weight:700;padding:5px 12px;border-radius:999px;letter-spacing:0.05em;text-transform:uppercase;">Most popular</div>` : ""}
        <h3 style="font-family:var(--font-heading);font-size:20px;font-weight:600;color:${theme.text};margin:0 0 8px;">${p.name}</h3>
        <p style="font-size:14px;color:${theme.textMuted};margin:0 0 28px;">${p.description}</p>
        <div style="margin-bottom:28px;">
          <span style="font-family:var(--font-heading);font-size:44px;font-weight:600;color:${theme.text};letter-spacing:-0.03em;">${p.price}</span>
          <span style="font-size:14px;color:${theme.textMuted};margin-left:6px;">${p.period}</span>
        </div>
        <a href="#cta" style="display:block;text-align:center;background:${p.featured ? theme.primary : "transparent"};color:${p.featured ? (theme.isDark ? "#000" : "#fff") : theme.text};border:${p.featured ? "none" : `1px solid ${theme.border}`};padding:12px;border-radius:10px;font-weight:600;font-size:14px;text-decoration:none;transition:all 0.2s;margin-bottom:28px;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">${p.cta}</a>
        <ul style="list-style:none;padding:0;margin:0;">
          ${p.features
            .map(
              (f) => `<li style="display:flex;align-items:flex-start;gap:10px;font-size:14px;color:${theme.text};margin-bottom:12px;line-height:1.5;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${theme.primary}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px;"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${f}</span>
          </li>`,
            )
            .join("")}
        </ul>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderFAQ(theme: Theme, content: BusinessContent): string {
  return `
<section id="faq" style="padding:120px 32px;" data-section="faq">
  <div style="max-width:800px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:64px;">
      <p data-gsap="fade-up" style="font-size:13px;color:${theme.primary};font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 16px;">FAQ</p>
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${theme.text};margin:0;">
        Questions, answered.
      </h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${content.faqs
        .map(
          (f, i) => `<details data-gsap="fade-up" style="background:${theme.surface};border:1px solid ${theme.border};border-radius:12px;padding:20px 24px;cursor:pointer;transition:border-color 0.2s;" ${i === 0 ? "open" : ""}>
        <summary style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-heading);font-size:17px;font-weight:500;color:${theme.text};list-style:none;cursor:pointer;">
          <span>${f.question}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;transition:transform 0.2s;"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <p style="font-size:15px;line-height:1.6;color:${theme.textMuted};margin:16px 0 0;">${f.answer}</p>
      </details>`,
        )
        .join("")}
    </div>
  </div>
</section>`;
}

export function renderCTA(theme: Theme, content: BusinessContent): string {
  return `
<section id="cta" style="padding:120px 32px;" data-section="cta">
  <div style="max-width:900px;margin:0 auto;position:relative;border-radius:24px;overflow:hidden;background:${theme.gradient};padding:80px 48px;text-align:center;border:1px solid ${theme.border};">
    <div style="position:absolute;inset:0;background:radial-gradient(circle at 50% 0%, ${rgba(theme.primary, 0.3)} 0%, transparent 60%);pointer-events:none;"></div>
    <div style="position:relative;">
      <h2 data-gsap="fade-up" style="font-family:var(--font-heading);font-size:clamp(32px, 5vw, 52px);font-weight:600;line-height:1.1;letter-spacing:-0.02em;color:${theme.text};margin:0 0 20px;">
        Ready when you are.
      </h2>
      <p data-gsap="fade-up" style="font-size:18px;line-height:1.5;color:${theme.textMuted};margin:0 0 40px;max-width:500px;margin-left:auto;margin-right:auto;">
        Join thousands of teams already building with ${content.productName}. Free to start, no credit card required.
      </p>
      <div data-gsap="fade-up" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="#" style="background:${theme.primary};color:${theme.isDark ? "#000" : "#fff"};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;transition:all 0.25s;" onmouseover="this.style.background='${theme.primaryHover}';this.style.transform='translateY(-2px)'" onmouseout="this.style.background='${theme.primary}';this.style.transform='translateY(0)'">${content.primaryCta}</a>
        <a href="#" style="background:transparent;color:${theme.text};text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;border:1px solid ${theme.border};transition:all 0.25s;" onmouseover="this.style.borderColor='${theme.textMuted}'" onmouseout="this.style.borderColor='${theme.border}'">Talk to us</a>
      </div>
    </div>
  </div>
</section>`;
}

export function renderFooter(theme: Theme, content: BusinessContent): string {
  return `
<footer style="border-top:1px solid ${theme.border};padding:60px 32px 40px;" data-section="footer">
  <div style="max-width:1280px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:40px;margin-bottom:48px;">
      <div>
        <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:${theme.text};margin-bottom:16px;">
          <div style="width:28px;height:28px;border-radius:7px;background:${theme.primary};display:flex;align-items:center;justify-content:center;color:${theme.isDark ? "#000" : "#fff"};font-weight:700;font-family:var(--font-heading);">${content.logoLetter}</div>
          <span style="font-family:var(--font-heading);font-weight:600;font-size:17px;">${content.productName}</span>
        </a>
        <p style="font-size:14px;color:${theme.textMuted};margin:0;line-height:1.5;max-width:280px;">${content.tagline}</p>
      </div>
      ${[
        { title: "Product", links: ["Features", "Pricing", "Changelog", "Docs"] },
        { title: "Company", links: ["About", "Customers", "Careers", "Blog"] },
        { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
      ]
        .map(
          (col) => `<div>
        <div style="font-size:13px;font-weight:600;color:${theme.text};margin-bottom:16px;">${col.title}</div>
        ${col.links.map((l) => `<a href="#" style="display:block;font-size:14px;color:${theme.textMuted};text-decoration:none;margin-bottom:10px;transition:color 0.2s;" onmouseover="this.style.color='${theme.text}'" onmouseout="this.style.color='${theme.textMuted}'">${l}</a>`).join("")}
      </div>`,
        )
        .join("")}
    </div>
    <div style="padding-top:32px;border-top:1px solid ${theme.border};display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
      <p style="font-size:13px;color:${theme.textMuted};margin:0;">© ${new Date().getFullYear()} ${content.productName}. All rights reserved.</p>
      <p style="font-size:13px;color:${theme.textMuted};margin:0;">Made with PageForge AI.</p>
    </div>
  </div>
</footer>`;
}
