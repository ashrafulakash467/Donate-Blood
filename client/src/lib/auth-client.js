import { jwtClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import { env } from '../config/environment'

export const authClient = createAuthClient({
  ...(env.serverUrl ? { baseURL: env.serverUrl } : {}),
  fetchOptions: { credentials: 'include' },
  plugins: [jwtClient()],
})
