import { Droplets, HandHeart, LoaderCircle, ShieldCheck } from 'lucide-react'

const demoUsers = Object.freeze([
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@lifeflow.com',
    password: 'Admin@12345',
    icon: ShieldCheck,
  },
  {
    role: 'volunteer',
    label: 'Volunteer',
    email: 'volunteer@lifeflow.com',
    password: 'Volunteer@12345',
    icon: HandHeart,
  },
  {
    role: 'donor',
    label: 'Donor',
    email: 'donor@lifeflow.com',
    password: 'Donor@12345',
    icon: Droplets,
  },
])

export function DemoLoginPanel({ activeRole, disabled, onSelect }) {
  return (
    <section className="mt-6" aria-labelledby="demo-login-heading">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-200" />
        <span id="demo-login-heading" className="text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
          Demo Users
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {demoUsers.map(({ role, label, email, password, icon: Icon }) => {
          const isActive = activeRole === role
          return (
            <button
              key={role}
              type="button"
              className="flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-3 text-xs font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-60"
              disabled={disabled}
              aria-label={`Sign in as demo ${label}`}
              onClick={() => onSelect({ role, email, password })}
            >
              {isActive ? <LoaderCircle className="size-5 animate-spin text-red-600" aria-hidden="true" /> : <Icon className="size-5 text-red-600" aria-hidden="true" />}
              <span>{isActive ? 'Signing in…' : label}</span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs leading-5 text-slate-400">Quick access for project demonstration</p>
    </section>
  )
}
