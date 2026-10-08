import { z } from "zod";
import { BLOOD_GROUPS } from "../constants/auth.js";
import { DONATION_STATUS_VALUES } from "../constants/donation.js";

const isValidCalendarDate = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

const donationFields = {
  recipientName: z.string().trim().min(2).max(100),
  recipientDistrict: z.string().trim().min(2).max(100),
  recipientUpazila: z.string().trim().min(2).max(100),
  hospitalName: z.string().trim().min(2).max(200),
  fullAddress: z.string().trim().min(5).max(500),
  bloodGroup: z.enum(BLOOD_GROUPS),
  donationDate: z.string().refine(isValidCalendarDate, "Use a valid date in YYYY-MM-DD format"),
  donationTime: z.string().regex(
    /^(?:[01]\d|2[0-3]):[0-5]\d$/,
    "Use a valid time in HH:mm 24-hour format",
  ),
  requestMessage: z.string().trim().min(10).max(2000),
};

export const createDonationSchema = z.object(donationFields).strict();

export const updateDonationSchema = z.object(
  Object.fromEntries(
    Object.entries(donationFields).map(([field, schema]) => [field, schema.optional()]),
  ),
).strict().refine((body) => Object.keys(body).length > 0, {
  message: "At least one editable donation field is required",
});

const paginationFields = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
};

export const publicDonationQuerySchema = z.object({
  ...paginationFields,
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  district: z.string().trim().min(1).max(100).optional(),
  upazila: z.string().trim().min(1).max(100).optional(),
  donationDate: z.string().refine(isValidCalendarDate, "Invalid donation date").optional(),
}).strict();

export const myDonationQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(DONATION_STATUS_VALUES).optional(),
}).strict();

export const manageDonationQuerySchema = z.object({
  ...paginationFields,
  status: z.enum(DONATION_STATUS_VALUES).optional(),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  sort: z.enum(["newest", "oldest"]).default("newest"),
}).strict();

export const donationIdParamsSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid donation request ID"),
}).strict();

export const donationStatusSchema = z.object({
  donationStatus: z.enum(DONATION_STATUS_VALUES),
}).strict();
