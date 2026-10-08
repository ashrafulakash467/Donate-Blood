import { HeartHandshake, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { BrandMark } from './BrandMark'
import { env } from '../../config/environment'

const currentYear = new Date().getFullYear()

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <BrandMark inverted />
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
            Connecting voluntary donors with people who need blood, with clarity, dignity, and care.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Explore</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link to="/donation-requests" className="hover:text-white">Donation requests</Link>
            <Link to="/search" className="hover:text-white">Find donors</Link>
            <Link to="/funding" className="hover:text-white">Support the mission</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-white">Community</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="flex items-center gap-2"><MapPin className="size-4 text-red-500" /> Bangladesh</p>
            <p className="flex items-center gap-2"><Phone className="size-4 text-red-500" /> {env.contactNumber || 'Contact us through the form'}</p>
            <p className="flex items-center gap-2"><HeartHandshake className="size-4 text-red-500" /> Built for voluntary giving</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {currentYear} LifeFlow. Every drop matters.
      </div>
    </footer>
  )
}
