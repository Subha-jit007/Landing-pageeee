import { getSession } from "@/lib/security";
import { usersDb, pagesDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";
import PageCard from "@/components/dashboard/PageCard";
import NewPageButton from "@/components/dashboard/NewPageButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = await usersDb.findById(session.userId);
  if (!user) redirect("/login");

  const pages = await pagesDb.findByUserId(user.id);
  const remaining = Math.max(0, user.generationsLimit - user.generationsUsed);

  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight mb-2">
            Your pages
          </h1>
          <p className="text-muted">
            {pages.length === 0
              ? "Let's make your first one."
              : `${pages.length} ${pages.length === 1 ? "page" : "pages"} · ${remaining} ${remaining === 1 ? "generation" : "generations"} remaining`}
          </p>
        </div>
        <NewPageButton />
      </div>

      {pages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((p) => {
            const { htmlContent: _, userId: __, ...summary } = p;
            return <PageCard key={p.id} page={summary} />;
          })}
        </div>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface/30 px-8 py-20 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-5">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
      <h2 className="font-display text-2xl font-semibold mb-2">No pages yet.</h2>
      <p className="text-muted text-sm max-w-md mx-auto">
        Describe your business in a sentence and PageForge will generate a fully-animated landing page for you to edit.
      </p>
    </div>
  );
}
