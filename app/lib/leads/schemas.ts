import { z } from "zod";
import { LEAD_STATUSES } from "../db/schema";

export const createLeadSchema = z.object({
  name: z.string().trim().min(2, "Please enter the lead's name.").max(120),
  company: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
  status: z.enum(LEAD_STATUSES).nullish(),
  // ISO datetime string from the client, or null/undefined for "no follow-up"
  nextFollowUpAt: z.string().trim().nullish(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = z.object({
  name: z.string().trim().min(2, "Please enter the lead's name.").max(120).nullish(),
  company: z.string().trim().max(120).nullish(),
  phone: z.string().trim().max(40).nullish(),
  status: z.enum(LEAD_STATUSES).nullish(),
  nextFollowUpAt: z.string().trim().nullish(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const createDiscussionSchema = z.object({
  note: z.string().trim().min(1, "Please enter a discussion note.").max(2000),
  // Optional ISO datetime; when present the lead's follow-up is updated too
  followUpAt: z.string().trim().nullish(),
});

export type CreateDiscussionInput = z.infer<typeof createDiscussionSchema>;
