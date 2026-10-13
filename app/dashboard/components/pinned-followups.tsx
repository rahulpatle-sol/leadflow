"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Pin } from "lucide-react";
import { fetchSummary } from "./api";
import { StatusPill } from "./status-pill";

// Today's follow-ups pinned at the top of the leads list (wireframe 1).
// Outside pagination — driven by the summary query, not the table query.
export function PinnedFollowups({
  onSelectLead,
}: {
  onSelectLead: (id: string) => void;
}) {
  const { data, isPending } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });

  if (isPending || !data || data.dueToday.length === 0) return null;

  return (
    <section aria-label="Today's follow-ups">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted">
        <Pin size={13} aria-hidden="true" />
        Today&apos;s follow-ups
      </p>
      <ul className="flex flex-col gap-2">
        {data.dueToday.map((lead) => (
          <li key={lead.id}>
            <button
              type="button"
              onClick={() => onSelectLead(lead.id)}
              className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border border-accent/40 bg-surface px-4 py-3 text-left transition-colors hover:bg-accent/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {lead.name}{" "}
                  {lead.company ? (
                    <span className="font-normal text-muted">
                      ({lead.company})
                    </span>
                  ) : null}
                </p>
                {lead.lastNote ? (
                  <p className="mt-0.5 truncate text-sm text-muted">
                    <span className="font-medium text-ink">Last Note:</span>{" "}
                    {lead.lastNote}
                  </p>
                ) : null}
              </div>
              <StatusPill status={lead.status} />
              {lead.nextFollowUpAt ? (
                <span className="rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                  Follow-up today at{" "}
                  {format(new Date(lead.nextFollowUpAt), "h:mm a")}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
