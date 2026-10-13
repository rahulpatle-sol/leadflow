import type {
  DashboardSummary,
  LeadDetail,
  PaginatedLeads,
} from "@/app/lib/leads/types";
import type {
  CreateDiscussionInput,
  CreateLeadInput,
  UpdateLeadInput,
} from "@/app/lib/leads/schemas";

async function asJson(res: Response) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string })?.error ?? "Something went wrong. Please try again."
    );
  }
  return data;
}

export interface LeadsParams {
  page: number;
  pageSize: number;
  status: string;
  q: string;
}

export async function fetchLeads(params: LeadsParams): Promise<PaginatedLeads> {
  const sp = new URLSearchParams({
    page: String(params.page),
    pageSize: String(params.pageSize),
  });
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  const res = await fetch(`/api/leads?${sp.toString()}`);
  return (await asJson(res)) as PaginatedLeads;
}

export async function fetchSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/dashboard/summary");
  return (await asJson(res)) as DashboardSummary;
}

export async function createLead(input: CreateLeadInput) {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson(res);
}

export async function fetchLeadDetail(id: string): Promise<LeadDetail> {
  const res = await fetch(`/api/leads/${id}`);
  return (await asJson(res)) as LeadDetail;
}

export async function patchLead(id: string, input: UpdateLeadInput) {
  const res = await fetch(`/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson(res);
}

export async function addDiscussion(id: string, input: CreateDiscussionInput) {
  const res = await fetch(`/api/leads/${id}/discussions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return asJson(res);
}
