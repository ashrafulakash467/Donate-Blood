import { toast } from '@heroui/react'
import { useState } from 'react'
import { deleteDonationRequest, updateDonationStatus } from '../services/donorDonationApi'

const actionCopy = {
  delete: { title: 'Delete donation request?', description: 'This permanently removes the request. This action cannot be undone.', confirmLabel: 'Delete request', tone: 'danger' },
  done: { title: 'Mark donation as done?', description: 'Confirm that this in-progress donation has been completed.', confirmLabel: 'Mark done', tone: 'primary' },
  canceled: { title: 'Cancel donation request?', description: 'This changes the in-progress request to canceled.', confirmLabel: 'Cancel request', tone: 'danger' },
}

export function useDonationRequestActions(onSuccess) {
  const [pendingAction, setPendingAction] = useState(null)
  const [busy, setBusy] = useState(false)

  const requestAction = (type, request) => setPendingAction({ type, request, ...actionCopy[type] })
  const closeAction = () => {
    if (!busy) setPendingAction(null)
  }
  const confirmAction = async () => {
    if (!pendingAction) return
    setBusy(true)
    try {
      if (pendingAction.type === 'delete') {
        await deleteDonationRequest(pendingAction.request._id)
        toast.success('Donation request deleted')
      } else {
        await updateDonationStatus(pendingAction.request._id, pendingAction.type)
        toast.success(pendingAction.type === 'done' ? 'Donation marked as done' : 'Donation request canceled')
      }
      setPendingAction(null)
      await onSuccess?.()
    } catch (error) {
      toast.danger('Action failed', { description: error.apiError?.message || error.message })
    } finally {
      setBusy(false)
    }
  }

  return { pendingAction, busy, requestAction, closeAction, confirmAction }
}
