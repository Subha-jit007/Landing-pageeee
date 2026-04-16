import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col px-8 py-10">
        <Link href="/" className="flex items-center gap-2.5 mb-16">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-white">P</div>
          <span className="font-display font-semibold text-lg tracking-tight">PageForge</span>
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-sm">{children}</div>
        </div>
        <p className="text-center text-xs text-muted">
          Protected by 7 security layers. Your credentials never leave your server.
        </p>
      </div>
      {/* Right — visual */}
      <div className="hidden lg:block flex-1 relative overflow-hidden bg-surface border-l border-border">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 flex items-center justify-center p-16">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">Premium by default</p>
            <h2 className="font-display text-4xl font-semibold leading-tight mb-6">
              Every page ships with smooth scroll, scroll-triggered reveals, and typography that doesn&apos;t scream &ldquo;AI.&rdquo;
            </h2>
            <p className="text-muted leading-relaxed">
              PageForge generates production-ready HTML locally. No API keys. No vendor lock-in. Just a clean ZIP when you&apos;re done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
