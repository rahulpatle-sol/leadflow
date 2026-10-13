"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquareText } from "lucide-react";
import { fetchSummary } from "./api";

export function ActivityFeed() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });

  return (
    <section
      aria-label="Recent activity"
      className="rounded-2xl border border-ink/10 bg-surface p-4 sm:p-6"
    >
      <h2 className="font-display text-lg font-semibold text-ink">
        Recent activity
      </h2>

      {isPending ? (
        <div className="mt-4 flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-xl bg-ink/5"
            />
          ))}
        </div>
      ) : isError || !data ? (
        <p className="mt-4 text-sm text-danger">Activity load nahi hui.</p>
      ) : data.recentActivity.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Abhi koi discussion nahi hai. Lead pe note add karte hi yahan
          dikhega.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {data.recentActivity.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-xl border border-ink/5 bg-bg/60 p-3"
            >
              <span className="mt-0.5 rounded-full bg-accent/10 p-2 text-accent">
                <MessageSquareText size={14} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">
                  {a.leadName}
                </p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  {a.note}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {formatDistanceToNow(new Date(a.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
