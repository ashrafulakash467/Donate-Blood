import axios from 'axios'
import { apiBaseUrl } from '../config/environment'
import { getApiError } from '../utils/getApiError'

export const axiosPublic = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: 'application/json' },
})

axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    error.apiError = getApiError(error)
    return Promise.reject(error)
  },
)
