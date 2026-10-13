import Link from "next/link";
import { ArrowRight } from "lucide-react";

const ROWS = [
  { name: "Sarah Connor", company: "Acme Corp", status: "Proposal sent", dot: "bg-[#2545ff]", due: "Today, 2:00 PM", dueRed: false },
  { name: "Hank Scorpio", company: "Globex", status: "Qualified", dot: "bg-[#12a594]", due: "Today, 4:30 PM", dueRed: false },
  { name: "Diana Prince", company: "Themyscira Ltd", status: "New", dot: "bg-[#a2a4ad]", due: "Overdue · 2 days", dueRed: true },
  { name: "Meera Iyer", company: "Initech", status: "Follow-up set", dot: "bg-[#2545ff]", due: "Tomorrow, 11:00 AM", dueRed: false },
];

const FEATURES = [
  {
    title: "A list that stays honest",
    text: "Name, status, last note and time-since-contact on every row. Search and filters live in the URL, so the back button just works.",
  },
  {
    title: "One dialog for the whole story",
    text: "Open any lead to see discussions newest-first. Add a note, set a follow-up time, change status — without leaving the list.",
  },
  {
    title: "Today pins itself",
    text: "Due-today follow-ups sit above the list. Overdue items are marked, quietly, in red. Nothing needs hunting.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#0a0a0b] antialiased">
      {/* ── header ── */}
      <header className="sticky top-0 z-30 border-b border-[#e9eaef] bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-[60px] w-full max-w-[1080px] items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-[18px] w-[18px] rounded-[5px] bg-[#2545ff]" aria-hidden="true" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">LeadFlow</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-7 text-[14px] text-[#63656e] md:flex">
            <Link href="#product" className="transition-colors hover:text-[#0a0a0b]">Product</Link>
            <Link href="#features" className="transition-colors hover:text-[#0a0a0b]">Features</Link>
            <Link href="#method" className="transition-colors hover:text-[#0a0a0b]">Method</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="hidden rounded-lg px-3.5 py-2 text-[14px] font-medium text-[#0a0a0b] transition-colors hover:bg-[#f4f4f6] sm:inline"
            >
              Sign in
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg bg-[#2545ff] px-3.5 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#1a33cc]"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* ── hero ── */}
      <section className="mx-auto w-full max-w-[1080px] px-6 pb-14 pt-20 text-center sm:pt-28">
        <p className="text-[13px] font-medium tracking-[0.02em] text-[#63656e]">
          Lead management, minus the chaos
        </p>
        <h1 className="mx-auto mt-5 max-w-[720px] text-[44px] font-medium leading-[1.02] tracking-[-0.045em] sm:text-[68px]">
          Follow up on time,{" "}
          <span className="serif-accent text-[#2545ff]">every time.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[520px] text-[17px] leading-[1.6] text-[#63656e]">
          LeadFlow keeps every lead, every conversation and every
          reminder in one calm place.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/auth/register"
            className="group inline-flex h-11 items-center gap-1.5 rounded-lg bg-[#2545ff] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#1a33cc]"
          >
            Start for free
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex h-11 items-center rounded-lg border border-[#e1e2e8] px-5 text-[14px] font-medium transition-colors hover:border-[#c9cad2] hover:bg-[#fafafb]"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-[13px] text-[#a2a4ad]">Free · No credit card · 2-minute setup</p>
      </section>

      {/* ── product ── */}
      <section id="product" className="mx-auto w-full max-w-[1080px] scroll-mt-20 px-6 pb-24">
        <div className="overflow-hidden rounded-xl border border-[#e9eaef] bg-white shadow-[0_1px_2px_rgba(10,10,11,0.05),0_24px_64px_-32px_rgba(10,10,11,0.18)]">
          <div className="flex h-11 items-center gap-3 border-b border-[#e9eaef] bg-[#fafafb] px-4">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-[#d4d6dd]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d4d6dd]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#d4d6dd]" />
            </div>
            <p className="mx-auto text-[12.5px] text-[#a2a4ad]">leadflow.app/dashboard</p>
            <span className="w-10" aria-hidden="true" />
          </div>

          <div className="grid grid-cols-3 divide-x divide-[#e9eaef] border-b border-[#e9eaef]">
            {[
              { l: "Total leads", v: "128" },
              { l: "Due today", v: "5" },
              { l: "Overdue", v: "2" },
            ].map((s) => (
              <div key={s.l} className="px-5 py-4 text-left sm:px-6">
                <p className="text-[12px] font-medium text-[#a2a4ad]">{s.l}</p>
                <p className="mt-0.5 text-[26px] font-medium tracking-[-0.03em]">{s.v}</p>
              </div>
            ))}
          </div>

          <div role="img" aria-label="LeadFlow dashboard preview: lead list with statuses and follow-up times">
            <div className="hidden grid-cols-[2fr_1fr_1fr] gap-4 border-b border-[#e9eaef] px-6 py-2.5 text-[11.5px] font-medium uppercase tracking-[0.06em] text-[#a2a4ad] sm:grid">
              <span>Lead</span>
              <span>Status</span>
              <span className="text-right">Follow-up</span>
            </div>
            {ROWS.map((r) => (
              <div
                key={r.name}
                className="grid grid-cols-1 gap-1 border-b border-[#e9eaef] px-5 py-3.5 text-left last:border-0 sm:grid-cols-[2fr_1fr_1fr] sm:items-center sm:gap-4 sm:px-6"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium">{r.name}</span>
                  <span className="block truncate text-[13px] text-[#a2a4ad]">{r.company}</span>
                </span>
                <span className="flex items-center gap-2 text-[13.5px] text-[#3d3f47]">
                  <span className={`h-1.5 w-1.5 rounded-full ${r.dot}`} aria-hidden="true" />
                  {r.status}
                </span>
                <span className={`text-[13.5px] sm:text-right ${r.dueRed ? "font-medium text-[#d92d20]" : "text-[#63656e]"}`}>
                  {r.due}
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-[13px] text-[#a2a4ad]">
          Today&apos;s follow-ups pin to the top. Overdue is marked in red.
        </p>
      </section>

      {/* ── logos ── */}
      <section className="border-y border-[#e9eaef]">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <p className="text-[13px] text-[#a2a4ad]">Trusted by sales teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[13.5px] font-medium text-[#63656e]">
            {["Globex", "Acme Corp", "Initech", "Hooli", "Umbrella"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── features ── */}
      <section id="features" className="mx-auto w-full max-w-[1080px] scroll-mt-20 px-6 py-24">
        <p className="text-[13px] font-medium text-[#2545ff]">Features</p>
        <h2 className="mt-3 max-w-[560px] text-[32px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
          Everything a rep needs. Nothing they don&apos;t.
        </h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 border-t border-[#e9eaef] pt-10 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div key={f.title}>
              <p className="text-[12.5px] font-medium tabular-nums text-[#a2a4ad]">0{i + 1}</p>
              <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.01em]">{f.title}</h3>
              <p className="mt-2 text-[14.5px] leading-[1.65] text-[#63656e]">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── method ── */}
      <section id="method" className="border-t border-[#e9eaef] bg-[#fafafb] scroll-mt-20">
        <div className="mx-auto grid w-full max-w-[1080px] gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-[13px] font-medium text-[#2545ff]">Method</p>
            <h2 className="mt-3 text-[32px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
              Three steps.<br />Zero dropped balls.
            </h2>
            <Link href="/auth/register" className="group mt-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-[#2545ff]">
              Try it yourself
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
          <ol className="divide-y divide-[#e9eaef] border-y border-[#e9eaef]">
            {[
              { n: "01", t: "Capture in seconds", d: "Name required, rest optional. The lead is in your pipeline before your coffee cools." },
              { n: "02", t: "Log every word", d: "Timeline keeps discussions newest-first. Notes, follow-up time, status — one dialog." },
              { n: "03", t: "Show up on time", d: "Today pins itself to the top. You just call, note, and close." },
            ].map((s) => (
              <li key={s.n} className="flex gap-6 py-6">
                <span className="w-8 shrink-0 text-[13px] font-medium tabular-nums text-[#a2a4ad]">{s.n}</span>
                <span>
                  <span className="block text-[15.5px] font-semibold">{s.t}</span>
                  <span className="mt-1 block max-w-[480px] text-[14.5px] leading-[1.6] text-[#63656e]">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── numbers ── */}
      <section className="mx-auto w-full max-w-[1080px] px-6 py-24">
        <div className="grid grid-cols-2 gap-y-10 border-t border-[#e9eaef] pt-10 md:grid-cols-4">
          {[
            { v: "99.9%", l: "Follow-up reliability" },
            { v: "38%", l: "More deals closed" },
            { v: "12k+", l: "Reps run on LeadFlow" },
            { v: "4.9 / 5", l: "Average rating" },
          ].map((m) => (
            <div key={m.l}>
              <p className="text-[32px] font-medium tracking-[-0.03em]">{m.v}</p>
              <p className="mt-1 text-[13.5px] text-[#63656e]">{m.l}</p>
            </div>
          ))}
        </div>

        <figure className="mx-auto mt-24 max-w-[640px] text-center">
          <blockquote className="serif-accent text-[26px] leading-[1.4] text-[#0a0a0b] sm:text-[30px]">
            “We stopped losing leads the week we switched. The pinned strip
            at the top is our revenue dashboard now.”
          </blockquote>
          <figcaption className="mt-5 text-[13.5px] text-[#63656e]">
            Aarav Rao — Head of Sales, Globex
          </figcaption>
        </figure>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-[#e9eaef]">
        <div className="mx-auto w-full max-w-[1080px] px-6 py-24 text-center">
          <h2 className="mx-auto max-w-[520px] text-[32px] font-medium leading-[1.1] tracking-[-0.03em] sm:text-[40px]">
            Ready when <span className="serif-accent text-[#2545ff]">you</span> are.
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[15px] leading-[1.6] text-[#63656e]">
            Create an account and see your pipeline come alive in minutes.
          </p>
          <div className="mt-7 flex items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="inline-flex h-11 items-center rounded-lg bg-[#0a0a0b] px-5 text-[14px] font-medium text-white transition-colors hover:bg-[#2545ff]"
            >
              Get started — it&apos;s free
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex h-11 items-center rounded-lg border border-[#e1e2e8] px-5 text-[14px] font-medium transition-colors hover:bg-[#fafafb]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-[#e9eaef]">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center justify-between gap-3 px-6 py-7 text-[13.5px] text-[#a2a4ad] sm:flex-row">
          <span className="flex items-center gap-2 font-medium text-[#0a0a0b]">
            <span className="h-[14px] w-[14px] rounded-[4px] bg-[#2545ff]" aria-hidden="true" />
            LeadFlow
          </span>
          <p>Next.js + Postgres · Built for sales reps</p>
          <div className="flex items-center gap-5">
            <Link href="/auth/login" className="transition-colors hover:text-[#0a0a0b]">Sign in</Link>
            <Link href="/auth/register" className="transition-colors hover:text-[#0a0a0b]">Register</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
