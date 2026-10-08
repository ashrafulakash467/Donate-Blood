import { Card } from '@heroui/react'
import { Construction, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from './PageHeader'

export function PlaceholderPage({ eyebrow = 'Foundation ready', title, description, dashboard = false, actionTo = '/', actionLabel = 'Return home' }) {
  return (
    <section className={dashboard ? 'mx-auto max-w-6xl' : 'page-shell py-12 sm:py-16'}>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Card className="mt-8 overflow-hidden border border-slate-200 bg-white shadow-sm">
        <Card.Content className="relative px-6 py-10 sm:px-10">
          <div className="absolute right-0 top-0 size-40 translate-x-12 -translate-y-12 rounded-full bg-red-100 blur-3xl" />
          <span className="relative grid size-12 place-items-center rounded-2xl bg-red-50 text-red-600"><Construction className="size-6" /></span>
          <h2 className="relative mt-5 text-xl font-extrabold text-slate-950">The route is ready</h2>
          <p className="relative mt-2 max-w-2xl text-sm leading-6 text-slate-600">This phase establishes navigation, layout, responsive behavior, and reusable interface patterns. Live data and interactions arrive in their dedicated feature phase.</p>
          <Link to={actionTo} className="relative mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700">
            <Sparkles className="size-4" /> {actionLabel}
          </Link>
        </Card.Content>
      </Card>
    </section>
  )
}
