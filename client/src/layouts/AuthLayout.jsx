import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { BrandMark } from '../components/common/BrandMark'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-red-600/20 blur-3xl" />
        <BrandMark inverted />
        <div className="relative max-w-lg">
          <p className="text-sm font-extrabold uppercase tracking-[0.24em] text-red-400">A community that responds</p>
          <h1 className="mt-5 text-5xl font-black leading-tight tracking-tight">One account. More chances to save a life.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">Register as a donor, request blood responsibly, and keep every step clear.</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck className="size-5 text-red-400" /> Secure identity and permission-aware access</p>
      </section>
      <section className="flex min-h-screen flex-col p-5 sm:p-8">
        <Link to="/" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-700"><ArrowLeft className="size-4" /> Back to home</Link>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-10"><Outlet /></div>
      </section>
    </main>
  )
}
