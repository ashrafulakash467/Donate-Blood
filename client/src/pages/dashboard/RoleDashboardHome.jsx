import { useAuth } from '../../hooks/useAuth'
import { AdminDashboardHome } from './admin/AdminDashboardHome'
import { DonorDashboardHome } from './donor/DonorDashboardHome'
import { VolunteerDashboardHome } from './volunteer/VolunteerDashboardHome'

export function RoleDashboardHome() {
  const { role } = useAuth()
  if (role === 'admin') return <AdminDashboardHome />
  if (role === 'volunteer') return <VolunteerDashboardHome />
  return <DonorDashboardHome />
}
