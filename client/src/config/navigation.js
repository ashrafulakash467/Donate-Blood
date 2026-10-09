import {
  CirclePlus,
  ClipboardList,
  Droplets,
  LayoutDashboard,
  UserRound,
  UsersRound,
} from 'lucide-react'

export const publicNavigation = [
  { label: 'Home', to: '/' },
  { label: 'Donation requests', to: '/donation-requests' },
  { label: 'Find donors', to: '/search' },
]

export const dashboardNavigation = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'All users', to: '/dashboard/all-users', icon: UsersRound, roles: ['admin'] },
  { label: 'My requests', to: '/dashboard/my-donation-requests', icon: Droplets, roles: ['donor'] },
  { label: 'Create request', to: '/dashboard/create-donation-request', icon: CirclePlus, roles: ['donor'] },
  { label: 'All donation requests', to: '/dashboard/all-blood-donation-request', icon: ClipboardList, roles: ['admin', 'volunteer'] },
  { label: 'My profile', to: '/dashboard/profile', icon: UserRound },
]
