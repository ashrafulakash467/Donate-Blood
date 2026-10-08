import { z } from 'zod'

export const fundingSchema = z.object({
  amount: z.coerce.number().finite().min(100, 'Minimum funding amount is ৳100.').max(1_000_000, 'Maximum funding amount is ৳1,000,000.').refine((amount) => Number.isInteger(amount * 100), 'Use no more than two decimal places.'),
}).strict()
