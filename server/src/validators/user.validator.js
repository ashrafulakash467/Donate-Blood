import { z } from "zod";
import { BLOOD_GROUPS, USER_ROLES, USER_STATUSES } from "../constants/auth.js";

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const updateOwnProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  avatar: z.union([z.url(), z.literal("")]).optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  district: z.string().trim().min(2).max(100).optional(),
  upazila: z.string().trim().min(2).max(100).optional(),
}).strict().refine((body) => Object.keys(body).length > 0, {
  message: "At least one profile field is required",
});

export const donorSearchQuerySchema = z.object({
  ...paginationFields,
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  district: z.string().trim().min(1).max(100).optional(),
  upazila: z.string().trim().min(1).max(100).optional(),
}).strict();

export const listUsersQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(Object.values(USER_STATUSES)).optional(),
}).strict();

export const mongoIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid user profile ID"),
}).strict();

export const updateUserStatusSchema = z.object({
  status: z.enum(Object.values(USER_STATUSES)),
}).strict();

export const updateUserRoleSchema = z.object({
  role: z.enum(Object.values(USER_ROLES)),
}).strict();
