"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { LeadView } from "@/app/lib/leads/types";
import { LEAD_VIEWS } from "@/app/lib/leads/types";
import { Sidebar } from "./sidebar";
import { StatCards } from "./stat-cards";
import { LeadsTable } from "./leads-table";
import { Followups } from "./followups";
import { MonthlyChart } from "./monthly-chart";
import { ActivityFeed } from "./activity-feed";
import { AddLeadDialog } from "./add-lead-dialog";
import { PinnedFollowups } from "./pinned-followups";
import { TimelineDialog } from "./timeline-dialog";

function isView(v: string | null): v is LeadView {
  return (LEAD_VIEWS as readonly string[]).includes(v ?? "");
}

export function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);
  const view: LeadView = isView(searchParams.get("view"))
    ? (searchParams.get("view") as LeadView)
    : "leads";

  function selectView(v: LeadView) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("view", v);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  return (
    <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start">
      <div className="md:sticky md:top-4 md:shrink-0">
        <Sidebar view={view} onSelect={selectView} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <StatCards />

        {view === "leads" ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">
                Leads
              </h2>
              <AddLeadDialog />
            </div>
            <PinnedFollowups onSelectLead={setOpenLeadId} />
            <LeadsTable onSelectLead={setOpenLeadId} />
          </>
        ) : null}

        {view === "followups" ? <Followups onSelectLead={setOpenLeadId} /> : null}

        {view === "analytics" ? (
          <>
            <MonthlyChart />
            <ActivityFeed />
          </>
        ) : null}
      </div>

      <TimelineDialog leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
    </div>
  );
}
