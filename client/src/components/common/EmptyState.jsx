import { Card } from '@heroui/react'
import { Inbox } from 'lucide-react'

export function EmptyState({ title = 'Nothing here yet', description = 'New information will appear here when it becomes available.', action }) {
  return (
    <Card className="border border-dashed border-slate-300 bg-white py-10 text-center shadow-sm">
      <Card.Content className="mx-auto flex max-w-md flex-col items-center px-6">
        <span className="grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><Inbox className="size-6" /></span>
        <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {action && <div className="mt-5">{action}</div>}
      </Card.Content>
    </Card>
  )
}
