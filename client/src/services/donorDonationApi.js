import { apiEndpoints } from '../config/apiEndpoints'
import { axiosSecure } from './axiosSecure'

function dataFrom(response) {
  return response.data?.data
}

export async function getMyDonationRequests(params, signal) {
  return dataFrom(await axiosSecure.get(apiEndpoints.donations.mine, { params, signal }))
}

export async function getOwnedDonationRequest(id, signal) {
  return dataFrom(await axiosSecure.get(apiEndpoints.donations.details(id), { signal }))
}

export async function createDonationRequest(payload) {
  return dataFrom(await axiosSecure.post(apiEndpoints.donations.create, payload))
}

export async function updateDonationRequest(id, payload) {
  return dataFrom(await axiosSecure.patch(apiEndpoints.donations.details(id), payload))
}

export async function deleteDonationRequest(id) {
  return dataFrom(await axiosSecure.delete(apiEndpoints.donations.details(id)))
}

export async function updateDonationStatus(id, donationStatus) {
  return dataFrom(await axiosSecure.patch(apiEndpoints.donations.status(id), { donationStatus }))
}
