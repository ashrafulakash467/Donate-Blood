import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const read = (relativePath) => readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8')

describe('Vercel deployment configuration', () => {
  it('keeps BrowserRouter deep links on the SPA entry point', () => {
    const config = JSON.parse(read('vercel.json'))
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' })
  })

  it('documents public client configuration without server secrets', () => {
    const example = read('.env.example')
    expect(example).toContain('VITE_SERVER_URL=http://localhost:5000')
    expect(example).toContain('VITE_API_URL=http://localhost:5000/api/v1')
    expect(example).toContain('VITE_STRIPE_PUBLISHABLE_KEY=')
    expect(example).not.toMatch(/MONGODB_URI|BETTER_AUTH_SECRET|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET/)
  })
})

describe('client authentication security', () => {
  it('retrieves Better Auth JWTs without browser persistence', () => {
    const secureAxios = read('src/services/axiosSecure.js')
    expect(secureAxios).toContain('authClient.token()')
    expect(secureAxios).toContain('Authorization = `Bearer ${token}`')
    expect(secureAxios).not.toContain('localStorage')
  })

  it('uses credentialed Better Auth and Axios requests', () => {
    expect(read('src/lib/auth-client.js')).toContain("credentials: 'include'")
    expect(read('src/services/axiosSecure.js')).toContain('withCredentials: true')
    expect(read('src/services/axiosPublic.js')).toContain('withCredentials: true')
  })

  it('contains no hardcoded production backend or secret credentials', () => {
    const files = [
      'src/config/environment.js',
      'src/lib/auth-client.js',
      'src/services/axiosPublic.js',
      'src/services/axiosSecure.js',
    ].map(read).join('\n')
    expect(files).not.toMatch(/mongodb\+srv|sk_live_|sk_test_|whsec_/i)
    expect(files).not.toContain('http://localhost')
  })
})
