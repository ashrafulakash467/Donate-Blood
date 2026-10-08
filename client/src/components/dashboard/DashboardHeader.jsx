import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function DashboardHeader({ onMenuOpen }) {
  const { profile, user } = useAuth()
  const displayName = profile?.name || user?.name || 'LifeFlow member'
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

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
      <div className="flex items-center gap-3">
        <button type="button" className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Notifications">
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-red-600" />
        </button>
        {profile?.avatar ? <img src={profile.avatar} alt="" className="size-10 rounded-xl object-cover" /> : <div className="grid size-10 place-items-center rounded-xl bg-slate-900 text-sm font-extrabold text-white" aria-label={`${displayName} avatar`}>{initials || 'LF'}</div>}
      </div>
    </header>
  )
}
