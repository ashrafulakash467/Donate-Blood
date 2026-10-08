import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { useAuth } from '../hooks/useAuth'
import { AccessDeniedPage } from '../pages/shared/AccessDeniedPage'

export function PrivateRoute() {
  const { authenticated, loading, profile, profileError, status } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingSpinner fullPage label="Restoring your secure session…" />
  if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />
  if (status === 'blocked' || !profile) {
    return <AccessDeniedPage title="Account access unavailable" message={profileError?.message || 'This account cannot access private application features.'} />
  }

  return <Outlet />
}
