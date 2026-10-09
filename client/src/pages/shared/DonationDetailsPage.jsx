import { toast } from '@heroui/react'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Droplet,
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

  const loadDonation = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setDonation(await getDonationDetails(id))
    } catch (requestError) {
      setError(requestError.apiError || { message: requestError.message })
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const timer = window.setTimeout(loadDonation, 0)
    return () => window.clearTimeout(timer)
  }, [loadDonation])

  const canDonate = useMemo(() => Boolean(
    donation &&
    donation.donationStatus === 'pending' &&
    role === 'donor' &&
    status === 'active' &&
    profile?.authUserId !== donation.requesterUserId &&
    profile?.bloodGroup === donation.bloodGroup
  ), [donation, profile, role, status])

  const confirmDonation = async () => {
    if (isConfirming) return
    setIsConfirming(true)
    try {
      await confirmDonationRequest(id)
      setIsModalOpen(false)
      toast.success('Donation is now in progress', { description: 'Your verified donor details have been assigned.' })
      await loadDonation()
    } catch (requestError) {
      toast.danger('Unable to confirm donation', { description: requestError.apiError?.message || requestError.message })
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

              <div className="grid gap-9 p-6 sm:p-9 lg:grid-cols-2 lg:gap-12">
                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Location details</h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                    <InformationItem icon={Building2} label="Hospital">{donation.hospitalName}</InformationItem>
                    <InformationItem icon={MapPin} label="District / Upazila">{donation.recipientDistrict} · {donation.recipientUpazila}</InformationItem>
                    <InformationItem icon={MapPin} label="Full address">{donation.fullAddress}</InformationItem>
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">Timing & request</h3>
                  <div className="mt-6 grid gap-6 sm:grid-cols-2">
                    <InformationItem icon={CalendarDays} label="Required date">{formatDate(donation.donationDate)}</InformationItem>
                    <InformationItem icon={Clock3} label="Time">{formatTime(donation.donationTime)}</InformationItem>
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:col-span-2">
                      <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-amber-700"><MessageSquareText className="size-4" /> Request message</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm italic leading-6 text-slate-700">“{donation.requestMessage}”</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 p-6 sm:p-9 lg:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-black text-slate-950">Requester contact</h3>
                  <div className="mt-4 space-y-3">
                    <p className="flex items-center gap-3 text-sm text-slate-700"><UserRound className="size-4 shrink-0 text-red-600" /> {donation.requesterName}</p>
                    <p className="flex items-center gap-3 break-all text-sm text-slate-700"><Mail className="size-4 shrink-0 text-red-600" /> {donation.requesterEmail}</p>
                    <p className="flex items-center gap-3 text-sm text-slate-700"><Phone className="size-4 shrink-0 text-red-600" /> {donation.requesterPhone || 'Not provided'}</p>
                  </div>
                </section>

                {donation.donationStatus === 'inprogress' && donation.donorName && (
                  <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="flex items-center gap-2 font-black text-emerald-950"><CheckCircle2 className="size-5" /> Assigned donor</h3>
                    <div className="mt-4 space-y-3">
                      <p className="flex items-center gap-3 text-sm text-emerald-900"><UserRound className="size-4 shrink-0" /> {donation.donorName}</p>
                      <p className="flex items-center gap-3 break-all text-sm text-emerald-900"><Mail className="size-4 shrink-0" /> {donation.donorEmail}</p>
                    </div>
                  </section>
                )}

                {canDonate && (
                  <section className="flex flex-col justify-between rounded-2xl border border-red-200 bg-red-50 p-5">
                    <div><h3 className="flex items-center gap-2 font-black text-red-950"><Droplet className="size-5 fill-red-600 text-red-600" /> You are eligible to donate</h3><p className="mt-2 text-sm leading-6 text-red-800">Your active donor profile matches the required blood group.</p></div>
                    <AppButton className="mt-5 min-h-12 w-full text-base" onPress={() => setIsModalOpen(true)}><Droplet className="size-5 fill-current" /> Donate Now</AppButton>
                  </section>
                )}
              </div>
            </article>

            <DonateConfirmationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} donor={profile} onConfirm={confirmDonation} isLoading={isConfirming} />
          </>
        )}
      </div>
    </section>
  )
}
