import { Modal } from '@heroui/react'
import { Droplet, LoaderCircle, Mail, UserRound } from 'lucide-react'
import { AppButton } from '../common/AppButton'

export function DonateConfirmationModal({ isOpen, onOpenChange, donor, onConfirm, isLoading }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center" size="md">
          <Modal.Dialog>
            <Modal.Header><Modal.Icon className="bg-red-50 text-red-600"><Droplet className="size-5 fill-current" /></Modal.Icon><Modal.Heading>Confirm blood donation</Modal.Heading></Modal.Header>
            <Modal.Body>
              <p className="text-sm leading-6 text-slate-600">Your verified profile will be assigned to this request. Confirm only if you are ready to coordinate with the requester.</p>
              <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
                <p className="flex items-center gap-3 text-sm"><UserRound className="size-4 text-red-600" /><span><span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Donor name</span><span className="font-bold text-slate-900">{donor?.name}</span></span></p>
                <p className="flex items-center gap-3 text-sm"><Mail className="size-4 text-red-600" /><span><span className="block text-xs font-bold uppercase tracking-wide text-slate-400">Donor email</span><span className="font-bold text-slate-900">{donor?.email}</span></span></p>
              </div>
            </Modal.Body>
            <Modal.Footer><AppButton tone="ghost" onPress={() => onOpenChange(false)} isDisabled={isLoading}>Cancel</AppButton><AppButton onPress={onConfirm} isDisabled={isLoading}>{isLoading ? <><LoaderCircle className="size-4 animate-spin" /> Confirming…</> : 'Confirm donation'}</AppButton></Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
