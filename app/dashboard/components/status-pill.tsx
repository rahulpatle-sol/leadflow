import type { LeadStatus } from "@/app/lib/leads/types";
import { STATUS_LABELS } from "@/app/lib/leads/types";

const STYLES: Record<LeadStatus, string> = {
  new: "bg-ink/5 text-ink",
  contacted: "bg-accent/10 text-accent",
  qualified: "bg-accent/15 text-accent",
  proposal_sent: "bg-accent/20 text-accent",
  won: "bg-accent text-bg",
  lost: "bg-danger/10 text-danger",
};

export function StatusPill({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
