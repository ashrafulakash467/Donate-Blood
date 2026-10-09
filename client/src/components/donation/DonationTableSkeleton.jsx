export function DonationTableSkeleton({ rows = 3 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-label="Loading donation requests" role="status">
      <div className="hidden grid-cols-7 gap-5 border-b border-slate-200 bg-slate-50 px-5 py-4 lg:grid">
        {Array.from({ length: 7 }, (_, index) => <div key={index} className="h-3 animate-pulse rounded bg-slate-200" />)}
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="grid animate-pulse gap-4 p-5 lg:grid-cols-7 lg:gap-5">
            {Array.from({ length: 7 }, (__, column) => <div key={column} className={`h-4 rounded bg-slate-200 ${column > 2 ? 'hidden lg:block' : ''}`} />)}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading donation requests…</span>
    </div>
  )
}
