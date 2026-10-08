import { Card } from '@gravity-ui/uikit'
import { Activity, CirclePlus, HeartHandshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/common/PageHeader'

export function DashboardHomePage() {
  return (
    <section className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Overview" title="Welcome to your dashboard" description="Your role-specific metrics and recent activity will appear here after authentication is connected." />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[{ icon: Activity, title: 'Live activity', text: 'Donation data will come directly from the API.' }, { icon: HeartHandshake, title: 'Your impact', text: 'Track requests and confirmed donations.' }, { icon: CirclePlus, title: 'Quick action', text: 'Start a clear, validated donation request.' }].map(({ icon: Icon, title, text }) => (
          <Card key={title} type="container" view="outlined" size="l" className="bg-white p-6">
            <Icon className="size-6 text-red-600" />
            <h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
          </Card>
        ))}
      </div>
      <Link to="/dashboard/create-donation-request" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 hover:bg-red-700"><CirclePlus className="size-4" /> Create a request</Link>
    </section>
  )
}
