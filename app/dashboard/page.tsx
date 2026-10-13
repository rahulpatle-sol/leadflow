import Link from "next/link";
import { redirect } from "next/navigation";
import { TrendingUp } from "lucide-react";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getCurrentUser } from "../lib/auth/session";
import { LEAD_VIEWS, PAGE_SIZES, type LeadView } from "../lib/leads/types";
import { ThemeToggle } from "../components/theme-toggle";
import { LogoutButton } from "./logout-button";
import { DashboardView } from "./components/dashboard-view";
import { GET as getSummary } from "../api/dashboard/summary/route";
import { GET as getLeads } from "../api/leads/route";

// Session read (cookies) happens at request time, so this route blocks
// on the server instead of prerendering. See Next docs:
// "Authentication with Cache Components" -> set instant = false.
export const instant = false;

interface DashboardSearchParams {
  view?: string;
  page?: string;
  pageSize?: string;
  status?: string;
  q?: string;
}

function parseView(v: string | undefined): LeadView {
  return (LEAD_VIEWS as readonly string[]).includes(v ?? "")
    ? (v as LeadView)
    : "leads";
}

// Prefetch dashboard data on the server (same keys the client queries use)
// so first paint shows real content instead of skeletons. On failure we
// fall through — the client refetches and shows its error UI.
async function prefetchDashboard(sp: DashboardSearchParams) {
  const view = parseView(sp.view);
  const page = Math.max(1, Number(sp.page) || 1);
  const rawSize = Number(sp.pageSize) || 10;
  const pageSize = PAGE_SIZES.includes(
    rawSize as (typeof PAGE_SIZES)[number]
  )
    ? rawSize
    : 10;
  const status = sp.status ?? "";
  const q = sp.q ?? "";

  const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  });

  try {
    await queryClient.prefetchQuery({
      queryKey: ["dashboard", "summary"],
      queryFn: async () => {
        const res = await getSummary();
        if (!res.ok) throw new Error("Summary prefetch failed.");
        return res.json();
      },
    });

    if (view === "leads") {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (status) params.set("status", status);
      if (q) params.set("q", q);
      await queryClient.prefetchQuery({
        queryKey: ["leads", page, pageSize, status, q],
        queryFn: async () => {
          const res = await getLeads(
            new Request(`http://localhost/api/leads?${params.toString()}`)
          );
          if (!res.ok) throw new Error("Leads prefetch failed.");
          return res.json();
        },
      });
    }
  } catch {
    // Client-side fetching takes over below.
  }

  return dehydrate(queryClient);
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<DashboardSearchParams>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const dehydratedState = await prefetchDashboard(await searchParams);

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

      <HydrationBoundary state={dehydratedState}>
        <DashboardView />
      </HydrationBoundary>
    </main>
  );
}
