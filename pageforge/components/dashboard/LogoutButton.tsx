"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function onClick() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={onClick}
      className="p-2 rounded-lg hover:bg-surface text-muted hover:text-foreground transition-colors"
      title="Sign out"
    >
      <LogOut className="w-4 h-4" />
    </button>
  );
}
