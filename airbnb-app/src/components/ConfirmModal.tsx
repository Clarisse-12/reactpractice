import { FiAlertTriangle, FiX } from 'react-icons/fi'
import './ConfirmModal.css'

type ConfirmModalProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmTone?: 'danger' | 'primary'
  loading?: boolean
  reason?: string
  reasonLabel?: string
  reasonPlaceholder?: string
  reasonRequired?: boolean
  onReasonChange?: (value: string) => void
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'danger',
  loading = false,
  reason = '',
  reasonLabel,
  reasonPlaceholder = 'Add a reason',
  reasonRequired = false,
  onReasonChange,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="confirm-modal__overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="confirm-modal__header">
          <div className="confirm-modal__icon">
            <FiAlertTriangle />
          </div>
          <button type="button" className="confirm-modal__close" onClick={onCancel} aria-label="Close confirmation dialog">
            <FiX />
          </button>
        </div>

        <div className="confirm-modal__body">
          <h2>{title}</h2>
          <p>{message}</p>
          {onReasonChange ? (
            <label className="confirm-modal__reason">
              <span>{reasonLabel || 'Reason'}</span>
              <textarea
                value={reason}
                onChange={(e) => onReasonChange(e.target.value)}
                placeholder={reasonPlaceholder}
                required={reasonRequired}
                rows={4}
              />
            </label>
          ) : null}
        </div>

        <div className="confirm-modal__actions">
          <button type="button" className="confirm-modal__btn confirm-modal__btn--cancel" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal__btn confirm-modal__btn--${confirmTone}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}