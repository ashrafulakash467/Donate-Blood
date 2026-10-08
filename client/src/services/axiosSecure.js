import axios from 'axios'
import { apiBaseUrl } from '../config/environment'
import { authClient } from '../lib/auth-client'
import { getApiError } from '../utils/getApiError'

export const axiosSecure = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

let tokenRequest = null
let isHandlingUnauthorized = false

function notifyUnauthorized() {
  if (isHandlingUnauthorized || typeof window === 'undefined') return
  isHandlingUnauthorized = true
  window.dispatchEvent(new Event('lifeflow:unauthorized'))
  window.setTimeout(() => {
    isHandlingUnauthorized = false
  }, 1_000)
}

async function getVerifiedToken() {
  if (!tokenRequest) {
    tokenRequest = authClient.token().finally(() => {
      tokenRequest = null
    })
  }

  const { data, error } = await tokenRequest
  if (error || !data?.token) {
    throw new Error(error?.message || 'Your authentication session has expired.')
  }

  return data.token
}

axiosSecure.interceptors.request.use(async (config) => {
  try {
    const token = await getVerifiedToken()
    config.headers.Authorization = `Bearer ${token}`
    return config
  } catch (error) {
    notifyUnauthorized()
    throw error
  }
})

axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    error.apiError = getApiError(error)

    if (error.response?.status === 401) notifyUnauthorized()

    return Promise.reject(error)
  },
)
