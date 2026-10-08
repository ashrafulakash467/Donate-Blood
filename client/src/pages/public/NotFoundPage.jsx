import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-shell grid min-h-[60vh] place-items-center py-16 text-center">
      <div><p className="text-7xl font-black text-red-600">404</p><h1 className="mt-4 text-3xl font-black text-slate-950">This page could not be found</h1><p className="mt-3 text-slate-600">The link may be outdated or the address may be incorrect.</p><Link to="/" className="mt-7 inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-red-700">Return home</Link></div>
    </section>
  )
}
