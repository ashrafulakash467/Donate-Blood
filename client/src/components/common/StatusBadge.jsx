import { Chip } from '@heroui/react'

const statusColors = {
  active: 'success',
  done: 'success',
  paid: 'success',
  completed: 'success',
  pending: 'warning',
  inprogress: 'accent',
  blocked: 'danger',
  canceled: 'default',
}

export function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'unknown').toLowerCase()
  const label = normalizedStatus === 'inprogress' ? 'In progress' : normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)

  return (
    <Chip color={statusColors[normalizedStatus] || 'default'} size="sm" variant="soft">
      <Chip.Label className="font-semibold">{label}</Chip.Label>
    </Chip>
  )
}
