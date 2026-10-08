import { Modal } from '@heroui/react'
import { TriangleAlert } from 'lucide-react'
import { AppButton } from './AppButton'

export function ConfirmationModal({ isOpen, onOpenChange, title = 'Confirm action', description, confirmLabel = 'Confirm', onConfirm, isLoading = false, tone = 'danger' }) {
  const handleConfirm = async () => {
    await onConfirm?.()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="center" size="sm">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Icon className="bg-red-50 text-red-600"><TriangleAlert className="size-5" /></Modal.Icon>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body><p className="text-sm leading-6 text-slate-600">{description}</p></Modal.Body>
            <Modal.Footer>
              <AppButton tone="ghost" onPress={() => onOpenChange(false)} isDisabled={isLoading}>Cancel</AppButton>
              <AppButton tone={tone} onPress={handleConfirm} isDisabled={isLoading}>{isLoading ? 'Working…' : confirmLabel}</AppButton>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  )
}
