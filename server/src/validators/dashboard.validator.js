import { z } from "zod";

export const donationTrendQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
}).strict();
