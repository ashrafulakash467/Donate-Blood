import { z } from 'zod'
import { bloodGroups } from '../data/authOptions'

const calendarDate = /^\d{4}-\d{2}-\d{2}$/
const time24Hour = /^(?:[01]\d|2[0-3]):[0-5]\d$/
const bangladeshPhone = /^(?:\+?88)?01[3-9]\d{8}$/

function isCalendarDate(value) {
  if (!calendarDate.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export const donationRequestSchema = z.object({
  requesterPhone: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? undefined : value,
    z.string().trim().regex(bangladeshPhone, 'Enter a valid Bangladesh phone number.').optional(),
  ),
  recipientName: z.string().trim().min(2, 'Recipient name must be at least 2 characters.').max(100),
  recipientDistrict: z.string().trim().min(2, 'Select a district.').max(100),
  recipientUpazila: z.string().trim().min(2, 'Select an upazila.').max(100),
  hospitalName: z.string().trim().min(2, 'Hospital name must be at least 2 characters.').max(200),
  fullAddress: z.string().trim().min(5, 'Full address must be at least 5 characters.').max(500),
  bloodGroup: z.enum(bloodGroups, { error: 'Select a valid blood group.' }),
  donationDate: z.string().refine(isCalendarDate, 'Enter a valid donation date.'),
  donationTime: z.string().regex(time24Hour, 'Enter a valid donation time.'),
  requestMessage: z.string().trim().min(10, 'Message must be at least 10 characters.').max(2000),
}).strict()

export const donationStatuses = Object.freeze(['pending', 'inprogress', 'done', 'canceled'])

export const emptyDonationRequest = Object.freeze({
  requesterPhone: '',
  recipientName: '',
  recipientDistrict: '',
  recipientUpazila: '',
  hospitalName: '',
  fullAddress: '',
  bloodGroup: '',
  donationDate: '',
  donationTime: '',
  requestMessage: '',
})
