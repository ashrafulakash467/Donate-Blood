import { beforeEach, describe, expect, it, vi } from 'vitest'
import { contactFormSchema, contactSchema, toContactPayload } from '../src/validators/contactSchema'
import { fundingSchema } from '../src/validators/fundingSchema'
import { isStripeCheckoutUrl } from '../src/utils/stripeCheckout'

const apiMocks = vi.hoisted(() => ({
  publicGet: vi.fn(),
  publicPost: vi.fn(),
  secureGet: vi.fn(),
  securePost: vi.fn(),
}))

vi.mock('../src/services/axiosPublic', () => ({
  axiosPublic: { get: apiMocks.publicGet, post: apiMocks.publicPost },
}))

vi.mock('../src/services/axiosSecure', () => ({
  axiosSecure: { get: apiMocks.secureGet, post: apiMocks.securePost },
}))

import {
  confirmDonationRequest,
  createFundingCheckout,
  getCompletedFundings,
  getDonationDetails,
  getPendingDonations,
  searchActiveDonors,
  submitContactMessage,
} from '../src/services/publicWebsiteApi'

describe('public website API integration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads the pending donation endpoint with pagination', async () => {
    const payload = { items: [{ _id: 'request-1', donationStatus: 'pending' }], pagination: { page: 2 } }
    apiMocks.publicGet.mockResolvedValue({ data: { data: payload } })
    await expect(getPendingDonations({ page: 2, limit: 9 })).resolves.toEqual(payload)
    expect(apiMocks.publicGet).toHaveBeenCalledWith('/donations', expect.objectContaining({ params: { page: 2, limit: 9 } }))
  })

  it('sends only selected donor filters to the protected search endpoint', async () => {
    apiMocks.secureGet.mockResolvedValue({ data: { data: { items: [], pagination: {} } } })
    await searchActiveDonors({ bloodGroup: 'A+', district: 'Dhaka', page: 1, limit: 8 })
    expect(apiMocks.secureGet).toHaveBeenCalledWith('/users/search', expect.objectContaining({ params: { bloodGroup: 'A+', district: 'Dhaka', page: 1, limit: 8 } }))
  })

  it('loads and confirms a private donation request using the documented routes', async () => {
    apiMocks.secureGet.mockResolvedValue({ data: { data: { _id: '507f1f77bcf86cd799439011' } } })
    apiMocks.securePost.mockResolvedValue({ data: { data: { donationStatus: 'inprogress' } } })
    await getDonationDetails('507f1f77bcf86cd799439011')
    await expect(confirmDonationRequest('507f1f77bcf86cd799439011')).resolves.toMatchObject({ donationStatus: 'inprogress' })
    expect(apiMocks.secureGet).toHaveBeenCalledWith('/donations/507f1f77bcf86cd799439011')
    expect(apiMocks.securePost).toHaveBeenCalledWith('/donations/507f1f77bcf86cd799439011/confirm')
  })

  it('loads confirmed funding and creates Checkout with server-valid amounts', async () => {
    apiMocks.publicGet.mockResolvedValue({ data: { data: { items: [], pagination: {} } } })
    apiMocks.securePost.mockResolvedValue({ data: { data: { checkoutUrl: 'https://checkout.stripe.com/test' } } })
    await getCompletedFundings({ page: 1, limit: 10 })
    await expect(createFundingCheckout(150)).resolves.toMatchObject({ checkoutUrl: 'https://checkout.stripe.com/test' })
    expect(apiMocks.securePost).toHaveBeenCalledWith('/fundings/checkout', { amount: 150 })
  })

  it('submits only the documented contact fields', async () => {
    const contact = { name: 'Visitor Name', email: 'visitor@example.com', message: 'I would like more information.' }
    apiMocks.publicPost.mockResolvedValue({ data: { data: { id: 'contact-1' } } })
    await submitContactMessage(contact)
    expect(apiMocks.publicPost).toHaveBeenCalledWith('/contacts', contact)
  })
})

describe('funding and contact safety', () => {
  it('matches server amount limits and rejects unsafe checkout URLs', () => {
    expect(fundingSchema.safeParse({ amount: 100 }).success).toBe(true)
    expect(fundingSchema.safeParse({ amount: 99 }).success).toBe(false)
    expect(isStripeCheckoutUrl('https://checkout.stripe.com/c/pay/test')).toBe(true)
    expect(isStripeCheckoutUrl('https://example.com/fake-checkout')).toBe(false)
  })

  it('enforces the server contact contract', () => {
    expect(contactSchema.safeParse({ name: 'Visitor', email: 'visitor@example.com', message: 'A sufficiently detailed message.' }).success).toBe(true)
    expect(contactSchema.safeParse({ name: 'V', email: 'bad', message: 'short' }).success).toBe(false)
    const payload = toContactPayload({ name: 'Visitor', email: 'visitor@example.com', contactNumber: '+880 1712 345678', message: 'A sufficiently detailed message.' })
    expect(contactFormSchema.safeParse({ name: 'Visitor', email: 'visitor@example.com', contactNumber: 'not-a-number', message: 'A sufficiently detailed message.' }).success).toBe(false)
    expect(payload).not.toHaveProperty('contactNumber')
    expect(payload.message).toContain('+880 1712 345678')
  })
})
