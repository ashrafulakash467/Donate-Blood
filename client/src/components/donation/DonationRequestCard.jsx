import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate, formatTime } from '../../utils/formatters'

export function DonationRequestCard({ donation }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-br from-red-50 to-white p-5">
        <div><p className="text-xs font-extrabold uppercase tracking-widest text-red-600">Blood needed for</p><h2 className="mt-2 text-xl font-black text-slate-950">{donation.recipientName}</h2></div>
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/20">{donation.bloodGroup}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-3 text-sm text-slate-600">
          <p className="flex items-center gap-3"><MapPin className="size-4 shrink-0 text-red-500" /> {donation.recipientUpazila}, {donation.recipientDistrict}</p>
          <p className="flex items-center gap-3"><CalendarDays className="size-4 shrink-0 text-red-500" /> {formatDate(donation.donationDate)}</p>
          <p className="flex items-center gap-3"><Clock3 className="size-4 shrink-0 text-red-500" /> {formatTime(donation.donationTime)}</p>
        </div>
        <Link to={`/donation-requests/${donation._id}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600">View Details <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></Link>
      </div>
    </article>
  )
}
