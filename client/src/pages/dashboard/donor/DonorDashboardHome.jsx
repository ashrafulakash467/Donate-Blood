import { Card } from '@gravity-ui/uikit'
import { CirclePlus, Droplets, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../../components/common/PageHeader'

export function DonorDashboardHome() {
  return (
    <section className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Donor overview" title="Ready when someone needs you" description="Manage your donor profile and blood donation requests from one secure place." />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[{ icon: UserRound, title: 'Keep details current', text: 'Accurate location and blood-group information helps people find you.', to: '/dashboard/profile' }, { icon: Droplets, title: 'Your requests', text: 'Review the status of requests created from your account.', to: '/dashboard/my-donation-requests' }, { icon: CirclePlus, title: 'Request blood', text: 'Create a clear request using your verified identity.', to: '/dashboard/create-donation-request' }].map(({ icon: Icon, title, text, to }) => (
          <Card key={title} type="container" view="outlined" size="l" className="bg-white p-6">
            <Icon className="size-6 text-red-600" /><h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><Link to={to} className="mt-5 inline-flex text-sm font-bold text-red-600 hover:text-red-700">Open section →</Link>
          </Card>
        ))}
      </div>
    </section>
  )
}
