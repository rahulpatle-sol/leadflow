"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { LEAD_STATUSES } from "@/app/lib/db/schema";
import { STATUS_LABELS } from "@/app/lib/leads/types";
import { createLead } from "./api";

const inputCls =
  "w-full rounded-xl border border-ink/15 bg-bg px-4 py-2.5 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-accent";

export function AddLeadDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<(typeof LEAD_STATUSES)[number]>("new");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setName("");
    setCompany("");
    setPhone("");
    setStatus("new");
    setDate("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Lead ka naam likho.");
      return;
    }
    setSaving(true);
    try {
      await createLead({
        name: name.trim(),
        company: company.trim() || null,
        phone: phone.trim() || null,
        status,
        nextFollowUpAt: date ? new Date(date).toISOString() : null,
      });
      toast.success("Lead add ho gaya.");
      reset();
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["leads"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard", "summary"] }),
      ]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lead nahi bana.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        <Plus size={16} aria-hidden="true" />
        New lead
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add new lead"
            className="w-full max-w-md rounded-3xl border border-ink/10 bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-ink">
                New lead
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted hover:bg-ink/5 hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-4 flex flex-col gap-3"
              noValidate
            >
              <input
                autoFocus
                placeholder="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className={inputCls}
                />
                <input
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                  aria-label="Status"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as typeof status)
                  }
                  className={inputCls}
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  aria-label="Next follow-up date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Add lead"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
