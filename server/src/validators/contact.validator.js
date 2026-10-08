import { z } from "zod";

export const createContactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(254).transform((email) => email.toLowerCase()),
  message: z.string().trim().min(10).max(2000),
}).strict();
