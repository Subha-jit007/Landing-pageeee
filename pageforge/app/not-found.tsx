import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">404</p>
        <h1 className="font-display text-5xl font-semibold mb-4">Page not found.</h1>
        <p className="text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist, or may have been unpublished.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
