import { HeartPulse } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabClass = ({ isActive }) =>
  `flex min-h-9 flex-1 items-center justify-center rounded-lg px-4 text-sm font-bold transition-all focus-visible:outline-none ${
    isActive
      ? 'bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/80'
      : 'text-slate-500 hover:text-slate-800'
  }`

export function AuthCard({ children }) {
  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.08)] sm:p-8">
      <header className="text-center">
        <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-red-50 text-red-600">
          <HeartPulse className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-[1.7rem]">
          Welcome to LifeFlow
        </h1>
        <p className="mt-2 text-sm text-slate-500">Sign in or create an account to continue</p>
      </header>

      <nav className="mt-6 flex rounded-xl bg-slate-100 p-1" aria-label="Authentication options">
        <NavLink to="/login" className={tabClass}>Sign In</NavLink>
        <NavLink to="/register" className={tabClass}>Sign Up</NavLink>
      </nav>

      <div className="mt-6">{children}</div>
    </section>
  )
}
