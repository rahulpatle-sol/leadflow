"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "./api";

const ROWS = 16;
const COL_W = 36;
const DOT_R = 3.2;
const DOT_GAP = 9;

export function MonthlyChart() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["dashboard", "summary"],
    queryFn: fetchSummary,
  });

  if (isPending) {
    return (
      <div className="h-64 animate-pulse rounded-2xl border border-ink/10 bg-surface" />
    );
  }
  if (isError || !data) {
    return (
      <p className="rounded-2xl border border-danger/30 bg-surface p-4 text-sm text-danger">
        Chart load nahi hua.
      </p>
    );
  }

  const max = Math.max(1, ...data.monthly.map((m) => m.count));
  const total = data.monthly.reduce((s, m) => s + m.count, 0);
  const width = data.monthly.length * COL_W;
  const height = ROWS * DOT_GAP + 8;

  return (
    <section
      aria-label="Leads per month"
      className="rounded-2xl border border-ink/10 bg-surface p-4 sm:p-6"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          Monthly leads
        </h2>
        <p className="text-sm text-muted">
          {total.toLocaleString("en-IN")} in last 12 months
        </p>
      </div>

      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height + 22}`}
          className="mx-auto block"
          style={{ width, maxWidth: "100%" }}
          role="img"
          aria-label={`Bar chart of leads per month, max ${max} in a month`}
        >
          {data.monthly.map((m, i) => {
            const filled = Math.round((m.count / max) * ROWS);
            const isCurrent = i === data.monthly.length - 1;
            const cx = i * COL_W + COL_W / 2;
            return (
              <g key={m.key}>
                <title>{`${m.label}: ${m.count} leads`}</title>
                {Array.from({ length: ROWS }, (_, r) => {
                  const cy = 4 + (ROWS - 1 - r) * DOT_GAP;
                  const on = r < filled;
                  return (
                    <circle
                      key={r}
                      cx={cx}
                      cy={cy}
                      r={DOT_R}
                      fill={
                        on
                          ? isCurrent
                            ? "var(--accent)"
                            : "var(--ink)"
                          : "var(--ink)"
                      }
                      opacity={on ? (isCurrent ? 1 : 0.55) : 0.12}
                    />
                  );
                })}
                <text
                  x={cx}
                  y={height + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted)"
                >
                  {m.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
