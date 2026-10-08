import { Modal } from '@heroui/react'
import { CircleDollarSign, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { AppButton } from './AppButton'
import { FormField } from '../forms/FormField'
import { fundingSchema } from '../../validators/fundingSchema'

export function FundingModal({ isOpen, onOpenChange, onSubmit, isLoading }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      setAmount('')
      setError('')
    }
    onOpenChange(nextOpen)
  }

  const submitAmount = () => {
    const result = fundingSchema.safeParse({ amount })
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Enter a valid amount.')
      return
    }
    onSubmit(result.data.amount)
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog>
            <Modal.Header><Modal.Icon className="bg-red-50 text-red-600"><CircleDollarSign className="size-5" /></Modal.Icon><Modal.Heading>Support LifeFlow</Modal.Heading></Modal.Header>
            <Modal.Body><p className="mb-4 text-sm leading-6 text-slate-600">Enter an amount in Bangladeshi taka. Stripe securely handles the payment.</p><FormField label="Funding amount (BDT)" type="number" min="100" max="1000000" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} error={error} placeholder="500" autoFocus /></Modal.Body>
            <Modal.Footer><AppButton tone="ghost" onPress={() => handleOpenChange(false)} isDisabled={isLoading}>Cancel</AppButton><AppButton onPress={submitAmount} isDisabled={isLoading}>{isLoading ? <><LoaderCircle className="size-4 animate-spin" /> Opening Stripe…</> : 'Continue to Stripe'}</AppButton></Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
