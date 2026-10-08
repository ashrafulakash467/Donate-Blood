import {
  CirclePlus,
  ClipboardList,
  Droplets,
  LayoutDashboard,
  Search,
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
  { label: 'My profile', to: '/dashboard/profile', icon: UserRound },
  { label: 'My requests', to: '/dashboard/my-donation-requests', icon: Droplets, roles: ['donor'] },
  { label: 'Create request', to: '/dashboard/create-donation-request', icon: CirclePlus, roles: ['donor'] },
  { label: 'Manage requests', to: '/dashboard/all-blood-donation-request', icon: ClipboardList, roles: ['admin', 'volunteer'] },
  { label: 'All users', to: '/dashboard/all-users', icon: UsersRound, roles: ['admin'] },
  { label: 'Find a donor', to: '/search', icon: Search },
]
