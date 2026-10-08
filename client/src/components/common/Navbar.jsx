import { ChevronDown, CircleDollarSign, LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { Dropdown, toast } from '@heroui/react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { publicNavigation } from '../../config/navigation'
import { useAuth } from '../../hooks/useAuth'
import { BrandMark } from './BrandMark'

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
  }`

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { authenticated, loading, logout, profile, user } = useAuth()
  const navigate = useNavigate()
  const displayName = profile?.name || user?.name || 'LifeFlow member'
  const initials = displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Signed out successfully')
      navigate('/', { replace: true })
    } catch (error) {
      toast.danger('Unable to sign out', { description: error.message })
    }
  }

  const handleAccountAction = (key) => {
    if (key === 'dashboard') navigate('/dashboard')
    if (key === 'logout') handleLogout()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav className="page-shell flex h-18 items-center justify-between" aria-label="Primary navigation">
        <BrandMark />

        <div className="hidden items-center gap-1 lg:flex">
          {publicNavigation.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          {!loading && authenticated ? <><NavLink to="/funding" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"><CircleDollarSign className="size-4 text-red-600" /> Funding</NavLink><Dropdown><Dropdown.Trigger className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-2 text-slate-700 shadow-sm hover:border-red-200"><span className="grid size-8 place-items-center overflow-hidden rounded-lg bg-slate-900 text-xs font-black text-white">{profile?.avatar ? <img src={profile.avatar} alt="" className="size-full object-cover" /> : initials}</span><ChevronDown className="size-4" /><span className="sr-only">Open account menu</span></Dropdown.Trigger><Dropdown.Popover placement="bottom end"><Dropdown.Menu aria-label="Account menu" onAction={handleAccountAction}><Dropdown.Item id="dashboard"><LayoutDashboard className="size-4" /> Dashboard</Dropdown.Item><Dropdown.Item id="logout" variant="danger"><LogOut className="size-4" /> Logout</Dropdown.Item></Dropdown.Menu></Dropdown.Popover></Dropdown></> : <><NavLink to="/login" className="rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">Sign in</NavLink><NavLink to="/register" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700">Join as donor</NavLink></>}
        </div>

        <button
          type="button"
          className="grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-700 sm:hidden"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 sm:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {publicNavigation.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass} onClick={() => setIsOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            {!loading && authenticated && <NavLink to="/funding" className={navClass} onClick={() => setIsOpen(false)}>Funding</NavLink>}
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              {!loading && authenticated ? <><NavLink to="/dashboard" className="rounded-xl bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white" onClick={() => setIsOpen(false)}>Dashboard</NavLink><button type="button" className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-bold" onClick={() => { setIsOpen(false); handleLogout() }}>Sign out</button></> : <><NavLink to="/login" className="rounded-xl border border-slate-200 px-4 py-2.5 text-center text-sm font-bold" onClick={() => setIsOpen(false)}>Sign in</NavLink><NavLink to="/register" className="rounded-xl bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white" onClick={() => setIsOpen(false)}>Join now</NavLink></>}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
