import { ArrowLeft, LogOut, X } from 'lucide-react'
import { toast } from '@heroui/react'
import { NavLink, useNavigate } from 'react-router-dom'
import { dashboardNavigation } from '../../config/navigation'
import { useAuth } from '../../hooks/useAuth'
import { BrandMark } from '../common/BrandMark'

const linkClass = ({ isActive }) =>
  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
    isActive ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'
  }`

export function DashboardSidebar({ isOpen, onClose }) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const visibleNavigation = dashboardNavigation.filter((item) => !item.roles || item.roles.includes(role))

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.danger('Unable to sign out', { description: error.message })
    }
  }

  return (
    <>
      {isOpen && <button type="button" className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden" aria-label="Close dashboard menu" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-950 px-4 py-5 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <BrandMark inverted />
          <button type="button" className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white lg:hidden" onClick={onClose} aria-label="Close dashboard menu">
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-red-400">Dashboard</p>
          <p className="mt-1 text-sm capitalize text-slate-300">Signed in as {role || 'member'}</p>
        </div>

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto" aria-label="Dashboard navigation">
          {visibleNavigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} onClick={onClose}>
              <Icon className="size-[1.1rem] shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <NavLink to="/" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white"><ArrowLeft className="size-4" /> Website</NavLink>
          <button type="button" onClick={handleLogout} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-semibold text-slate-300 hover:bg-red-600 hover:text-white"><LogOut className="size-4" /> Sign out</button>
        </div>
      </aside>
    </>
  )
}
