import { Spinner } from '@heroui/react'

export function LoadingSpinner({ label = 'Loading…', fullPage = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-sm font-medium text-slate-600 ${fullPage ? 'min-h-[45vh]' : 'py-8'}`} role="status">
      <Spinner color="danger" size="md" />
      <span>{label}</span>
    </div>
  )
}
