import { beforeEach, describe, expect, it, vi } from 'vitest'
import { donationRequestSchema } from '../src/validators/donationSchema'

const apiMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('../src/services/axiosSecure', () => ({
  axiosSecure: apiMocks,
}))

import {
  createDonationRequest,
  deleteDonationRequest,
  getMyDonationRequests,
  getOwnedDonationRequest,
  updateDonationRequest,
  updateDonationStatus,
} from '../src/services/donorDonationApi'

const validRequest = {
  requesterPhone: '+8801712345678',
  recipientName: 'Patient Name',
  recipientDistrict: 'Dhaka',
  recipientUpazila: 'Savar',
  hospitalName: 'General Hospital',
  fullAddress: '123 Hospital Road, Dhaka',
  bloodGroup: 'A+',
  donationDate: '2027-01-15',
  donationTime: '14:30',
  requestMessage: 'Blood is urgently needed for an operation.',
}

describe('donor dashboard API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    for (const mock of Object.values(apiMocks)) mock.mockResolvedValue({ data: { data: {} } })
  })

  it('requests no more than three recent requests for the dashboard', async () => {
    await getMyDonationRequests({ page: 1, limit: 3 })
    expect(apiMocks.get).toHaveBeenCalledWith('/donations/mine', expect.objectContaining({ params: { page: 1, limit: 3 } }))
  })

  it('supports status-filtered pagination', async () => {
    await getMyDonationRequests({ page: 2, limit: 10, status: 'inprogress' })
    expect(apiMocks.get).toHaveBeenCalledWith('/donations/mine', expect.objectContaining({ params: { page: 2, limit: 10, status: 'inprogress' } }))
  })

  it('uses the documented create, details, edit and delete routes', async () => {
    const id = '507f1f77bcf86cd799439011'
    await createDonationRequest(validRequest)
    await getOwnedDonationRequest(id)
    await updateDonationRequest(id, validRequest)
    await deleteDonationRequest(id)
    expect(apiMocks.post).toHaveBeenCalledWith('/donations', validRequest)
    expect(apiMocks.get).toHaveBeenCalledWith(`/donations/${id}`, expect.any(Object))
    expect(apiMocks.patch).toHaveBeenCalledWith(`/donations/${id}`, validRequest)
    expect(apiMocks.delete).toHaveBeenCalledWith(`/donations/${id}`)
  })

  it.each(['done', 'canceled'])('sends the %s status transition in the server contract', async (status) => {
    await updateDonationStatus('507f1f77bcf86cd799439011', status)
    expect(apiMocks.patch).toHaveBeenCalledWith('/donations/507f1f77bcf86cd799439011/status', { donationStatus: status })
  })
})

describe('donation request validation', () => {
  it('accepts the documented request body', () => {
    expect(donationRequestSchema.safeParse(validRequest).success).toBe(true)
  })

  it('rejects invalid dates, time, blood group and short messages', () => {
    expect(donationRequestSchema.safeParse({ ...validRequest, donationDate: '2027-02-30', donationTime: '25:90', bloodGroup: 'C+', requestMessage: 'short' }).success).toBe(false)
  })

  it('accepts Bangladesh requester phone formats and rejects invalid numbers', () => {
    expect(donationRequestSchema.safeParse({ ...validRequest, requesterPhone: '01712345678' }).success).toBe(true)
    expect(donationRequestSchema.safeParse({ ...validRequest, requesterPhone: '8801712345678' }).success).toBe(true)
    expect(donationRequestSchema.safeParse({ ...validRequest, requesterPhone: '' }).success).toBe(true)
    expect(donationRequestSchema.safeParse({ ...validRequest, requesterPhone: '12345' }).success).toBe(false)
  })

  it('does not allow identity or status fields into the payload', () => {
    expect(donationRequestSchema.safeParse({ ...validRequest, requesterEmail: 'spoof@example.com' }).success).toBe(false)
    expect(donationRequestSchema.safeParse({ ...validRequest, donationStatus: 'done' }).success).toBe(false)
  })
})
