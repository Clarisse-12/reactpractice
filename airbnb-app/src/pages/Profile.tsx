import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { updateUser } from '../services/api'
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    dispatch({ type: 'LOGOUT' })
    navigate('/')
  }

  const initials = useMemo(() => {
    const source = String(user.name || user.username || 'U').trim()
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U'
  }, [user.name, user.username])

  return (
    <section className="profile-page" aria-label="Profile">
      <div className="profile-layout">
        <aside className="profile-card profile-card--summary">
          <div className="profile-avatar" aria-hidden="true">
            {form.avatar ? <img src={form.avatar} alt="Profile avatar" /> : <span>{initials}</span>}
          </div>

          <div className="profile-summary__content">
            <p className="profile-kicker">Account settings</p>
            <h1 className="profile-title">Edit your profile</h1>
            <p className="profile-text">
              Update your contact details, avatar, and bio. Changes are saved to your account when you press Save Changes.
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

          <button type="button" className="profile-logout" onClick={handleLogout}>
            Logout
          </button>
        </aside>

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
              <button className="profile-save" type="submit">
                Save Changes
              </button>
              <button type="button" className="profile-secondary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
