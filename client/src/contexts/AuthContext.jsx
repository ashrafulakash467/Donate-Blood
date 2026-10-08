import { useCallback, useEffect, useMemo, useState } from 'react'
import { authClient } from '../lib/auth-client'
import { axiosSecure } from '../services/axiosSecure'
import { apiEndpoints } from '../config/apiEndpoints'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const sessionState = authClient.useSession()
  const user = sessionState.data?.user ?? null
  const userId = user?.id ?? null
  const refetchSession = sessionState.refetch
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setProfileError(null)
      setProfileLoading(false)
      return null
    }

    setProfileLoading(true)
    try {
      const response = await axiosSecure.get(apiEndpoints.users.me)
      const nextProfile = response.data?.data ?? null
      setProfile(nextProfile)
      setProfileError(null)
      return nextProfile
    } catch (error) {
      setProfile(null)
      setProfileError(error.apiError || { message: error.message })
      return null
    } finally {
      setProfileLoading(false)
    }
  }, [userId])

  const refreshSession = useCallback(async () => {
    setProfileLoading(true)
    await refetchSession()
  }, [refetchSession])

  const logout = useCallback(async () => {
    const result = await authClient.signOut()
    if (result.error) throw new Error(result.error.message || 'Unable to sign out.')
    setProfile(null)
    setProfileError(null)
    await refetchSession()
  }, [refetchSession])

  useEffect(() => {
    if (sessionState.isPending) return undefined
    const timer = window.setTimeout(refreshProfile, 0)
    return () => window.clearTimeout(timer)
  }, [sessionState.isPending, refreshProfile])

  useEffect(() => {
    const handleUnauthorized = async () => {
      setProfile(null)
      setProfileError(null)
      await refreshSession()
    }

    window.addEventListener('lifeflow:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('lifeflow:unauthorized', handleUnauthorized)
  }, [refreshSession])

  const value = useMemo(
    () => ({
      user,
      session: sessionState.data?.session ?? null,
      profile,
      role: profile?.role ?? null,
      status: profile?.status ?? null,
      loading: sessionState.isPending || profileLoading,
      authenticated: Boolean(user),
      profileError,
      logout,
      refreshProfile,
      refreshSession,
    }),
    [user, sessionState.data?.session, sessionState.isPending, profile, profileLoading, profileError, logout, refreshProfile, refreshSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
