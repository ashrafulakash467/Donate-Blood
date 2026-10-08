import { CircleAlert } from 'lucide-react'

export function ErrorMessage({ title = 'Unable to continue', message, errors = [] }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900" role="alert">
      <div className="flex gap-3">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-red-600" />
        <div>
          <p className="font-bold">{title}</p>
          {message && <p className="mt-1 text-sm text-red-800">{message}</p>}
          {errors.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{errors.map((error, index) => <li key={`${error?.path || 'error'}-${index}`}>{error?.message || String(error)}</li>)}</ul>}
        </div>
      </div>
    </div>
  )
}
