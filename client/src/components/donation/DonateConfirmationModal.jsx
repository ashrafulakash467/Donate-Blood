import { Modal } from '@heroui/react'
import { Droplet, LoaderCircle, Mail, UserRound } from 'lucide-react'
import { AppButton } from '../common/AppButton'

export function DonateConfirmationModal({ isOpen, onOpenChange, donor, onConfirm, isLoading }) {
  const handleOpenChange = (open) => {
    if (!isLoading) onOpenChange(open)
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center" size="md">
          <Modal.Dialog>
            <Modal.Header className="flex flex-col items-center text-center">
              <Modal.Icon className="bg-red-50 text-red-600"><Droplet className="size-5 fill-current" /></Modal.Icon>
              <Modal.Heading className="mt-3 text-2xl font-black text-slate-950">Confirm Donation</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="px-6 sm:px-8">
              <p className="text-center text-sm leading-6 text-slate-600">Please confirm that you are available and willing to donate for this patient.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-400"><UserRound className="size-4 text-red-600" /> Donor Name</p>
                  <p className="mt-2 font-bold text-slate-900">{donor?.name || 'Not available'}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.14em] text-slate-400"><Mail className="size-4 text-red-600" /> Donor Email</p>
                  <p className="mt-2 break-all font-bold text-slate-900">{donor?.email || 'Not available'}</p>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer className="flex-col-reverse gap-2 px-6 pb-6 sm:flex-col-reverse sm:px-8">
              <AppButton tone="ghost" className="w-full" onPress={() => onOpenChange(false)} isDisabled={isLoading}>Cancel</AppButton>
              <AppButton className="min-h-12 w-full" onPress={onConfirm} isDisabled={isLoading}>
                {isLoading ? <><LoaderCircle className="size-4 animate-spin" /> Confirming…</> : 'Confirm & Start'}
              </AppButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
