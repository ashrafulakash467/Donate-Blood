import { Dropdown, toast } from '@heroui/react'
import { ChevronDown, LogOut, Menu, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function DashboardHeader({ onMenuOpen }) {
  const { logout, profile, user } = useAuth()
  const navigate = useNavigate()
  const [isSigningOut, setIsSigningOut] = useState(false)
  const displayName = profile?.name || user?.name || 'LifeFlow member'
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  const handleLogout = async () => {
    if (isSigningOut) return
    setIsSigningOut(true)
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.danger('Unable to sign out', { description: error.message })
      setIsSigningOut(false)
    }
  }

  const handleAccountAction = (key) => {
    if (key === 'profile') navigate('/dashboard/profile')
    if (key === 'logout') void handleLogout()
  }

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button type="button" className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" onClick={onMenuOpen} aria-label="Open dashboard menu">
          <Menu className="size-5" />
        </button>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">LifeFlow workspace</p>
          <p className="hidden text-sm text-slate-500 sm:block">Manage your donation activity in one place.</p>
        </div>
      </div>
      <Dropdown>
        <Dropdown.Trigger
          className="flex items-center gap-2 rounded-xl border border-transparent bg-white p-1.5 text-slate-700 transition hover:border-slate-200 hover:bg-slate-50 focus-visible:border-red-300"
          aria-label={`Open account menu for ${displayName}`}
        >
          <span className="grid size-10 place-items-center overflow-hidden rounded-xl bg-slate-900 text-sm font-extrabold text-white">
            {profile?.avatar ? <img src={profile.avatar} alt={`${displayName} avatar`} className="size-full object-cover" /> : initials || 'LF'}
          </span>
          <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
        </Dropdown.Trigger>
        <Dropdown.Popover placement="bottom end">
          <Dropdown.Menu aria-label="Dashboard account menu" onAction={handleAccountAction}>
            <Dropdown.Item id="profile">
              <UserRound className="size-4" aria-hidden="true" />
              My profile
            </Dropdown.Item>
            <Dropdown.Item id="logout" variant="danger" isDisabled={isSigningOut}>
              <LogOut className="size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out…' : 'Sign out'}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </header>
  )
}
