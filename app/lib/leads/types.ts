// Client-safe: no drizzle imports here — this module ships to the browser.
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export interface LeadItem {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  status: LeadStatus;
  nextFollowUpAt: string | null;
  createdAt: string;
  lastNote: string | null;
  lastDiscussionAt: string | null;
}

export interface PaginatedLeads {
  items: LeadItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MonthlyBucket {
  key: string;
  label: string;
  count: number;
}

export interface ActivityItem {
  id: string;
  note: string;
  leadId: string;
  leadName: string;
  createdAt: string;
}

export interface DiscussionItem {
  id: string;
  note: string;
  followUpAt: string | null;
  createdAt: string;
}

export interface LeadDetail {
  lead: LeadItem;
  discussions: DiscussionItem[];
}

export interface DashboardStats {
  total: number;
  dueToday: number;
  overdue: number;
  conversionPct: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  monthly: MonthlyBucket[];
  recentActivity: ActivityItem[];
  dueToday: LeadItem[];
  overdue: LeadItem[];
}

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
};

export const PAGE_SIZES = [10, 25, 50] as const;

export const LEAD_VIEWS = ["leads", "followups", "analytics"] as const;
export type LeadView = (typeof LEAD_VIEWS)[number];
