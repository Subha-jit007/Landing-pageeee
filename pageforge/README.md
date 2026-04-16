# PageForge AI

> AI-powered landing page generator. Zero API keys. Seven security layers.

PageForge turns a one-sentence description of your business into a premium, animated, fully-editable landing page. Every generation is deterministic and runs locally — no OpenAI bill, no vendor lock-in, no surprises.

## Why this exists

Every other AI landing page tool either:

- **Locks you in** (Framer, Webflow): beautiful output, but you can't export clean code
- **Produces slop** (Durable): fast but generic
- **Costs per token** (v0, Bolt, Lovable): surprise bills of $100s for a single page

PageForge gives you premium, animated output with full code ownership — and because the "AI" is a deterministic template engine with tasteful curation, it costs nothing to run.

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev

# 3. Open http://localhost:3000
```

That's it. No API keys to set up. No database to provision. No external services.

A local JSON database is created automatically in `./data/` on first run. A session-signing secret is auto-generated and persisted to `./data/.session-secret`.

## How it works

1. **You describe your business** in the dashboard: *"A minimalist coffee subscription from small-batch roasters"*
2. **PageForge parses** the prompt to detect industry, extract a product name, and pick a tasteful theme + font pair
3. **10 section renderers** (hero, features, stats, testimonials, pricing, FAQ, CTA, etc.) compose a full HTML page with inline styles and GSAP scroll animations
4. **The page is saved** to your local JSON database and opened in the editor
5. **You can tweak** the theme, fonts, and animation level — each change triggers a regeneration
6. **Publish** to `/preview/<your-slug>` or **download as ZIP** (static HTML, CDN-loaded fonts/animations, zero build step)

## Architecture

```
pageforge/
├── app/
│   ├── (auth)/               ─ login + signup
│   ├── (dashboard)/          ─ dashboard + editor (auth-protected)
│   ├── api/                  ─ REST API routes
│   │   ├── auth/
│   │   ├── generate/         ─ main generation endpoint
│   │   ├── pages/            ─ CRUD
│   │   ├── publish/          ─ publish to slug
│   │   └── export/           ─ ZIP download
│   └── preview/[slug]/       ─ public published page
├── components/
│   ├── ui/                   ─ Button, Input
│   ├── editor/               ─ EditorClient (iframe preview + design panels)
│   ├── generation/           ─ GenerationForm
│   └── dashboard/            ─ PageCard, NewPageButton, LogoutButton
├── lib/
│   ├── db/                   ─ JSON-file database
│   ├── generator/            ─ themes, fonts, content, section renderers
│   └── security/             ─ the 7 layers (see below)
├── middleware.ts             ─ route protection + CSRF cookie seeding
├── types/                    ─ shared type definitions
└── data/                     ─ auto-created JSON DB lives here
```

## The seven security layers

Every layer is implemented as an independent module in `lib/security/`. They compose cleanly via `runGuards(request, options)` on each API route.

### 1. Input validation — `lib/security/validate.ts`
All API inputs are parsed with **Zod** before any logic runs. Unknown fields are stripped (`.strict()`), max lengths are enforced to prevent resource exhaustion, and the first validation error is returned as a helpful message. Email addresses are normalized, slugs are regex-checked.

### 2. HTML sanitization — `lib/security/sanitize.ts`
Every piece of HTML that's stored or rendered passes through **isomorphic-dompurify**. A strict allowlist of tags and attributes is enforced. `<script>`, event handlers (`onclick`, etc.), `javascript:` URIs, and `<iframe>` are all stripped. This protects against stored XSS even if the generator or a future AI integration produces malicious markup.

### 3. Password hashing — `lib/security/password.ts`
Passwords are hashed with **bcryptjs** at 12 rounds of salt. bcryptjs is pure-JS (no native build step), so the app runs on any platform including edge runtimes. On login, a dummy hash comparison is always performed even when the email is unknown, preventing user-enumeration via timing attacks. Constant-time string comparison is used for token equality checks.

### 4. Session security — `lib/security/session.ts`
Sessions are **JWTs signed with HS256** via JOSE, embedded in `HttpOnly`, `SameSite=Strict`, and (in production) `Secure` cookies. The signing secret is loaded from `SESSION_SECRET` if set, or auto-generated on first run and persisted to `data/.session-secret` with 0600 permissions. Tokens carry issuer and audience claims and expire after 7 days.

### 5. CSRF protection — `lib/security/csrf.ts`
Every state-changing request must carry an `X-CSRF-Token` header that matches a cryptographically-random cookie (`pf_csrf`, 32 random bytes). This implements the **double-submit cookie** pattern: an attacker from another origin cannot read the cookie, so they cannot forge the header. Verification uses constant-time comparison.

### 6. Rate limiting — `lib/security/rate-limit.ts`
A **sliding-window rate limiter** runs per-IP for all API routes. Different endpoints have different budgets: login is capped at 5 attempts/minute (brute-force protection), signup at 3/hour, generation at 10/minute, and general API at 120/minute. Rate-limit state is kept in-memory with lazy cleanup of stale buckets.

### 7. Security headers — `next.config.ts`
Every response carries hardened HTTP headers:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Locks script/style/image/font sources to trusted origins |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` (blocks clickjacking) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disables camera, mic, geolocation, FLoC |
| `X-XSS-Protection` | `1; mode=block` |

