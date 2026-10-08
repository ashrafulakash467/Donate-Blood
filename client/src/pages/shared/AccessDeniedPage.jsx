import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AccessDeniedPage({ title = 'Access denied', message = 'Your account does not have permission to view this page.' }) {
  return (
    <section className="grid min-h-[55vh] place-items-center px-4 py-12 text-center">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-red-50 text-red-600"><ShieldX className="size-7" /></span>
        <h1 className="mt-5 text-2xl font-black text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Return to dashboard</Link>
      </div>
    </section>
  )
}
