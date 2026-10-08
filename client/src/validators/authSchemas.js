import { z } from 'zod'
import { bloodGroups } from '../data/authOptions'

const requiredText = (label) => z.string().trim().min(2, `${label} must contain at least 2 characters.`).max(100, `${label} is too long.`)

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must contain at least 8 characters.').max(128, 'Password is too long.'),
}).strict()

export const registrationSchema = z.object({
  name: requiredText('Name'),
  email: z.email('Enter a valid email address.'),
  avatar: z.union([z.url('Avatar must be a valid URL.'), z.literal('')]),
  bloodGroup: z.enum(bloodGroups, { error: 'Select a blood group.' }),
  district: requiredText('District'),
  upazila: requiredText('Upazila'),
  password: z.string().min(8, 'Password must contain at least 8 characters.').max(128, 'Password is too long.'),
  confirmPassword: z.string(),
}).strict().refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match.',
})
