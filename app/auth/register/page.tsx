"use client";

import { useState } from "react";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Scene } from "../../components/landing/scene";
import { ThemeToggle } from "../../components/theme-toggle";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone("");
    if (name.trim().length < 2) {
      setError("Apna naam likho.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Sahi email likho.");
      return;
    }
    if (password.length < 6) {
      setError("Password kam se kam 6 characters ka ho.");
      return;
    }
    // UI-only: backend baad me connect hoga
    setDone("Demo only — backend abhi connect nahi hai.");
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
            Create account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Start tracking every lead in one calm place.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Name</span>
              <input
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-ink/15 bg-bg px-4 py-2.5 text-ink outline-none placeholder:text-muted/70 focus:border-accent"
              />
            </label>

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
                autoComplete="new-password"
                placeholder="Min. 6 characters"
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
            {done ? (
              <p role="status" className="text-sm text-accent">
                {done}
              </p>
            ) : null}

            <button
              type="submit"
              className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-ink underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
