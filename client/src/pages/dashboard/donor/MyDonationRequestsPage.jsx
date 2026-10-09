import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppButton } from '../../../components/common/AppButton'
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'
import { EmptyState } from '../../../components/common/EmptyState'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { PageHeader } from '../../../components/common/PageHeader'
import { Pagination } from '../../../components/common/Pagination'
import { MyDonationRequestsTable } from '../../../components/donation/MyDonationRequestsTable'
import { DonationTableSkeleton } from '../../../components/donation/DonationTableSkeleton'
import { SelectField } from '../../../components/forms/SelectField'
import { useDonationRequestActions } from '../../../hooks/useDonationRequestActions'
import { getMyDonationRequests } from '../../../services/donorDonationApi'
import { donationStatuses } from '../../../validators/donationSchema'

const PAGE_SIZE = 10
const statusOptions = donationStatuses.map((status) => ({ value: status, label: status === 'inprogress' ? 'In progress' : status[0].toUpperCase() + status.slice(1) }))

export function MyDonationRequestsPage() {
  const [requests, setRequests] = useState([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRequests = useCallback(async (signal) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyDonationRequests({ page, limit: PAGE_SIZE, ...(status && { status }) }, signal)
      setRequests(data?.items ?? [])
      setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
    } catch (requestError) {
      if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => loadRequests(controller.signal), 0)
    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [loadRequests])

  const actions = useDonationRequestActions(() => loadRequests())
  const changeStatusFilter = (event) => {
    setStatus(event.target.value)
    setPage(1)
  }

  return (
    <section className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Donor requests" title="My donation requests" description="Track every request created by your account and manage its next action." actions={<Link to="/dashboard/create-donation-request"><AppButton><Plus className="size-4" /> Create request</AppButton></Link>} />
      <div className="mt-7 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <SelectField label="Filter by status" options={statusOptions} placeholder="All statuses" value={status} onChange={changeStatusFilter} className="w-full sm:max-w-xs" />
        <p className="text-sm font-semibold text-slate-500">{pagination.total || 0} request{pagination.total === 1 ? '' : 's'}</p>
      </div>
      {loading && <div className="mt-6"><DonationTableSkeleton rows={5} /></div>}
      {error && <div className="mt-6"><ErrorMessage title="Could not load your requests" message={error.message} errors={error.errors} /></div>}
      {!loading && !error && requests.length === 0 && <div className="mt-6"><EmptyState title={status ? `No ${status === 'inprogress' ? 'in-progress' : status} requests` : 'No donation requests yet'} description={status ? 'Try another status filter.' : 'Create your first request when someone needs blood.'} action={!status && <Link to="/dashboard/create-donation-request"><AppButton>Create request</AppButton></Link>} /></div>}
      {!loading && !error && requests.length > 0 && <div className="mt-6"><MyDonationRequestsTable requests={requests} onAction={actions.requestAction} busy={actions.busy} /><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div></div>}
      <ConfirmationModal isOpen={Boolean(actions.pendingAction)} onOpenChange={(open) => !open && actions.closeAction()} title={actions.pendingAction?.title} description={actions.pendingAction?.description} confirmLabel={actions.pendingAction?.confirmLabel} tone={actions.pendingAction?.tone} onConfirm={actions.confirmAction} isLoading={actions.busy} />
    </section>
  )
}
