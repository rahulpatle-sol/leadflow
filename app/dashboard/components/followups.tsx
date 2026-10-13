"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarClock, TriangleAlert } from "lucide-react";
import type { LeadItem } from "@/app/lib/leads/types";
import { fetchSummary } from "./api";
import { StatusPill } from "./status-pill";

function LeadRow({ lead }: { lead: LeadItem }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-ink/5 bg-bg/60 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{lead.name}</p>
        {lead.company ? (
          <p className="truncate text-xs text-muted">{lead.company}</p>
        ) : null}
      </div>
      <StatusPill status={lead.status} />
      {lead.nextFollowUpAt ? (
        <span className="text-xs text-muted">
          {format(new Date(lead.nextFollowUpAt), "d MMM, h:mm a")}
        </span>
      ) : null}
    </li>
  );
}

export function Followups() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-40 animate-pulse rounded-2xl border border-ink/10 bg-surface" />
        <div className="h-40 animate-pulse rounded-2xl border border-ink/10 bg-surface" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <p className="rounded-2xl border border-danger/30 bg-surface p-4 text-sm text-danger">
        Follow-ups load nahi hue.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Pinned: always on top, outside pagination */}
      <section
        aria-label="Today's follow-ups"
        className="rounded-2xl border border-accent/40 bg-surface p-4 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <CalendarClock size={18} className="text-accent" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Today&apos;s follow-ups
          </h2>
          <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            {data.dueToday.length}
          </span>
        </div>
        {data.dueToday.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Aaj koi follow-up due nahi hai. Calm day.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data.dueToday.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </section>

      <section
        aria-label="Overdue follow-ups"
        className="rounded-2xl border border-ink/10 bg-surface p-4 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <TriangleAlert size={18} className="text-danger" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-ink">
            Overdue
          </h2>
          <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-medium text-danger">
            {data.overdue.length}
          </span>
        </div>
        {data.overdue.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Kuch overdue nahi hai. Badhiya.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {data.overdue.map((lead) => (
              <LeadRow key={lead.id} lead={lead} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
