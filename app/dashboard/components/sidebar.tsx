"use client";

import { BarChart3, CalendarClock, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { LeadView } from "@/app/lib/leads/types";
import { fetchSummary } from "./api";

const ITEMS: { key: LeadView; label: string; icon: typeof Users }[] = [
  { key: "leads", label: "Leads", icon: Users },
  { key: "followups", label: "Follow-ups", icon: CalendarClock },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar({
  view,
  onSelect,
}: {
  view: LeadView;
  onSelect: (v: LeadView) => void;
}) {
  const { data } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });
  const followUpCount =
    (data?.dueToday.length ?? 0) + (data?.overdue.length ?? 0);

  return (
    <nav
      aria-label="Dashboard sections"
      className="flex gap-1 rounded-2xl border border-ink/10 bg-surface p-1.5 md:w-52 md:flex-col md:gap-1 md:p-2"
    >
      <p className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-widest text-muted md:block">
        Workspace
      </p>
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const active = view === key;
        const badge = key === "followups" ? followUpCount : 0;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:justify-start md:px-3.5 md:py-2.5 ${
              active
                ? "bg-accent text-white shadow-[0_10px_24px_-10px_rgba(37,69,255,0.8)]"
                : "text-muted hover:bg-accent-soft hover:text-ink"
            }`}
          >
            <Icon size={16} aria-hidden="true" className="shrink-0" />
            <span className="hidden sm:inline md:inline">{label}</span>
            {badge > 0 ? (
              <span
                aria-label={`${badge} follow-ups need attention`}
                className={`ml-auto hidden rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums sm:inline ${
                  active ? "bg-white/20 text-white" : "bg-accent/10 text-accent"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}
