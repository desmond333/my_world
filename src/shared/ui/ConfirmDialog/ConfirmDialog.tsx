import type { ReactNode } from 'react'
import { Modal } from '../Dialog/Dialog'
import { Button } from '../Button/Button'
import './ConfirmDialog.css'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) => (
  <Modal open={open} onClose={onCancel} title={title} description={description} maxWidth={420} showCloseButton={false}>
    <div className="confirm-dialog-actions">
      <Button variant="ghost" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
)
