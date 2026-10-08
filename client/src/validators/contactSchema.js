import { z } from 'zod'

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  message: z.string().trim().min(10, 'Message must contain at least 10 characters.').max(2000, 'Message cannot exceed 2000 characters.'),
}).strict()

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, 'Name must contain at least 2 characters.').max(100),
  email: z.email('Enter a valid email address.').max(254),
  contactNumber: z.string().trim().min(7, 'Enter a valid contact number.').max(20).regex(/^\+?[\d\s()-]+$/, 'Enter a valid contact number.'),
  message: z.string().trim().min(10, 'Message must contain at least 10 characters.').max(1900, 'Message cannot exceed 1900 characters.'),
}).strict()

export function toContactPayload(values) {
  const form = contactFormSchema.parse(values)
  return contactSchema.parse({
    name: form.name,
    email: form.email,
    message: `Contact number: ${form.contactNumber}\n\n${form.message}`,
  })
}
