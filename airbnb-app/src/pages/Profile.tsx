import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { updateUser, changePassword } from '../services/api'
import { FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi'
import './Profile.css'

export default function Profile() {
  const { state, dispatch } = useStore()
  const navigate = useNavigate()
  const user = state.user || {}

  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    username: user.username || '',
    phone: user.phone || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  })

  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    setForm({
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
      phone: user.phone || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    })
  }, [user.name, user.email, user.username, user.phone, user.bio, user.avatar])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.id) return
    updateUser(user.id, form)
      .then((updated) => {
        dispatch({ type: 'SET_USER', payload: updated })
        alert('Profile updated')
      })
      .catch((err) => alert(err?.message || 'Failed to update'))
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')
    setPwSuccess('')

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }

    setPwLoading(true)
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwSuccess('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        setShowPasswordForm(false)
        setPwSuccess('')
      }, 2000)
    } catch (err: any) {
      setPwError(err?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const closePasswordForm = () => {
    setShowPasswordForm(false)
    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPwError('')
    setPwSuccess('')
  }

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const initials = useMemo(() => {
    const source = String(user.name || user.username || 'U').trim()
    return source.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U'
  }, [user.name, user.username])

  return (
    <section className="profile-page" aria-label="Profile">
      <div className="profile-layout">
        {/* Sidebar */}
        <aside className="profile-card profile-card--summary">
          <div className="profile-avatar" aria-hidden="true">
            {form.avatar ? <img src={form.avatar} alt="Profile avatar" /> : <span>{initials}</span>}
          </div>

          <div className="profile-summary__content">
            <p className="profile-kicker">Account settings</p>
            <h1 className="profile-title">Edit your profile</h1>
            <p className="profile-text">
              Update your contact details, avatar, and bio.
            </p>
          </div>

          <div className="profile-summary__meta">
            <div>
              <span className="profile-meta__label">Role</span>
              <strong>{String(user.role || 'guest').toUpperCase()}</strong>
            </div>
            <div>
              <span className="profile-meta__label">Saved listings</span>
              <strong>{state.saved.length}</strong>
            </div>
          </div>

          <button
            type="button"
            className="profile-change-password-btn"
            onClick={() => setShowPasswordForm(true)}
          >
            <FiLock /> Change Password
          </button>

          <button type="button" className="profile-logout" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        {/* Main form */}
        <div className="profile-card profile-card--form">
          <div className="profile-card__head">
            <div>
              <p className="profile-kicker">Profile editor</p>
              <h2 className="profile-section-title">Personal details</h2>
            </div>
            <span className="profile-badge">Editable</span>
          </div>

          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-grid">
              <div className="profile-field">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
              </div>
              <div className="profile-field">
                <label htmlFor="username">Username</label>
                <input id="username" name="username" value={form.username} onChange={handleChange} />
              </div>
              <div className="profile-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="profile-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="profile-field profile-field--full">
                <label htmlFor="avatar">Avatar URL</label>
                <input id="avatar" name="avatar" value={form.avatar} onChange={handleChange} placeholder="Paste an image URL" />
              </div>
              <div className="profile-field profile-field--full">
                <label htmlFor="bio">Bio</label>
                <textarea id="bio" name="bio" value={form.bio} onChange={handleChange} placeholder="Tell people a little about yourself" />
              </div>
            </div>

            <div className="profile-actions">
              <button className="profile-save" type="submit">Save Changes</button>
              <button type="button" className="profile-secondary" onClick={() => navigate(-1)}>
                Go Back
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordForm && (
        <div className="pw-overlay" onClick={closePasswordForm}>
          <div className="pw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pw-modal__header">
              <div className="pw-modal__title">
                <FiLock />
                <h2>Change Password</h2>
              </div>
              <button type="button" className="pw-modal__close" onClick={closePasswordForm}>
                <FiX />
              </button>
            </div>

            <form className="pw-modal__form" onSubmit={handlePasswordSubmit}>
              <div className="pw-field">
                <label>Current Password</label>
                <div className="pw-input-wrap">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowCurrent((v) => !v)}>
                    {showCurrent ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="pw-field">
                <label>New Password</label>
                <div className="pw-input-wrap">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 8 characters"
                    required
                  />
                  <button type="button" className="pw-toggle" onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              <div className="pw-field">
                <label>Confirm New Password</label>
                <div className="pw-input-wrap">
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
              </div>

              {pwError && <p className="pw-error">{pwError}</p>}
              {pwSuccess && <p className="pw-success">{pwSuccess}</p>}

              <div className="pw-modal__actions">
                <button type="button" className="pw-btn pw-btn--cancel" onClick={closePasswordForm}>
                  Cancel
                </button>
                <button type="submit" className="pw-btn pw-btn--save" disabled={pwLoading}>
                  {pwLoading ? 'Saving...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
