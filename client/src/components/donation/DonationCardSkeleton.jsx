export function DonationCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="flex justify-between bg-slate-50 p-5"><div className="space-y-3"><div className="h-3 w-24 rounded bg-slate-200" /><div className="h-6 w-40 rounded bg-slate-200" /></div><div className="size-14 rounded-2xl bg-slate-200" /></div>
      <div className="space-y-4 p-5"><div className="h-4 w-3/4 rounded bg-slate-200" /><div className="h-4 w-2/3 rounded bg-slate-200" /><div className="h-4 w-1/2 rounded bg-slate-200" /><div className="mt-6 h-10 rounded-xl bg-slate-200" /></div>
    </div>
  )
}
