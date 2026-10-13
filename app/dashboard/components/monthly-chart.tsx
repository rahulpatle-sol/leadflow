"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchSummary } from "./api";

const ROWS = 7;
const CELL = 14;
const GAP = 5;
const PITCH = CELL + GAP;

/** GitHub-style intensity: empty + 4 blue steps driven by the theme accent. */
function fillFor(level: number): string {
  switch (level) {
    case 0:
      return "var(--line)";
    case 1:
      return "color-mix(in srgb, var(--accent) 25%, transparent)";
    case 2:
      return "color-mix(in srgb, var(--accent) 50%, transparent)";
    case 3:
      return "color-mix(in srgb, var(--accent) 75%, transparent)";
    default:
      return "var(--accent)";
  }
}

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
        Could not load the chart.
      </p>
    );
  }

  const max = Math.max(1, ...data.monthly.map((m) => m.count));
  const total = data.monthly.reduce((s, m) => s + m.count, 0);
  const width = data.monthly.length * PITCH - GAP;
  const gridHeight = ROWS * PITCH - GAP;
  const labelPad = 22;
  const height = gridHeight + labelPad;

  return (
    <section
      aria-label="Monthly lead activity"
      className="rounded-2xl border border-ink/10 bg-surface p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-ink">
          Monthly activity
        </h2>
        <p className="text-sm text-muted">
          {total.toLocaleString("en-IN")}{" "}
          {total === 1 ? "lead" : "leads"} in the last 12 months
        </p>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No leads created in the last 12 months. New leads will appear here.
        </p>
      ) : (
        <div className="mt-5 overflow-x-auto pb-1">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="block"
            style={{ width, maxWidth: "100%" }}
            role="img"
            aria-label={`Contribution graph of leads per month, busiest month has ${max} leads`}
          >
            {data.monthly.map((m, i) => {
              const filled = Math.round((m.count / max) * ROWS);
              const isCurrent = i === data.monthly.length - 1;
              const x = i * PITCH;
              return (
                <g key={m.key}>
                  <title>{`${m.label}: ${m.count} ${m.count === 1 ? "lead" : "leads"}`}</title>
                  {Array.from({ length: ROWS }, (_, r) => {
                    // Bottom-aligned fill, like GitHub weeks read left-to-right.
                    const level = r < ROWS - filled ? 0 : filled === 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(((r - (ROWS - filled) + 1) / filled) * 4)));
                    const y = r * PITCH;
                    return (
                      <rect
                        key={r}
                        x={x}
                        y={y}
                        width={CELL}
                        height={CELL}
                        rx={3.5}
                        fill={fillFor(level)}
                        stroke={isCurrent && level > 0 ? "var(--accent-deep)" : "none"}
                        strokeWidth={isCurrent && level > 0 ? 1 : 0}
                      />
                    );
                  })}
                  <text
                    x={x + CELL / 2}
                    y={gridHeight + 16}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="var(--muted)"
                  >
                    {m.label}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((l) => (
              <span
                key={l}
                aria-hidden="true"
                className="inline-block h-[11px] w-[11px] rounded-[3px]"
                style={{ background: fillFor(l) }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      )}
    </section>
  );
}
