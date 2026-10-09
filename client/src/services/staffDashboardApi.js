import { apiEndpoints } from '../config/apiEndpoints'
import { axiosSecure } from './axiosSecure'

const responseData = (response) => response.data?.data

export async function getDashboardStats(signal) {
  return responseData(await axiosSecure.get(apiEndpoints.dashboard.stats, { signal }))
}

export async function getDonationTrends(period, signal) {
  return responseData(await axiosSecure.get(apiEndpoints.dashboard.donationTrends, { params: { period }, signal }))
}

export async function getAllUsers(params, signal) {
  return responseData(await axiosSecure.get(apiEndpoints.users.all, { params, signal }))
}

export async function updateUserStatus(id, status) {
  return responseData(await axiosSecure.patch(apiEndpoints.users.status(id), { status }))
}

export async function updateUserRole(id, role) {
  return responseData(await axiosSecure.patch(apiEndpoints.users.role(id), { role }))
}

export async function getManagedDonationRequests(params, signal) {
  return responseData(await axiosSecure.get(apiEndpoints.donations.manage, { params, signal }))
}

export async function cancelDonorAssignment(id) {
  return responseData(await axiosSecure.patch(apiEndpoints.donations.cancelAssignment(id)))
}