`poweredByHeader: false` also strips the Next.js fingerprint from responses.

## Configuration (all optional)

Copy `.env.local.example` to `.env.local` and set anything you want to override:

```bash
# Optional — auto-generated if not set
SESSION_SECRET=a-64-character-hex-string

# Optional
NODE_ENV=development
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Tech stack

- **Next.js 15** (App Router, React 19 RC, TypeScript)
- **Tailwind CSS 3.4** for UI styling
- **JOSE** for JWT signing
- **bcryptjs** for password hashing
- **Zod** for input validation
- **isomorphic-dompurify** for HTML sanitization
- **JSZip** for ZIP export
- **Lucide** for icons
- **Fontshare CDN** for Clash Display + Satoshi (free)
- **GSAP + Lenis CDN** in generated pages (free)

No SQLite, no Postgres, no Supabase, no OpenAI, no Gemini, no Anthropic, no Groq.

## Generated page features

Every generated landing page ships with:

- Full HTML document with semantic markup and open-graph meta tags
- **10 sections**: navbar, hero, logo grid, features, stats, testimonials, pricing, FAQ, CTA, footer
- **8 themes** (Dark Minimal, Electric Indigo, Forest Emerald, Sunset Coral, Bold Monochrome, Royal Amber, Cyber Neon, Warm Cream)
- **5 font pairs** (Clash Display × Satoshi, Cabinet × Satoshi, Fraunces × Inter, Space Grotesk × Inter, Playfair × Source Sans)
- **4 animation levels** (none / subtle / dynamic / bold) powered by GSAP ScrollTrigger + Lenis smooth scroll
- Responsive by default, dark themes use `#0a0a0a` base (not pure black)
- Scroll-triggered fade-ups, hover micro-interactions on every button, stagger reveals on section entry
- Radial gradient backgrounds in hero + CTA
- Faux-browser mockup in hero

## Deployment

### As a Node server (Vercel, Railway, Fly, your own VPS)

```bash
npm run build
npm run start
```

Ensure the `data/` directory is writable by the process.

For **Vercel**, use a persistent filesystem adapter or migrate the JSON database to Vercel KV / Redis (the `lib/db/index.ts` module is a single file to swap).

### Self-hosted (Docker)

A simple Dockerfile would copy the project, run `npm ci && npm run build`, expose port 3000, and mount `./data` as a volume.

## Customizing the generator

The generator is **plain code** — not a prompt, not an API call. To customize it:

- **Add themes** in `lib/generator/themes.ts` (8 are included)
- **Add font pairs** in `lib/generator/themes.ts` (5 are included)
- **Tweak content** (features, headlines, FAQs) in `lib/generator/content.ts`
- **Add or modify sections** in `lib/generator/sections.ts`
- **Change composition logic** in `lib/generator/index.ts`

If you later want to plug in a real LLM for the content-extraction step, the single function to swap is `extractContent()` in `lib/generator/content.ts`.

## License

MIT.

Built as a demonstration of a production-grade SaaS architecture with zero external dependencies and first-class security practices.
