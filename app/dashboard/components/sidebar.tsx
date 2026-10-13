"use client";

import { BarChart3, CalendarClock, Users } from "lucide-react";
import type { LeadView } from "@/app/lib/leads/types";

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
  return (
    <nav
      aria-label="Dashboard sections"
      className="flex gap-1 rounded-2xl border border-ink/10 bg-surface p-1.5 md:w-48 md:flex-col md:gap-1 md:p-2"
    >
      {ITEMS.map(({ key, label, icon: Icon }) => {
        const active = view === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-current={active ? "page" : undefined}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors md:justify-start md:px-3.5 md:py-2.5 ${
              active
                ? "bg-ink text-bg"
                : "text-muted hover:bg-ink/5 hover:text-ink"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            <span className="hidden sm:inline md:inline">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
