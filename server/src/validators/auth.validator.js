import { z } from "zod";
import { BLOOD_GROUPS } from "../constants/auth.js";

export const registrationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
  avatar: z.union([z.url(), z.literal("")]).optional().default(""),
  bloodGroup: z.enum(BLOOD_GROUPS),
  district: z.string().trim().min(2).max(100),
  upazila: z.string().trim().min(2).max(100),
}).strict();
