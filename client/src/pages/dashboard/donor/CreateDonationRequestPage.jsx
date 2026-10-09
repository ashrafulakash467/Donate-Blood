import { toast } from '@heroui/react'
import { Ban } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../../../components/common/PageHeader'
import { DonationRequestForm } from '../../../components/forms/DonationRequestForm'
import { useAuth } from '../../../hooks/useAuth'
import { createDonationRequest } from '../../../services/donorDonationApi'

export function CreateDonationRequestPage() {
  const { profile, status } = useAuth()
  const navigate = useNavigate()

  const createRequest = async (payload) => {
    if (status !== 'active') throw new Error('Your account is blocked and cannot create donation requests.')
    await createDonationRequest(payload)
    toast.success('Donation request created', { description: 'The request is now pending and visible in the public request list.' })
    navigate('/dashboard/my-donation-requests', { replace: true })
  }

  return (
    <section className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Request blood" title="Create donation request" description="Provide accurate recipient details. Your verified name and email are added securely by the backend." />
      {status === 'blocked' ? <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-7 text-red-950"><Ban className="size-8 text-red-600" /><h2 className="mt-4 text-xl font-black">Your account is blocked</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">Blocked accounts cannot create donation requests. Contact an administrator if you believe this restriction is incorrect.</p></div> : <div className="mt-8"><DonationRequestForm profile={profile} submitLabel="Create donation request" onSubmit={createRequest} /></div>}
    </section>
  )
}
