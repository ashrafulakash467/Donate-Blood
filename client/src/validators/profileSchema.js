import { z } from 'zod'
import { bloodGroups } from '../data/authOptions'

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  avatar: z.union([z.url('Avatar must be a valid URL.'), z.literal('')]),
  bloodGroup: z.enum(bloodGroups, { error: 'Select a blood group.' }),
  district: z.string().trim().min(2, 'Select a district.').max(100),
  upazila: z.string().trim().min(2, 'Select an upazila.').max(100),
}).strict()
