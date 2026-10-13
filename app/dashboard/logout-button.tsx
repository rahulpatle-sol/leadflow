"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink transition-colors hover:border-danger/50 hover:bg-danger/10 hover:text-danger disabled:opacity-60"
    >
      <LogOut size={15} aria-hidden="true" />
      {loading ? "Signing out…" : "Logout"}
    </button>
  );
}
