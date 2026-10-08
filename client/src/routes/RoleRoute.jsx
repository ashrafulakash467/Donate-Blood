import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AccessDeniedPage } from '../pages/shared/AccessDeniedPage'

export function RoleRoute({ allowedRoles }) {
  const { role } = useAuth()

  if (!allowedRoles.includes(role)) return <AccessDeniedPage />
  return <Outlet />
}
