import Link from "next/link";
import { getSession } from "@/lib/security";
import { usersDb } from "@/lib/db";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/dashboard/LogoutButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await usersDb.findById(session.userId);
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-display font-bold text-white">P</div>
            <span className="font-display font-semibold text-lg tracking-tight">PageForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-xs text-muted hidden md:block">
              <span className="font-semibold text-foreground">{user.generationsUsed}</span>
              <span> / {user.generationsLimit} pages this month</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-xs">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-[10px]">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <span className="text-muted max-w-[180px] truncate">{user.email}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}
