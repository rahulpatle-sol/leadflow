"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { Scene } from "../../components/landing/scene";
import { ThemeToggle } from "../../components/theme-toggle";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Sahi email likho.");
      return;
    }
    if (password.length < 6) {
      setError("Password kam se kam 6 characters ka ho.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? "Login failed. Phir try karo.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Phir try karo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <Scene />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-ink"
        >
          <TrendingUp size={20} className="text-accent" aria-hidden="true" />
          LeadFlow
        </Link>
        <ThemeToggle />
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pb-10">
        <div className="rounded-3xl border border-ink/10 bg-surface/90 p-8 shadow-xl backdrop-blur">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to track your leads and follow-ups.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Email</span>
              <input
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-ink/15 bg-bg px-4 py-2.5 text-ink outline-none placeholder:text-muted/70 focus:border-accent"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-ink/15 bg-bg px-4 py-2.5 text-ink outline-none placeholder:text-muted/70 focus:border-accent"
              />
            </label>

            {error ? (
              <p role="alert" className="text-sm text-danger">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            New here?{" "}
            <Link href="/auth/register" className="font-medium text-ink underline-offset-4 hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
