import { beforeEach, describe, expect, it, vi } from 'vitest'
import { districts, getUpazilasByDistrictName } from '../src/data/bangladeshLocations'
import { loginSchema, registrationSchema } from '../src/validators/authSchemas'
import { profileSchema } from '../src/validators/profileSchema'

const tokenMock = vi.hoisted(() => vi.fn())

vi.mock('../src/lib/auth-client', () => ({
  authClient: { token: tokenMock },
}))

import { axiosSecure } from '../src/services/axiosSecure'

const validRegistration = {
  name: 'Test Donor',
  email: 'donor@example.com',
  avatar: '',
  bloodGroup: 'A+',
  district: 'Dhaka',
  upazila: 'Savar',
  password: 'password123',
  confirmPassword: 'password123',
}

const captureAdapter = async (config) => ({
  data: config,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
})

describe('authentication forms', () => {
  it('accepts the server registration contract', () => {
    expect(registrationSchema.safeParse(validRegistration).success).toBe(true)
  })

  it('rejects mismatched passwords and invalid login values', () => {
    expect(registrationSchema.safeParse({ ...validRegistration, confirmPassword: 'different' }).success).toBe(false)
    expect(loginSchema.safeParse({ email: 'invalid', password: 'short' }).success).toBe(false)
  })

  it('accepts only allowlisted profile fields', () => {
    const result = profileSchema.safeParse({
      name: 'Updated Donor',
      avatar: '',
      bloodGroup: 'O+',
      district: 'Dhaka',
      upazila: 'Savar',
      email: 'ignored@example.com',
    })

    expect(result.success).toBe(false)
  })
})

describe('Bangladesh locations', () => {
  it('contains the complete district list and district-dependent upazilas', () => {
    expect(districts).toHaveLength(64)
    const dhakaUpazilas = getUpazilasByDistrictName('Dhaka')
    expect(dhakaUpazilas.length).toBeGreaterThan(0)
    expect(dhakaUpazilas.some((upazila) => upazila.name === 'Savar')).toBe(true)
  })
})

describe('secure Axios JWT handling', () => {
  beforeEach(() => {
    tokenMock.mockReset()
  })

  it('attaches the verified Better Auth token as a Bearer credential', async () => {
    tokenMock.mockResolvedValue({ data: { token: 'verified-jwt' }, error: null })
    const response = await axiosSecure.get('/private-check', { adapter: captureAdapter })

    expect(response.data.headers.Authorization).toBe('Bearer verified-jwt')
    expect(tokenMock).toHaveBeenCalledOnce()
  })

  it('deduplicates simultaneous token requests', async () => {
    let releaseToken
    tokenMock.mockReturnValue(new Promise((resolve) => {
      releaseToken = resolve
    }))

    const firstRequest = axiosSecure.get('/first', { adapter: captureAdapter })
    const secondRequest = axiosSecure.get('/second', { adapter: captureAdapter })
    await vi.waitFor(() => expect(tokenMock).toHaveBeenCalledOnce())
    releaseToken({ data: { token: 'shared-jwt' }, error: null })

    const [first, second] = await Promise.all([firstRequest, secondRequest])
    expect(first.data.headers.Authorization).toBe('Bearer shared-jwt')
    expect(second.data.headers.Authorization).toBe('Bearer shared-jwt')
  })
})
