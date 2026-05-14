import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import './Login.css'
import { login, auth, forgotPassword } from '../services/api'
import { useStore } from '../store/StoreContext'
import { FiX, FiMail } from 'react-icons/fi'

export default function Login() {
  const navigate = useNavigate()
  const { dispatch } = useStore()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')
  const loginTimerRef = useRef<number | null>(null)

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false)
  const [fpEmail, setFpEmail] = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpError, setFpError] = useState('')
  const [fpSuccess, setFpSuccess] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoginSuccess('')
    login({ email: form.email, password: form.password })
      .then((res) => {
        if (res.token) auth.saveToken(res.token)
        if (res.user) {
          dispatch({ type: 'SET_USER', payload: res.user })
          setLoginSuccess('You have signed in successfully.')
          const role = String(res.user.role || 'guest').toLowerCase()
          if (loginTimerRef.current) window.clearTimeout(loginTimerRef.current)
          loginTimerRef.current = window.setTimeout(() => {
            if (role === 'admin') {
              navigate('/admin/dashboard')
              return
            }

            navigate(role === 'guest' ? '/listings' : '/dashboard/overview')
          }, 2000)
        } else {
          setLoginSuccess('You have signed in successfully.')
          if (loginTimerRef.current) window.clearTimeout(loginTimerRef.current)
          loginTimerRef.current = window.setTimeout(() => navigate('/listings'), 2000)
        }
      })
      .catch((err) => setLoginError(err?.message || 'Login failed'))
  }

  useEffect(() => {
    return () => {
      if (loginTimerRef.current) window.clearTimeout(loginTimerRef.current)
    }
  }, [])

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFpError('')
    setFpSuccess('')
    setFpLoading(true)
    try {
      const res = await forgotPassword(fpEmail)
      setFpSuccess(res.message || 'Reset link sent! Check your email.')
      setFpEmail('')
    } catch (err: any) {
      setFpError(err?.message || 'Failed to send reset email')
    } finally {
      setFpLoading(false)
    }
  }

  const closeForgot = () => {
    setShowForgot(false)
    setFpEmail('')
    setFpError('')
    setFpSuccess('')
  }

  return (
    <section className="login-page" aria-label="Login">
      <div className="login-container">
        <div className="login-left">
          <h1 className="signup-heading">
            Welcome back! Please <span className="signup-highlight">Sign in</span> to continue.
          </h1>

          <p className="signup-intro">Sign in to access your saved listings and manage bookings.</p>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <label htmlFor="email">Enter Email *</label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="password">Password *</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-form-footer">
              <div className="signup-terms">
                <input id="remember" name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />
                <label htmlFor="remember">Remember me next time</label>
              </div>
              <button
                type="button"
                className="login-forgot-link"
                onClick={() => setShowForgot(true)}
              >
                Forgot password?
              </button>
            </div>

            {loginError && <p className="login-error">{loginError}</p>}
            {loginSuccess && <p className="login-success">{loginSuccess}</p>}

            <button type="submit" className="signup-submit-btn">Sign In</button>
          </form>

          <p className="signup-login-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fp-overlay" onClick={closeForgot}>
          <div className="fp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fp-modal__header">
              <div className="fp-modal__title">
                <FiMail />
                <h2>Reset Password</h2>
              </div>
              <button type="button" className="fp-modal__close" onClick={closeForgot}>
                <FiX />
              </button>
            </div>

            <div className="fp-modal__body">
              <p className="fp-modal__desc">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {fpSuccess ? (
                <div className="fp-success">
                  <FiMail />
                  <p>{fpSuccess}</p>
                  <button type="button" className="fp-btn fp-btn--close" onClick={closeForgot}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="fp-form">
                  <div className="fp-field">
                    <label htmlFor="fp-email">Email Address</label>
                    <input
                      id="fp-email"
                      type="email"
                      value={fpEmail}
                      onChange={(e) => setFpEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {fpError && <p className="fp-error">{fpError}</p>}

                  <div className="fp-actions">
                    <button type="button" className="fp-btn fp-btn--cancel" onClick={closeForgot}>
                      Cancel
                    </button>
                    <button type="submit" className="fp-btn fp-btn--send" disabled={fpLoading}>
                      {fpLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
