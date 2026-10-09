import { Chip } from '@heroui/react'

const statusColors = {
  active: 'success',
  done: 'success',
  paid: 'success',
  completed: 'success',
  pending: 'warning',
  inprogress: 'default',
  blocked: 'danger',
  canceled: 'default',
}

const statusClasses = {
  pending: 'border border-amber-200 bg-amber-50 text-amber-700',
  inprogress: 'border border-sky-200 bg-sky-50 text-sky-700',
  done: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  completed: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  canceled: 'border border-slate-200 bg-slate-100 text-slate-600',
}

export function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'unknown').toLowerCase()
  const label = normalizedStatus === 'inprogress' ? 'In progress' : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

  return (
    <Chip color={statusColors[normalizedStatus] || 'default'} size="sm" variant="soft" className={statusClasses[normalizedStatus] || ''}>
      <Chip.Label className="font-semibold">{label}</Chip.Label>
    </Chip>
  )
}
