"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, Percent, TriangleAlert, Users } from "lucide-react";
import { fetchSummary } from "./api";

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl border border-ink/10 bg-surface"
        />
      ))}
    </div>
  );
}

export function StatCards() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });

  if (isPending) return <Skeleton />;
  if (isError || !data) {
    return (
      <p className="rounded-2xl border border-danger/30 bg-surface p-4 text-sm text-danger">
        Could not load statistics. Please refresh the page.
      </p>
    );
  }

  const cards: {
    label: string;
    value: number;
    suffix?: string;
    icon: typeof Users;
  }[] = [
    { label: "Total leads", value: data.stats.total, icon: Users },
    { label: "Due today", value: data.stats.dueToday, icon: CalendarClock },
    { label: "Overdue", value: data.stats.overdue, icon: TriangleAlert },
    {
      label: "Conversion",
      value: data.stats.conversionPct,
      suffix: "%",
      icon: Percent,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {cards.map(({ label, value, suffix, icon: Icon }) => (
        <div
          key={label}
          className="rounded-2xl border border-ink/10 bg-surface p-4 sm:p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wide text-muted sm:text-sm">
              {label}
            </p>
            <Icon size={16} className="text-accent" aria-hidden="true" />
          </div>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {value.toLocaleString("en-IN")}
            {suffix ? <span className="text-xl text-muted">{suffix}</span> : null}
          </p>
        </div>
      ))}
    </div>
  );
}
