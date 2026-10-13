"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { LEAD_STATUSES } from "@/app/lib/leads/types";
import { PAGE_SIZES, STATUS_LABELS } from "@/app/lib/leads/types";
import { fetchLeads } from "./api";
import { StatusPill } from "./status-pill";

function updateUrl(
  router: ReturnType<typeof useRouter>,
  pathname: string,
  current: URLSearchParams,
  updates: Record<string, string | null>,
  resetPage: boolean
) {
  const sp = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(updates)) {
    if (v === null || v === "") sp.delete(k);
    else sp.set(k, v);
  }
  if (resetPage) sp.delete("page");
  const qs = sp.toString();
  router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
}

function pageWindow(page: number, totalPages: number): number[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const set = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  return [...set].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
}

const inputCls =
  "rounded-xl border border-ink/15 bg-bg px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent";

export function LeadsTable({
  onSelectLead,
}: {
  onSelectLead: (id: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const rawSize = Number(searchParams.get("pageSize")) || 10;
  const pageSize = PAGE_SIZES.includes(rawSize as (typeof PAGE_SIZES)[number])
    ? rawSize
    : 10;
  const status = searchParams.get("status") ?? "";
  const q = searchParams.get("q") ?? "";

  // Debounced search: type freely, URL updates after 400ms idle.
  // Sync the draft when the URL query changes externally (back/forward nav).
  const [draft, setDraft] = useState(q);
  const [syncedQ, setSyncedQ] = useState(q);
  if (q !== syncedQ) {
    setSyncedQ(q);
    setDraft(q);
  }
  useEffect(() => {
    if (draft === q) return;
    const t = setTimeout(() => {
      updateUrl(router, pathname, searchParams, { q: draft.trim() }, true);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const { data, isPending, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ["leads", page, pageSize, status, q],
    queryFn: () => fetchLeads({ page, pageSize, status, q }),
    placeholderData: keepPreviousData,
  });

  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <section
      aria-label="Leads"
      className="overflow-hidden rounded-2xl border border-ink/10 bg-surface"
    >
      {/* Filters */}
      <div className="flex flex-col gap-2 border-b border-ink/10 p-3 sm:flex-row sm:items-center sm:p-4">
        <label className="relative flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search name, company, phone…"
            aria-label="Search leads"
            className={`${inputCls} w-full pl-10`}
          />
        </label>
        <div className="flex gap-2">
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) =>
              updateUrl(router, pathname, searchParams, { status: e.target.value }, true)
            }
            className={inputCls}
          >
            <option value="">All statuses</option>
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(e) =>
              updateUrl(
                router,
                pathname,
                searchParams,
                { pageSize: e.target.value },
                true
              )
            }
            className={inputCls}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isPending ? (
        <div className="flex flex-col gap-2 p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-xl bg-ink/5" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 text-center">
          <p className="text-sm text-danger">Could not load leads.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-3 rounded-full border border-ink/20 px-5 py-2 text-sm text-ink hover:bg-ink/5"
          >
            Retry
          </button>
        </div>
      ) : data.items.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">
          No leads found. Try clearing the filters or add a new lead.
        </p>
      ) : (
        <div
          className={`overflow-x-auto transition-opacity ${isPlaceholderData ? "opacity-60" : ""}`}
        >
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wide text-muted">
                <th scope="col" className="px-4 py-3 font-medium">Lead</th>
                <th scope="col" className="px-4 py-3 font-medium">Phone</th>
                <th scope="col" className="px-4 py-3 font-medium">Status</th>
                <th scope="col" className="px-4 py-3 font-medium">Last discussion</th>
                <th scope="col" className="px-4 py-3 font-medium">Next follow-up</th>
                <th scope="col" className="px-4 py-3 font-medium">Added</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((lead) => {
                const fu = lead.nextFollowUpAt
                  ? new Date(lead.nextFollowUpAt)
                  : null;
                const overdue =
                  fu !== null &&
                  isBefore(fu, startOfDay(new Date())) &&
                  lead.status !== "won" &&
                  lead.status !== "lost";
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSelectLead(lead.id);
                    }}
                    tabIndex={0}
                    title="Open timeline"
                    className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-ink/[0.02] focus:bg-ink/[0.02] focus:outline-none"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{lead.name}</p>
                      {lead.company ? (
                        <p className="text-xs text-muted">{lead.company}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-muted">{lead.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={lead.status} />
                    </td>
                    <td className="px-4 py-3">
                      {lead.lastNote ? (
                        <>
                          <p className="line-clamp-2 max-w-64 text-ink">
                            {lead.lastNote}
                          </p>
                          {lead.lastDiscussionAt ? (
                            <p className="mt-0.5 text-xs text-muted">
                              {formatDistanceToNow(
                                new Date(lead.lastDiscussionAt),
                                { addSuffix: true }
                              )}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {fu ? (
                        <span className={overdue ? "font-medium text-danger" : "text-ink"}>
                          {format(fu, "d MMM yyyy")}
                          {overdue ? " • overdue" : null}
                        </span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {format(new Date(lead.createdAt), "d MMM yyyy")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data && total > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-ink/10 p-3 sm:flex-row sm:p-4">
          <p className="text-sm text-muted" role="status">
            Showing {from.toLocaleString("en-IN")}–{to.toLocaleString("en-IN")} of{" "}
            {total.toLocaleString("en-IN")}
            {isPlaceholderData ? " • updating…" : ""}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() =>
                updateUrl(router, pathname, searchParams, { page: String(page - 1) }, false)
              }
              className="rounded-lg p-2 text-ink hover:bg-ink/5 disabled:opacity-40"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            {pageWindow(page, totalPages).map((p, i, arr) => (
              <span key={p} className="flex items-center gap-1">
                {i > 0 && p - arr[i - 1]! > 1 ? (
                  <span className="px-1 text-muted">…</span>
                ) : null}
                <button
                  type="button"
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                  onClick={() =>
                    updateUrl(router, pathname, searchParams, { page: String(p) }, false)
                  }
                  className={`min-w-8 rounded-lg px-2 py-1.5 text-sm font-medium ${
                    p === page
                      ? "bg-ink text-bg"
                      : "text-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages}
              onClick={() =>
                updateUrl(router, pathname, searchParams, { page: String(page + 1) }, false)
              }
              className="rounded-lg p-2 text-ink hover:bg-ink/5 disabled:opacity-40"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
