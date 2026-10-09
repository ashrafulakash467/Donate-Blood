import { useCallback, useEffect, useState } from 'react'
import { ConfirmationModal } from '../../../components/common/ConfirmationModal'
import { EmptyState } from '../../../components/common/EmptyState'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { PageHeader } from '../../../components/common/PageHeader'
import { Pagination } from '../../../components/common/Pagination'
import { DonationTableSkeleton } from '../../../components/donation/DonationTableSkeleton'
import { ManagedDonationRequestsTable } from '../../../components/donation/ManagedDonationRequestsTable'
import { SelectField } from '../../../components/forms/SelectField'
import { bloodGroups } from '../../../data/authOptions'
import { useAuth } from '../../../hooks/useAuth'
import { useDonationRequestActions } from '../../../hooks/useDonationRequestActions'
import { getManagedDonationRequests } from '../../../services/staffDashboardApi'
import { donationStatuses } from '../../../validators/donationSchema'

const PAGE_SIZE = 10
const statusOptions = donationStatuses.map((status) => ({ value: status, label: status === 'inprogress' ? 'In progress' : status[0].toUpperCase() + status.slice(1) }))
const sortOptions = [{ value: 'newest', label: 'Newest first' }, { value: 'oldest', label: 'Oldest first' }]

export function AllDonationRequestsPage() {
  const { role } = useAuth()
  const [requests, setRequests] = useState([])
  const [filters, setFilters] = useState({ status: '', bloodGroup: '', sort: 'newest' })
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadRequests = useCallback(async (signal) => {
    setLoading(true); setError(null)
    try {
      const params = { page, limit: PAGE_SIZE, sort: filters.sort, ...(filters.status && { status: filters.status }), ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }) }
      const data = await getManagedDonationRequests(params, signal)
      setRequests(data?.items ?? []); setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
    } catch (requestError) { if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message }) }
    finally { if (!signal?.aborted) setLoading(false) }
  }, [page, filters])

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => loadRequests(controller.signal), 0)
    return () => { window.clearTimeout(timer); controller.abort() }
  }, [loadRequests])

  const actions = useDonationRequestActions(() => loadRequests())
  const updateFilter = (field, value) => { setFilters((current) => ({ ...current, [field]: value })); setPage(1) }

  return (
    <section className="mx-auto max-w-[90rem]">
      <PageHeader eyebrow={`${role === 'admin' ? 'Admin' : 'Volunteer'} operations`} title="All blood donation requests" description={role === 'admin' ? 'Review and fully manage donation requests across the platform.' : 'Review requests and update status within volunteer permissions.'} />
      <div className="mt-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3"><SelectField label="Status" options={statusOptions} placeholder="All statuses" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} /><SelectField label="Blood group" options={bloodGroups} placeholder="All blood groups" value={filters.bloodGroup} onChange={(event) => updateFilter('bloodGroup', event.target.value)} /><SelectField label="Sort" options={sortOptions} value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} /></div>
      <p className="mt-4 text-right text-sm font-semibold text-slate-500">{pagination.total || 0} requests</p>
      <div className="mt-4">
        {loading && <DonationTableSkeleton rows={5} />}
        {error && <ErrorMessage title="Could not load managed requests" message={error.message} errors={error.errors} />}
        {!loading && !error && requests.length === 0 && <EmptyState title="No requests found" description="Try changing the selected filters." />}
        {!loading && !error && requests.length > 0 && <><ManagedDonationRequestsTable requests={requests} role={role} onAction={actions.requestAction} busy={actions.busy} /><div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div></>}
      </div>
      <ConfirmationModal isOpen={Boolean(actions.pendingAction)} onOpenChange={(open) => !open && actions.closeAction()} title={actions.pendingAction?.title} description={actions.pendingAction?.description} confirmLabel={actions.pendingAction?.confirmLabel} tone={actions.pendingAction?.tone} onConfirm={actions.confirmAction} isLoading={actions.busy} />
    </section>
  )
}
