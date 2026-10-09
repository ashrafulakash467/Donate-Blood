import { useCallback, useEffect, useState } from 'react'
import { Droplets } from 'lucide-react'
import { DonationCardSkeleton } from '../../components/donation/DonationCardSkeleton'
import { DonationRequestCard } from '../../components/donation/DonationRequestCard'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { PageHeader } from '../../components/common/PageHeader'
import { Pagination } from '../../components/common/Pagination'
import { getPendingDonations } from '../../services/publicWebsiteApi'
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus'

const PAGE_SIZE = 9

export function DonationRequestsPage() {
  const [page, setPage] = useState(1)
  const [donations, setDonations] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDonations = useCallback(async (signal, showLoading = true) => {
      if (showLoading) setLoading(true)
      setError(null)
      try {
        const data = await getPendingDonations({ page, limit: PAGE_SIZE }, signal)
        setDonations(data?.items ?? [])
        setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
      } finally {
        if (!signal?.aborted) setLoading(false)
      }
  }, [page])
  const refreshDonations = useCallback(() => loadDonations(undefined, false), [loadDonations])

  useEffect(() => {
    const controller = new AbortController()

    const initialLoadTimer = window.setTimeout(() => void loadDonations(controller.signal), 0)
    return () => {
      window.clearTimeout(initialLoadTimer)
      controller.abort()
    }
  }, [loadDonations])

  useRefreshOnFocus(refreshDonations)

  useEffect(() => {
    window.addEventListener('lifeflow:donations-changed', refreshDonations)
    return () => window.removeEventListener('lifeflow:donations-changed', refreshDonations)
  }, [refreshDonations])

  return (
    <section className="page-shell py-12 sm:py-16">
      <PageHeader eyebrow="Open requests" title="Pending blood donation requests" description="Every request shown here is currently pending. Sign in to review full details and confirm an eligible donation." />

      <div className="mt-8 flex items-center justify-between rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
        <span className="flex items-center gap-2 font-semibold"><Droplets className="size-5 text-red-600" /> Community requests needing attention</span>
        {!loading && !error && <span className="font-bold">{pagination.total} pending</span>}
      </div>

      {error && <div className="mt-8"><ErrorMessage title="Could not load donation requests" message={error.message} /></div>}
      {loading && <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <DonationCardSkeleton key={index} />)}</div>}
      {!loading && !error && donations.length === 0 && <div className="mt-8"><EmptyState title="No pending requests" description="There are no pending blood donation requests right now. Please check again later." /></div>}
      {!loading && !error && donations.length > 0 && (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{donations.map((donation) => <DonationRequestCard key={donation._id} donation={donation} />)}</div>
          <div className="mt-9"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
        </>
      )}
    </section>
  )
}
