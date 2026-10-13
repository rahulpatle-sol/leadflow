import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { getCurrentUser } from "../lib/auth/session";
import { ThemeToggle } from "../components/theme-toggle";
import { LogoutButton } from "./logout-button";
import { DashboardView } from "./components/dashboard-view";

// Session read (cookies) happens at request time, so this route blocks
// on the server instead of prerendering. See Next docs:
// "Authentication with Cache Components" -> set instant = false.
export const instant = false;

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6">
      <header className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-ink"
        >
          <TrendingUp size={20} className="text-accent" aria-hidden="true" />
          LeadFlow
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-muted lg:inline">
            {user.name} • {user.email}
          </span>
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <DashboardView />
    </main>
  );
}
