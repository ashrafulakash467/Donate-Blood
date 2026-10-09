import { toast } from '@heroui/react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  UserRound,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DonateConfirmationModal } from '../../components/donation/DonateConfirmationModal'
import { useAuth } from '../../hooks/useAuth'
import { useRefreshOnFocus } from '../../hooks/useRefreshOnFocus'
import { confirmDonationRequest, getDonationDetails } from '../../services/publicWebsiteApi'
import { formatDate, formatTime } from '../../utils/formatters'

function InformationItem({ icon: Icon, label, children, wide = false }) {
  return (
    <div className={`flex gap-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-50 text-red-600">
        <Icon className="size-[1.1rem]" aria-hidden="true" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p>
        <div className="mt-1 break-words text-sm font-bold leading-6 text-slate-900">{children}</div>
      </div>
    </div>
  )
}

function confirmationErrorTitle(status) {
  if (status === 401) return 'Please sign in again'
  if (status === 403) return 'You are not eligible to donate'
  if (status === 409) return 'Request is no longer available'
  return 'Unable to confirm donation'
}

function DetailsSkeleton() {
  return (
    <section className="page-shell py-12 sm:py-16" aria-label="Loading donation request">
      <div className="mx-auto max-w-4xl animate-pulse">
        <div className="mx-auto h-10 w-64 rounded-xl bg-slate-200" />
        <div className="mx-auto mt-3 h-4 w-72 rounded bg-slate-200" />
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-9">
          <div className="flex justify-between"><div className="h-20 w-1/2 rounded-2xl bg-slate-100" /><div className="size-20 rounded-2xl bg-red-100" /></div>
          <div className="mt-9 grid gap-8 lg:grid-cols-2"><div className="h-64 rounded-2xl bg-slate-100" /><div className="h-64 rounded-2xl bg-slate-100" /></div>
        </div>
      </div>
    </section>
  )
}

export function DonationDetailsPage() {
  const { id } = useParams()
  const { profile, role, status } = useAuth()
  const [donation, setDonation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const loadDonation = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true)
    setError(null)
    try {
      setDonation(await getDonationDetails(id))
    } catch (requestError) {
      setError(requestError.apiError || { message: requestError.message })
    } finally {
      setLoading(false)
    }
  }, [id])
  const refreshDonation = useCallback(() => loadDonation(false), [loadDonation])

  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = window.setTimeout(loadDonation, 0)
    return () => window.clearTimeout(timer)
  }, [loadDonation])

  useRefreshOnFocus(refreshDonation)

  const canDonate = useMemo(() => Boolean(
    donation &&
    donation.donationStatus === 'pending' &&
    role === 'donor' &&
    status === 'active' &&
    profile?.authUserId !== donation.requesterUserId
  ), [donation, profile, role, status])

  const donationUnavailableReason = useMemo(() => {
    if (!donation || donation.donationStatus !== 'pending') return null
    if (role !== 'donor') return 'Only donor accounts can confirm a blood donation.'
    if (status !== 'active') return 'Your account must be active before you can donate.'
    if (profile?.authUserId === donation.requesterUserId) return 'You cannot donate to a request created by your own account.'
    return null
  }, [donation, profile, role, status])

  const confirmDonation = async () => {
    if (isConfirming) return
    setIsConfirming(true)
    try {
      await confirmDonationRequest(id)
      setIsModalOpen(false)
      toast.success('Donation is now in progress', { description: 'Your verified donor details have been assigned.' })
      window.dispatchEvent(new Event('lifeflow:donations-changed'))
      await loadDonation(false)
    } catch (requestError) {
      const apiError = requestError.apiError
      toast.danger(confirmationErrorTitle(apiError?.status), { description: apiError?.message || requestError.message })
    } finally {
      setIsConfirming(false)
    }
  }

  if (loading) return <DetailsSkeleton />

  const errorTitle = error?.status === 404
    ? 'Donation request not found'
    : error?.status === 400
      ? 'Invalid donation request'
      : 'Could not load this request'

  return (
    <section className="page-shell py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <Link to="/donation-requests" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-red-700">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to requests
        </Link>

        {error && (
          <div className="mx-auto mt-8 max-w-2xl">
            <ErrorMessage title={errorTitle} message={error.message} errors={error.errors} />
            <div className="mt-4 flex justify-center"><AppButton tone="outline" onPress={loadDonation}>Try again</AppButton></div>
          </div>
        )}

        {!error && donation && (
          <>
            <header className="mt-5 text-center">
              <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Request <span className="text-red-600">Details</span>
              </h1>
              <p className="mt-3 text-sm text-slate-500 sm:text-base">View urgency, location, and donation requirements.</p>
              <div className="mt-4 flex justify-center"><StatusBadge status={donation.donationStatus} /></div>
            </header>

            <article className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
              <div className="flex flex-col gap-5 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
                <div className="flex items-center gap-4">
                  <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600 shadow-sm ring-1 ring-red-100 sm:size-20">
                    <UserRound className="size-8 sm:size-9" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{donation.recipientName}</h2>
                    <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Recipient · Patient</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 sm:px-5">
                  <span className="grid size-12 place-items-center rounded-xl bg-red-600 text-lg font-black text-white shadow-lg shadow-red-600/20">{donation.bloodGroup}</span>
                  <div><p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-red-500">Required</p><p className="mt-0.5 text-sm font-black text-slate-950">Blood Group</p></div>
                </div>
              </div>

              <div className="grid items-start gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_0.85fr_1.25fr] lg:gap-10">
                <section className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Location details</h3>
                  <div className="mt-6 grid gap-6">
                    <InformationItem icon={Building2} label="Hospital">{donation.hospitalName}</InformationItem>
                    <InformationItem icon={MapPin} label="District / Upazila">{donation.recipientDistrict} · {donation.recipientUpazila}</InformationItem>
                    <InformationItem icon={MapPin} label="Full address">{donation.fullAddress}</InformationItem>
                  </div>
                </section>


                <section className="flex min-w-0 flex-col">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    Requester Contact
                  </h3>

                  <div className="mt-6 flex flex-col gap-4">
                    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3 text-sm text-slate-700">
                      <UserRound className="size-4 text-red-600" />
                      <span>{donation.requesterName}</span>
                    </div>

                    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3 text-sm text-slate-700">
                      <Mail className="size-4 text-red-600" />
                      <span className="break-all">{donation.requesterEmail}</span>
                    </div>

                    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-center gap-3 text-sm text-slate-700">
                      <Phone className="size-4 text-red-600" />
                      <span>{donation.requesterPhone || 'Not provided'}</span>
                    </div>
                  </div>
                </section>


                <section className="min-w-0">
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Timing & request</h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <InformationItem icon={CalendarDays} label="Required date">{formatDate(donation.donationDate)}</InformationItem>
                    <InformationItem icon={Clock3} label="Time">{formatTime(donation.donationTime)}</InformationItem>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:col-span-2">
                      <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-amber-700"><MessageSquareText className="size-4" /> Request message</p>
                      <p className="mt-3 whitespace-pre-wrap break-words text-sm italic leading-6 text-slate-700">“{donation.requestMessage}”</p>
                    </div>
                  </div>
                </section>
              </div>

              {(donation.donationStatus === 'inprogress' && donation.donorName) && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-6 sm:p-9">
                  <section className="min-w-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:px-6">
                    <h3 className="flex items-center gap-2 font-black text-emerald-950"><CheckCircle2 className="size-5" /> Assigned donor</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <p className="flex items-center gap-3 text-sm text-emerald-900"><UserRound className="size-4 shrink-0" /> {donation.donorName}</p>
                      <p className="flex items-center gap-3 break-all text-sm text-emerald-900"><Mail className="size-4 shrink-0" /> {donation.donorEmail}</p>
                    </div>
                  </section>
                </div>
              )}

              {donation.donationStatus === 'pending' && (
                <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/60 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-9">
                    <p className={`text-sm leading-6 ${canDonate ? 'font-semibold text-emerald-700' : 'text-slate-600'}`}>
                      {canDonate ? 'Confirm this request.' : donationUnavailableReason}
                    </p>
                    <AppButton
                      className="min-h-12 w-full shrink-0 px-8 text-base sm:w-auto"
                      onPress={() => setIsModalOpen(true)}
                      isDisabled={!canDonate || isConfirming}
                      title={donationUnavailableReason || 'Confirm this donation request'}
                    >
                      <Heart className="size-5 fill-current" aria-hidden="true" /> Donate Now
                    </AppButton>
                </div>
              )}
            </article>

            <DonateConfirmationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} donor={profile} onConfirm={confirmDonation} isLoading={isConfirming} />
          </>
        )}
      </div>
    </section>
  )
}
