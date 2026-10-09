import { toast } from '@heroui/react'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorMessage } from '../../../components/common/ErrorMessage'
import { PageHeader } from '../../../components/common/PageHeader'
import { DonationRequestForm } from '../../../components/forms/DonationRequestForm'
import { useAuth } from '../../../hooks/useAuth'
import { getOwnedDonationRequest, updateDonationRequest } from '../../../services/donorDonationApi'

const editableFields = ['requesterPhone', 'recipientName', 'recipientDistrict', 'recipientUpazila', 'hospitalName', 'fullAddress', 'bloodGroup', 'donationDate', 'donationTime', 'requestMessage']

export function EditDonationRequestPage() {
  const { id } = useParams()
  const { profile, role } = useAuth()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()
    const loadRequest = async () => {
      setLoading(true)
      try {
        const data = await getOwnedDonationRequest(id, controller.signal)
        if (role !== 'admin' && data?.requesterUserId !== profile?.authUserId) throw new Error('You can only edit donation requests created by your account.')
        setRequest(data)
      } catch (requestError) {
        if (requestError.code !== 'ERR_CANCELED') setError(requestError.apiError || { message: requestError.message })
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadRequest()
    return () => controller.abort()
  }, [id, profile?.authUserId, role])

  const saveRequest = async (payload) => {
    const allowlistedPayload = Object.fromEntries(editableFields.map((field) => [field, payload[field]]))
    await updateDonationRequest(id, allowlistedPayload)
    toast.success('Donation request updated')
    navigate('/dashboard/my-donation-requests', { replace: true })
  }

  return (
    <section className="mx-auto max-w-5xl">
      <PageHeader eyebrow="Donor requests" title="Edit donation request" description="Only recipient and donation details can be changed. Requester identity and status remain protected." />
      {loading && <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm font-bold text-slate-600"><LoaderCircle className="size-5 animate-spin text-red-600" /> Loading request…</div>}
      {error && <div className="mt-8"><ErrorMessage title="Unable to edit this request" message={error.message} errors={error.errors} /></div>}
      {!loading && !error && request && <div className="mt-8"><DonationRequestForm key={request._id} profile={{ name: request.requesterName, email: request.requesterEmail }} initialValues={Object.fromEntries(editableFields.map((field) => [field, request[field] ?? '']))} submitLabel="Save changes" onSubmit={saveRequest} /></div>}
    </section>
  )
}
