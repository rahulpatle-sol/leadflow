"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { CalendarClock, Phone, X } from "lucide-react";
import { toast } from "sonner";
import { LEAD_STATUSES } from "@/app/lib/leads/types";
import { STATUS_LABELS } from "@/app/lib/leads/types";
import { addDiscussion, fetchLeadDetail, patchLead } from "./api";

const inputCls =
  "rounded-xl border border-ink/15 bg-bg px-3 py-2 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent";

export function TimelineDialog({
  leadId,
  onClose,
}: {
  leadId: string | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [wantFollowUp, setWantFollowUp] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isPending, isError } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => fetchLeadDetail(leadId!),
    enabled: leadId !== null,
  });

  // Reset the form when a different lead opens (derived state during render).
  const [openedLeadId, setOpenedLeadId] = useState(leadId);
  if (leadId !== openedLeadId) {
    setOpenedLeadId(leadId);
    setNote("");
    setWantFollowUp(false);
    setDate("");
    setTime("");
  }
  // Escape closes; lock scroll while open.
  useEffect(() => {
    if (leadId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [leadId, onClose]);

  if (leadId === null) return null;

  async function refreshAll() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] }),
      queryClient.invalidateQueries({ queryKey: ["leads"] }),
      queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] }),
    ]);
  }

  async function handleStatusChange(status: string) {
    try {
      await patchLead(leadId!, { status: status as (typeof LEAD_STATUSES)[number] });
      toast.success("Status updated.");
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the status.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (note.trim().length === 0) {
      toast.error("Please enter a discussion note.");
      return;
    }
    let followUpAt: string | null = null;
    if (wantFollowUp) {
      if (!date || !time) {
        toast.error("Please select both a date and a time for the follow-up.");
        return;
      }
      const d = new Date(`${date}T${time}`);
      if (Number.isNaN(d.getTime())) {
        toast.error("The follow-up date and time are invalid.");
        return;
      }
      followUpAt = d.toISOString();
    }
    setSaving(true);
    try {
      await addDiscussion(leadId!, { note: note.trim(), followUpAt });
      toast.success("Note saved.");
      setNote("");
      setWantFollowUp(false);
      setDate("");
      setTime("");
      await refreshAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={data ? `${data.lead.name} timeline` : "Lead timeline"}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-ink/10 bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-ink/10 p-5">
          <div className="min-w-0">
            {isPending || !data ? (
              <div className="h-7 w-48 animate-pulse rounded-lg bg-ink/10" />
            ) : (
              <>
                <h2 className="truncate font-display text-xl font-semibold text-ink">
                  {data.lead.name}{" "}
                  {data.lead.company ? (
                    <span className="font-normal text-muted">
                      ({data.lead.company})
                    </span>
                  ) : null}
                </h2>
                {data.lead.phone ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                    <Phone size={14} aria-hidden="true" />
                    {data.lead.phone}
                  </p>
                ) : null}
              </>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              aria-label="Lead status"
              value={data?.lead.status ?? "new"}
              disabled={!data}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`${inputCls} max-w-40`}
            >
              {LEAD_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-5">
          {isPending ? (
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-xl bg-ink/5" />
              ))}
            </div>
          ) : isError || !data ? (
            <p className="text-sm text-danger">
              Could not load the timeline. Please close and reopen this dialog.
            </p>
          ) : data.discussions.length === 0 ? (
            <p className="text-sm text-muted">
              No discussions yet. Add the first note below.
            </p>
          ) : (
            <ol className="relative flex flex-col gap-5 border-l-2 border-ink/10 pl-5">
              {data.discussions.map((d, i) => (
                <li key={d.id} className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-surface ${
                      i === 0 ? "bg-accent" : "bg-ink/30"
                    }`}
                  />
                  <p className="text-xs text-muted">
                    {format(new Date(d.createdAt), "MMM d, h:mm a")} (
                    {formatDistanceToNow(new Date(d.createdAt), {
                      addSuffix: true,
                    })}
                    )
                  </p>
                  <div className="mt-1.5 rounded-xl border border-ink/10 bg-bg/60 p-3">
                    <p className="whitespace-pre-wrap text-sm text-ink">
                      {d.note}
                    </p>
                    {d.followUpAt ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                        <CalendarClock size={13} aria-hidden="true" />
                        Follow-up set for:{" "}
                        {format(new Date(d.followUpAt), "MMM d, h:mm a")}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Add-note form */}
        <form
          onSubmit={handleSave}
          className="border-t border-ink/10 p-4 sm:p-5"
          noValidate
        >
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Log a new discussion…"
            aria-label="New discussion note"
            rows={3}
            className={`${inputCls} w-full resize-y`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5 text-sm text-ink">
              <input
                type="checkbox"
                checked={wantFollowUp}
                onChange={(e) => setWantFollowUp(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Set Follow-up
            </label>
            {wantFollowUp ? (
              <>
                <input
                  type="date"
                  aria-label="Follow-up date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
                <input
                  type="time"
                  aria-label="Follow-up time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={inputCls}
                />
              </>
            ) : null}
            <button
              type="submit"
              disabled={saving || !data}
              className="ml-auto rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
