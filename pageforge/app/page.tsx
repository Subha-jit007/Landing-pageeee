import Link from "next/link";
import { ArrowRight, Zap, Shield, Palette, Code, Sparkles, Layers } from "lucide-react";

const features = [
  { icon: Zap, title: "Ten-second generation", desc: "Describe your business. We render a complete, animated page. Edit it in the next breath." },
  { icon: Palette, title: "8 themes, 5 font pairs", desc: "Clash Display × Satoshi. Never Inter. Designs that feel built, not generated." },
  { icon: Layers, title: "Ten polished sections", desc: "Hero, features, stats, testimonials, pricing, FAQ — all GSAP-animated, all customisable." },
  { icon: Code, title: "Own your code", desc: "Download the page as a ZIP. Static HTML, ready to host on Vercel, Netlify, GitHub Pages." },
  { icon: Shield, title: "Seven security layers", desc: "CSP, HSTS, CSRF, bcrypt, rate limits, validation, sanitization. Auth-grade by default." },
  { icon: Sparkles, title: "Zero API keys", desc: "Runs entirely on your own machine. No OpenAI bill. No vendor lock-in. No surprises." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-white">P</div>
            <span className="font-display font-semibold text-lg tracking-tight">PageForge</span>
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted hover:text-foreground transition-colors">Features</Link>
            <Link href="#how" className="text-muted hover:text-foreground transition-colors">How it works</Link>
            <Link href="/login" className="text-muted hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover font-semibold text-white transition-all hover:-translate-y-0.5">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 mesh-gradient">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] -z-10" />
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-surface/50 mb-8 no-flash">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_12px_#6366f1]" />
            <span className="text-xs text-muted font-medium">7 security layers · 0 API keys · 100% yours</span>
          </div>
          <h1 className="font-display font-semibold text-[clamp(44px,7.5vw,88px)] leading-[1.02] tracking-tight mb-6 no-flash">
            Premium landing pages.<br />
            <span className="animated-gradient">In ten seconds.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed no-flash">
            Describe your business. Get a beautiful, animated, fully-editable landing page. Ship it to a subdomain or download the code.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap no-flash">
            <Link href="/signup" className="group px-7 py-3.5 rounded-lg bg-primary hover:bg-primary-hover font-semibold text-white text-[15px] transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2">
              Generate your first page
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="px-7 py-3.5 rounded-lg border border-border hover:border-muted font-semibold text-[15px] transition-colors">
              See how it works
            </Link>
          </div>
        </div>

        {/* Mockup */}
        <div className="max-w-5xl mx-auto mt-24 relative no-flash">
          <div className="aspect-video rounded-2xl border border-border bg-surface overflow-hidden shadow-2xl shadow-black/50">
            <div className="absolute top-4 left-4 flex gap-1.5 z-10">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div className="h-full grid grid-cols-[240px_1fr] gap-0 pt-12">
              <div className="border-r border-border p-4 space-y-2">
                <div className="h-3 rounded bg-border w-4/5" />
                <div className="h-3 rounded bg-border w-3/5" />
                <div className="h-3 rounded bg-primary/60 w-2/3" />
                <div className="h-3 rounded bg-border w-4/5" />
                <div className="h-3 rounded bg-border w-1/2" />
              </div>
              <div className="p-6 space-y-4">
                <div className="h-4 rounded bg-primary w-1/4" />
                <div className="h-8 rounded bg-border w-2/3" />
                <div className="grid grid-cols-3 gap-3">
                  <div className="aspect-square rounded-lg bg-border" />
                  <div className="aspect-square rounded-lg bg-border" />
                  <div className="aspect-square rounded-lg bg-border" />
                </div>
                <div className="space-y-2">
                  <div className="h-2.5 rounded bg-border w-full" />
                  <div className="h-2.5 rounded bg-border w-5/6" />
                  <div className="h-2.5 rounded bg-border w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Built right</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">
              Every pixel considered. Every byte accounted for.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border rounded-2xl overflow-hidden">
            {features.map((f) => (
              <div key={f.title} className="bg-background p-8 hover:bg-surface transition-colors">
                <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">How it works</p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight">Three steps to live.</h2>
          </div>
          <div className="space-y-10">
            {[
              { n: "01", t: "Describe your product", d: "One sentence. Two. A paragraph. Whatever's natural." },
              { n: "02", t: "Pick a look", d: "Eight themes, five font pairs, four animation levels. Or let us pick." },
              { n: "03", t: "Publish or download", d: "Your page lives at /preview/your-slug, or zips into static HTML you own." },
            ].map((s) => (
              <div key={s.n} className="flex gap-8 items-start border-t border-border pt-10">
                <div className="font-display text-4xl text-primary/70 font-semibold">{s.n}</div>
                <div>
                  <h3 className="font-display text-2xl font-semibold mb-2">{s.t}</h3>
                  <p className="text-muted leading-relaxed">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-3xl mx-auto text-center rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-16">
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] tracking-tight mb-4">Ready when you are.</h2>
          <p className="text-lg text-muted mb-8 max-w-xl mx-auto">
            No credit card. No API key. No catch. Just a working landing page generator on your machine.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary hover:bg-primary-hover font-semibold text-white transition-all hover:-translate-y-0.5 shadow-xl shadow-primary/20">
            Start for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent" />
            <span>PageForge AI · Self-hosted, open-source, yours.</span>
          </div>
          <p>© {new Date().getFullYear()} PageForge</p>
        </div>
      </footer>
    </main>
  );
}
