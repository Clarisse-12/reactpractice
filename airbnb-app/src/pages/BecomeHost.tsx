import { useState } from 'react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { submitHostRequest } from '../services/api'
import { useStore } from '../store/StoreContext'
import { useNavigate } from 'react-router-dom'
import '../components/BecomeHostModal.css'

export default function BecomeHost() {
  const { state } = useStore()
  const user = state.user
  const navigate = useNavigate()

  const [fullName, setFullName] = useState(user?.name || '')
  const [address, setAddress] = useState('')
  const [documentInfo, setDocumentInfo] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!fullName.trim()) { setError('Full name is required.'); return }
    if (!address.trim()) { setError('Home address is required.'); return }
    if (!documentInfo.trim()) { setError('Document information is required.'); return }

    setLoading(true)
    try {
      await submitHostRequest(user.id, { fullName: fullName.trim(), address: address.trim(), documentInfo: documentInfo.trim(), message: message.trim() || undefined })
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to submit your application. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
        <div className="bh-card" style={{ maxWidth: 640 }}>
          <div className="bh-header">
            <h2 className="bh-header__title">Application Sent</h2>
          </div>
          <div className="bh-success">
            <div className="bh-success__icon"><FiCheckCircle /></div>
            <h3 className="bh-success__title">Application Sent!</h3>
            <p className="bh-success__text">
              Your host application has been submitted. We'll review it shortly and notify you of our decision.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="bh-success__btn" onClick={() => navigate('/guest/bookings')}>Go to dashboard</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div className="bh-card" style={{ maxWidth: 720 }}>
        <div className="bh-header">
          <h2 className="bh-header__title">Apply to Become a Host</h2>
        </div>

        <form className="bh-form" onSubmit={handleSubmit} noValidate>
          <div className="bh-field">
            <label className="bh-field__label" htmlFor="bh-fullname">
              Full Name <span className="bh-field__required">*</span>
            </label>
            <input
              id="bh-fullname"
              type="text"
              className="bh-field__input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full legal name"
              autoComplete="name"
              required
            />
          </div>

          <div className="bh-field">
            <label className="bh-field__label" htmlFor="bh-address">
              Home Address <span className="bh-field__required">*</span>
            </label>
            <input
              id="bh-address"
              type="text"
              className="bh-field__input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, City, Country"
              autoComplete="street-address"
              required
            />
          </div>

          <div className="bh-field">
            <label className="bh-field__label" htmlFor="bh-doc">
              Document Information <span className="bh-field__required">*</span>
            </label>
            <textarea
              id="bh-doc"
              className="bh-field__textarea"
              value={documentInfo}
              onChange={(e) => setDocumentInfo(e.target.value)}
              placeholder="e.g. Property deed, lease agreement, or any document proving you own or manage the property"
              required
            />
            <p className="bh-field__hint">
              Describe the documents you have that verify your property ownership or management rights.
            </p>
          </div>

          <div className="bh-field">
            <label className="bh-field__label" htmlFor="bh-message">
              Message <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="bh-message"
              className="bh-field__textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly describe yourself and your properties..."
            />
          </div>

          {error && (
            <div className="bh-error" role="alert">
              <FiAlertCircle aria-hidden="true" />
              {error}
            </div>
          )}

          <div className="bh-actions">
            <button type="button" className="bh-actions__cancel" onClick={() => navigate(-1)} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="bh-actions__submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
