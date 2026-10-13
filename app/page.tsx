import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { Scene } from "./components/landing/scene";
import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      <Scene />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <TrendingUp size={20} className="text-accent" aria-hidden="true" />
          LeadFlow
        </span>
        <Link href="/auth/login" className="text-sm text-ink/80 hover:text-ink">
          Sign in
        </Link>
      </header>

      <section className="relative z-10 mx-auto mt-14 flex max-w-3xl flex-col items-center px-6 text-center sm:mt-20">
        <h1 className="font-display text-5xl font-semibold tracking-tight text-ink sm:text-7xl">
          Follow up on time. Every time.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink/70">
          LeadFlow keeps every lead, every conversation and every reminder in
          one calm place.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/auth/register"
            className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Try the demo
          </Link>
          <Link
            href="/auth/login"
            className="rounded-full border border-ink/20 px-6 py-3 text-sm text-ink transition-colors hover:bg-ink/5"
          >
            Sign in
          </Link>
        </div>
      </section>

      <div className="relative z-10 mt-auto flex justify-center pb-8 pt-16">
        <ThemeToggle />
      </div>
    </main>
  );
}