import { beforeEach, describe, expect, it, vi } from 'vitest'
import { dashboardNavigation } from '../src/config/navigation'
import { getManagedRequestActions, getUserManagementActions } from '../src/utils/dashboardPermissions'

const apiMocks = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))
vi.mock('../src/services/axiosSecure', () => ({ axiosSecure: apiMocks }))

import {
  getAllUsers,
  getDashboardStats,
  getDonationTrends,
  getManagedDonationRequests,
  updateUserRole,
  updateUserStatus,
} from '../src/services/staffDashboardApi'

describe('staff dashboard API integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.get.mockResolvedValue({ data: { data: {} } })
    apiMocks.patch.mockResolvedValue({ data: { data: {} } })
  })

  it('loads real statistics and the requested trend period', async () => {
    await getDashboardStats()
    await getDonationTrends('monthly')
    expect(apiMocks.get).toHaveBeenNthCalledWith(1, '/dashboard/stats', expect.any(Object))
    expect(apiMocks.get).toHaveBeenNthCalledWith(2, '/dashboard/donation-trends', expect.objectContaining({ params: { period: 'monthly' } }))
  })

  it('loads paginated users and sends exact role/status update bodies', async () => {
    const id = '507f1f77bcf86cd799439011'
    await getAllUsers({ page: 2, limit: 10, status: 'blocked' })
    await updateUserStatus(id, 'active')
    await updateUserRole(id, 'volunteer')
    expect(apiMocks.get).toHaveBeenCalledWith('/users', expect.objectContaining({ params: { page: 2, limit: 10, status: 'blocked' } }))
    expect(apiMocks.patch).toHaveBeenCalledWith(`/users/${id}/status`, { status: 'active' })
    expect(apiMocks.patch).toHaveBeenCalledWith(`/users/${id}/role`, { role: 'volunteer' })
  })

  it('loads managed requests with supported filters', async () => {
    const params = { page: 1, limit: 10, status: 'pending', bloodGroup: 'A+', sort: 'newest' }
    await getManagedDonationRequests(params)
    expect(apiMocks.get).toHaveBeenCalledWith('/donations/manage', expect.objectContaining({ params }))
  })
})

describe('role-based dashboard permissions', () => {
  const visibleFor = (role) => dashboardNavigation.filter((item) => !item.roles || item.roles.includes(role)).map((item) => item.to)

  it('shows each role only its authorized sidebar entries', () => {
    expect(visibleFor('admin')).toEqual(['/dashboard', '/dashboard/all-users', '/dashboard/all-blood-donation-request', '/dashboard/profile'])
    expect(visibleFor('volunteer')).toEqual(['/dashboard', '/dashboard/all-blood-donation-request', '/dashboard/profile'])
    expect(visibleFor('donor')).toEqual(['/dashboard', '/dashboard/my-donation-requests', '/dashboard/create-donation-request', '/dashboard/profile'])
  })

  it('never offers edit or delete to volunteers', () => {
    expect(getManagedRequestActions('volunteer', 'inprogress')).toEqual(['view', 'done', 'canceled'])
    expect(getManagedRequestActions('volunteer', 'pending')).toEqual(['view', 'canceled'])
    expect(getManagedRequestActions('volunteer', 'done')).toEqual(['view'])
  })

  it('offers admin management while respecting server status transitions', () => {
    expect(getManagedRequestActions('admin', 'inprogress')).toEqual(['view', 'edit', 'delete', 'done', 'canceled'])
    expect(getManagedRequestActions('admin', 'pending')).toEqual(['view', 'edit', 'delete', 'canceled'])
  })

  it('offers only promotions and correct status action for users', () => {
    expect(getUserManagementActions({ role: 'donor', status: 'active' })).toEqual(['blocked', 'volunteer', 'admin'])
    expect(getUserManagementActions({ role: 'volunteer', status: 'blocked' })).toEqual(['active', 'admin'])
    expect(getUserManagementActions({ role: 'admin', status: 'active' })).toEqual(['blocked'])
  })
})
