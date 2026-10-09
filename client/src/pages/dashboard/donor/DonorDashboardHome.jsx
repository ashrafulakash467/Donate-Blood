import { Card } from '@gravity-ui/uikit'
import { CirclePlus, Droplets, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppButton } from '../../../components/common/AppButton'
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { PageHeader } from '../../../components/common/PageHeader'
import { MyDonationRequestsTable } from '../../../components/donation/MyDonationRequestsTable'
import { DonationTableSkeleton } from '../../../components/donation/DonationTableSkeleton'
import { useAuth } from '../../../hooks/useAuth'
import { useDonationRequestActions } from '../../../hooks/useDonationRequestActions'
import { useRefreshOnFocus } from '../../../hooks/useRefreshOnFocus'
import { getMyDonationRequests } from '../../../services/donorDonationApi'

export function DonorDashboardHome() {
  const { profile } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRecent = useCallback(async (signal, showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      const data = await getMyDonationRequests({ page: 1, limit: 3 }, signal)
      setRequests((data?.items ?? []).slice(0, 3))
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])
  const refreshRecent = useCallback(() => loadRecent(undefined, false), [loadRecent])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => loadRecent(controller.signal), 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadRecent])

  useRefreshOnFocus(refreshRecent)

  const actions = useDonationRequestActions(() => loadRecent())

  return (
    <section className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Donor overview" title={`Welcome, ${profile?.name || 'donor'}`} description="Manage your profile and blood donation requests from one secure place." />
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {[{ icon: UserRound, title: 'Keep details current', text: 'Accurate location and blood-group information helps people find you.', to: '/dashboard/profile' }, { icon: Droplets, title: 'Your requests', text: 'Review the status of requests created from your account.', to: '/dashboard/my-donation-requests' }, { icon: CirclePlus, title: 'Request blood', text: 'Create a clear request using your verified identity.', to: '/dashboard/create-donation-request' }].map(({ icon: Icon, title, text, to }) => (
          <Card key={title} type="container" view="outlined" size="l" className="bg-white p-6">
            <Icon className="size-6 text-red-600" /><h2 className="mt-5 text-lg font-extrabold text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><Link to={to} className="mt-5 inline-flex text-sm font-bold text-red-600 hover:text-red-700">Open section →</Link>
          </Card>
        ))}
      </div>
      {loading && <div className="mt-10"><DonationTableSkeleton rows={3} /></div>}
      {error && <div className="mt-10"><ErrorMessage title="Could not load recent requests" message={error.message} /></div>}
      {!loading && !error && requests.length > 0 && <section className="mt-10"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-600">Latest activity</p><h2 className="mt-1 text-2xl font-black text-slate-950">Recent donation requests</h2></div><Link to="/dashboard/my-donation-requests"><AppButton tone="outline">View my all requests</AppButton></Link></div><MyDonationRequestsTable requests={requests} onAction={actions.requestAction} busy={actions.busy} /></section>}
      <ConfirmationModal isOpen={Boolean(actions.pendingAction)} onOpenChange={(open) => !open && actions.closeAction()} title={actions.pendingAction?.title} description={actions.pendingAction?.description} confirmLabel={actions.pendingAction?.confirmLabel} tone={actions.pendingAction?.tone} onConfirm={actions.confirmAction} isLoading={actions.busy} />
    </section>
  )
}
