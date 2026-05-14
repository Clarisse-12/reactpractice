import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import { register } from '../services/api'

export default function Signup() {
  const navigate = useNavigate()
  const signupTimerRef = useRef<number | null>(null)
  const [signupSuccess, setSignupSuccess] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    phone: '',
    role: 'guest',
    agreeToTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const target = e.target as HTMLInputElement
    setFormData((prev) => ({
      ...prev,
      [name]: target.type === 'checkbox' ? target.checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSignupSuccess('')
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match')
      return
    }

    const payload = {
      name: formData.fullName,
      email: formData.email,
      username: formData.username || formData.email.split('@')[0],
      phone: formData.phone || '',
      role: formData.role || 'guest',
      password: formData.password,
    }

    register(payload)
      .then(() => {
        setSignupSuccess('You have signed up successfully.')
        if (signupTimerRef.current) window.clearTimeout(signupTimerRef.current)
        signupTimerRef.current = window.setTimeout(() => {
          navigate('/login')
        }, 2000)
      })
      .catch((err) => {
        alert(err?.message || 'Signup failed')
      })
  }

  useEffect(() => {
    return () => {
      if (signupTimerRef.current) window.clearTimeout(signupTimerRef.current)
    }
  }, [])

  return (
    <section className="signup-page signup-page--center" aria-label="Sign up">
      <div className="signup-container signup-container--center">
        <div className="signup-left">
          <h1 className="signup-heading">
            Welcome back! Please <span className="signup-highlight">Sign up</span> to continue.
          </h1>

          <p className="signup-intro">
            Unlock a world of exclusive content, enjoy special offers, and be the first to dive into exciting
            news and updates by joining our community!
          </p>

          <div className="signup-social-buttons">
            <button className="signup-social-btn signup-apple" type="button">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.05 13.5c-.3-1.08.22-2.5 1.12-3.38 1.02-1.08 1.8-2.58 1.54-4.12-1.5.12-3.32.84-4.4 1.92-.52.48-1.02 1.2-1.32 2.02-.3-.82-.8-1.54-1.32-2.02C11.08 6.84 9.26 6.12 7.76 6c-.26 1.54.52 3.04 1.54 4.12.9.88 1.42 2.3 1.12 3.38C9.12 14.5 8 15.5 8 16.8c0 1.2 1.08 2.4 2.64 2.4 1.2 0 2.1-.6 2.76-.6.66 0 1.56.6 2.76.6 1.56 0 2.64-1.2 2.64-2.4 0-1.3-1.12-2.3-1.75-3.3zM12.04 6c.6 0 1.08-.9 1.08-2s-.48-2-1.08-2c-.6 0-1.08.9-1.08 2s.48 2 1.08 2z" />
              </svg>
              Sign up with Apple
            </button>

            <button className="signup-social-btn signup-google" type="button">
              <span className="signup-google-icon">G</span>
              Sign up with Google
            </button>
          </div>

          <p className="signup-privacy">
            We won't post anything without your permission and your personal details are kept private
          </p>

          <div className="signup-divider">Or</div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form-group">
              <label htmlFor="fullName">Full Name *</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="username">Username *</label>
              <input id="username" name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
            </div>

            <div className="signup-form-group">
              <label htmlFor="phone">Phone *</label>
              <input id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" required />
            </div>

            <div className="signup-form-group">
              <label htmlFor="role">Role *</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange}>
                <option value="guest">Guest</option>
                <option value="host">Host</option>
              </select>
            </div>

            <div className="signup-form-group">
              <label htmlFor="email">Enter Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="signup-form-group">
              <label htmlFor="password">Password *</label>
              <div className="signup-password-input">
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="signup-password-toggle" aria-label="Toggle password visibility">
                  👁️
                </button>
              </div>
            </div>

            <div className="signup-form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="signup-password-input">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="signup-password-toggle" aria-label="Toggle password visibility">
                  👁️
                </button>
              </div>
            </div>

            <div className="signup-terms">
              <input
                type="checkbox"
                id="terms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                required
              />
              <label htmlFor="terms">
                By signing up, you agree to the <a href="#terms">terms of service</a>
              </label>
            </div>

            <button type="submit" className="signup-submit-btn">
              Sign Up
            </button>

            {signupSuccess && <p className="signup-success">{signupSuccess}</p>}
          </form>

          <p className="signup-login-link">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
