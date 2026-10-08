import { toast } from '@heroui/react'
import { ArrowLeft, CalendarDays, Clock3, Droplet, Hospital, Mail, MapPin, MessageSquareText, UserRound } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AppButton } from '../../components/common/AppButton'
import { ErrorMessage } from '../../components/common/ErrorMessage'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { StatusBadge } from '../../components/common/StatusBadge'
import { DonateConfirmationModal } from '../../components/donation/DonateConfirmationModal'
import { useAuth } from '../../hooks/useAuth'
import { confirmDonationRequest, getDonationDetails } from '../../services/publicWebsiteApi'
import { formatDate, formatTime } from '../../utils/formatters'

function DetailItem({ icon: Icon, label, children, wide = false }) {
  return <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${wide ? 'sm:col-span-2' : ''}`}><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-400"><Icon className="size-4 text-red-500" /> {label}</p><div className="mt-2 font-semibold leading-6 text-slate-900">{children}</div></div>
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
    setIsConfirming(true)
    try {
      await confirmDonationRequest(id)
      setIsModalOpen(false)
      toast.success('Donation confirmed', { description: 'The request is now in progress.' })
      await loadDonation()
    } catch (requestError) {
      toast.danger('Unable to confirm donation', { description: requestError.apiError?.message || requestError.message })
    } finally {
      setIsConfirming(false)
    }
  }

  if (loading) return <LoadingSpinner fullPage label="Loading donation request…" />

  return (
    <section className="page-shell py-12 sm:py-16">
      <Link to="/donation-requests" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-red-700"><ArrowLeft className="size-4" /> Back to requests</Link>
      {error && <div className="mt-8"><ErrorMessage title="Could not load this request" message={error.message} /></div>}
      {!error && donation && (
        <>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-5 bg-slate-950 p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-9">
              <div><p className="text-xs font-extrabold uppercase tracking-[0.2em] text-red-400">Donation request</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Blood needed for {donation.recipientName}</h1><div className="mt-4"><StatusBadge status={donation.donationStatus} /></div></div>
              <div className="grid size-24 shrink-0 place-items-center rounded-3xl bg-red-600 text-3xl font-black shadow-xl shadow-red-950/30">{donation.bloodGroup}</div>
            </div>

            <div className="grid gap-7 p-6 lg:grid-cols-[1.2fr_0.8fr] sm:p-9">
              <div>
                <h2 className="text-lg font-extrabold text-slate-950">Patient and appointment</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={UserRound} label="Recipient">{donation.recipientName}</DetailItem>
                  <DetailItem icon={Hospital} label="Hospital">{donation.hospitalName}</DetailItem>
                  <DetailItem icon={MapPin} label="Location">{donation.recipientUpazila}, {donation.recipientDistrict}</DetailItem>
                  <DetailItem icon={CalendarDays} label="Donation date">{formatDate(donation.donationDate)}</DetailItem>
                  <DetailItem icon={Clock3} label="Donation time">{formatTime(donation.donationTime)}</DetailItem>
                  <DetailItem icon={MapPin} label="Full address" wide>{donation.fullAddress}</DetailItem>
                  <DetailItem icon={MessageSquareText} label="Request message" wide>{donation.requestMessage}</DetailItem>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-slate-200 p-5"><h2 className="font-extrabold text-slate-950">Requester information</h2><p className="mt-4 flex items-center gap-3 text-sm text-slate-700"><UserRound className="size-4 text-red-600" /> {donation.requesterName}</p><p className="mt-3 flex items-center gap-3 break-all text-sm text-slate-700"><Mail className="size-4 shrink-0 text-red-600" /> {donation.requesterEmail}</p></div>
                {donation.donorName && <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5"><h2 className="font-extrabold text-emerald-950">Confirmed donor</h2><p className="mt-4 flex items-center gap-3 text-sm text-emerald-900"><UserRound className="size-4" /> {donation.donorName}</p><p className="mt-3 flex items-center gap-3 break-all text-sm text-emerald-900"><Mail className="size-4 shrink-0" /> {donation.donorEmail}</p></div>}
                {canDonate && <div className="rounded-3xl border border-red-200 bg-red-50 p-5"><Droplet className="size-7 fill-red-600 text-red-600" /><h2 className="mt-3 text-lg font-extrabold text-red-950">You are eligible to respond</h2><p className="mt-2 text-sm leading-6 text-red-800">Your active donor profile and blood group match this pending request.</p><AppButton className="mt-5 w-full" onPress={() => setIsModalOpen(true)}>Donate blood</AppButton></div>}
              </aside>
            </div>
          </div>
          <DonateConfirmationModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} donor={profile} onConfirm={confirmDonation} isLoading={isConfirming} />
        </>
      )}
    </section>
  )
}
