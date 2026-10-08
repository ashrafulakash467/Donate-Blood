import { z } from "zod";
import { MAX_FUNDING_AMOUNT, MIN_FUNDING_AMOUNT } from "../constants/funding.js";

export const checkoutFundingSchema = z.object({
  amount: z.number().finite().min(MIN_FUNDING_AMOUNT).max(MAX_FUNDING_AMOUNT).refine(
    (amount) => Number.isInteger(amount * 100),
    "Funding amount can have at most two decimal places",
  ),
}).strict();

export const fundingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).strict();
