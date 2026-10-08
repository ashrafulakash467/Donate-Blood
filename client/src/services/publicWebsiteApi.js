import { apiEndpoints } from '../config/apiEndpoints'
import { axiosPublic } from './axiosPublic'
import { axiosSecure } from './axiosSecure'

const responseData = (response) => response.data?.data

export async function getPendingDonations(params, signal) {
  return responseData(await axiosPublic.get(apiEndpoints.donations.all, { params, signal }))
}

export async function searchActiveDonors(params, signal) {
  return responseData(await axiosSecure.get(apiEndpoints.users.search, { params, signal }))
}

export async function getDonationDetails(id) {
  return responseData(await axiosSecure.get(apiEndpoints.donations.details(id)))
}

export async function confirmDonationRequest(id) {
  return responseData(await axiosSecure.post(apiEndpoints.donations.confirm(id)))
}

export async function getCompletedFundings(params, signal) {
  return responseData(await axiosPublic.get(apiEndpoints.fundings.all, { params, signal }))
}

export async function createFundingCheckout(amount) {
  return responseData(await axiosSecure.post(apiEndpoints.fundings.checkout, { amount }))
}

export async function submitContactMessage(values) {
  return responseData(await axiosPublic.post(apiEndpoints.contacts, values))
}
