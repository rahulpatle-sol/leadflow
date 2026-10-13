"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      className="rounded-full border border-ink/20 px-5 py-2.5 text-sm text-ink transition-colors hover:bg-ink/5 disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Logout"}
    </button>
  );
}
