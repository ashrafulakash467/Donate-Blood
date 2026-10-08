import { toast } from '@heroui/react'
import { CircleDollarSign, HeartHandshake, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { EmptyState } from '../../components/common/EmptyState'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { FundingModal } from '../../components/common/FundingModal'
import { PageHeader } from '../../components/common/PageHeader'
import { Pagination } from '../../components/common/Pagination'
import { createFundingCheckout, getCompletedFundings } from '../../services/publicWebsiteApi'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { consumeCheckoutStarted, redirectToStripeCheckout } from '../../utils/stripeCheckout'

const PAGE_SIZE = 10

export function FundingPage() {
  const location = useLocation()
  const [page, setPage] = useState(1)
  const [fundings, setFundings] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)
  const [checkoutWasStarted] = useState(consumeCheckoutStarted)
  const returnedFromCheckout = location.pathname === '/funding/success'
  const returnedWithoutSuccess = checkoutWasStarted && !returnedFromCheckout

  useEffect(() => {
    const controller = new AbortController()
    const loadFundings = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCompletedFundings({ page, limit: PAGE_SIZE }, controller.signal)
        setFundings(data?.items ?? [])
        setPagination(data?.pagination ?? { page, totalPages: 0, total: 0 })
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadFundings()
    return () => controller.abort()
  }, [page])

  const createCheckout = async (amount) => {
    setIsCheckoutLoading(true)
    try {
      const data = await createFundingCheckout(amount)
      redirectToStripeCheckout(data?.checkoutUrl)
    } catch (requestError) {
      setIsCheckoutLoading(false)
      toast.danger('Unable to open Stripe Checkout', { description: requestError.apiError?.message || requestError.message })
    }
  }

  return (
    <section className="page-shell py-12 sm:py-16">
      <PageHeader eyebrow="Community funding" title="Support the mission" description="Funding helps sustain the platform. Payment is processed by Stripe, and only webhook-confirmed payments appear below." actions={<AppButton onPress={() => setIsModalOpen(true)}><CircleDollarSign className="size-4" /> Fund now</AppButton>} />

      {returnedFromCheckout && <div className="mt-7 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950"><ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-600" /><div><p className="font-extrabold">Checkout completed or returned</p><p className="mt-1 text-sm leading-6">This page does not prove payment. Your contribution will appear only after Stripe’s signed webhook confirms it as paid.</p></div></div>}
      {returnedWithoutSuccess && <div className="mt-7 flex gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-slate-800"><CircleDollarSign className="mt-0.5 size-5 shrink-0 text-slate-500" /><div><p className="font-extrabold">Checkout was canceled or not completed</p><p className="mt-1 text-sm leading-6">No funding is recorded unless Stripe confirms a successful payment. You can safely try again.</p></div></div>}

      <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:px-7"><div><h2 className="text-lg font-extrabold text-slate-950">Confirmed contributions</h2><p className="mt-1 text-sm text-slate-500">Paid funding records supplied by the server</p></div><HeartHandshake className="size-7 text-red-600" /></div>

        {error && <div className="p-6"><ErrorMessage title="Could not load funding history" message={error.message} /></div>}
        {loading && <div className="flex items-center justify-center gap-3 p-12 text-sm font-bold text-slate-600"><LoaderCircle className="size-5 animate-spin text-red-600" /> Loading confirmed funding…</div>}
        {!loading && !error && fundings.length === 0 && <div className="p-6"><EmptyState title="No confirmed funding yet" description="Completed contributions will appear after Stripe webhook confirmation." /></div>}
        {!loading && !error && fundings.length > 0 && (
          <>
            <div className="hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-7 py-4">Contributor</th><th className="px-7 py-4">Amount</th><th className="px-7 py-4">Funding date</th></tr></thead><tbody className="divide-y divide-slate-100">{fundings.map((funding) => <tr key={funding._id} className="hover:bg-slate-50"><td className="px-7 py-4 font-bold text-slate-900">{funding.userName}</td><td className="px-7 py-4 font-extrabold text-red-600">{formatCurrency(funding.amount, funding.currency)}</td><td className="px-7 py-4 text-slate-600">{formatDate(funding.fundingDate)}</td></tr>)}</tbody></table></div>
            <div className="divide-y divide-slate-100 sm:hidden">{fundings.map((funding) => <article key={funding._id} className="p-5"><div className="flex items-start justify-between gap-4"><div><p className="font-extrabold text-slate-950">{funding.userName}</p><p className="mt-1 text-sm text-slate-500">{formatDate(funding.fundingDate)}</p></div><p className="font-black text-red-600">{formatCurrency(funding.amount, funding.currency)}</p></div></article>)}</div>
            <div className="border-t border-slate-200 p-5 sm:px-7"><Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} /></div>
          </>
        )}
      </div>
      <FundingModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onSubmit={createCheckout} isLoading={isCheckoutLoading} />
    </section>
  )
}
