const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '')

export const env = Object.freeze({
  serverUrl: trimTrailingSlash(import.meta.env.VITE_SERVER_URL),
  apiUrl: trimTrailingSlash(import.meta.env.VITE_API_URL),
  imgbbApiKey: import.meta.env.VITE_IMGBB_API_KEY?.trim() || '',
  contactNumber: import.meta.env.VITE_CONTACT_NUMBER || '',
})

export const apiBaseUrl = env.apiUrl || (env.serverUrl ? `${env.serverUrl}/api/v1` : '/api/v1')
