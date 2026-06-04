import { z } from "zod";

export const AnalyzeRequestSchema = z.object({
  tabs: z.number().min(0).max(300),
  hours: z.number().min(0).max(24),
  tasks: z.string().min(1, "Tasks list cannot be empty"),
  mode: z.enum(["Deep Work", "Research", "Meetings", "Creative Work", "Study"]).optional(),
  anonymousUserId: z.string().min(1)
});

export const HederaLogRequestSchema = z.object({
  sessionId: z.string().min(1),
  actionId: z.string().min(1)
});
