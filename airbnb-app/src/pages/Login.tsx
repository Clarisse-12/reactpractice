import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Signup.css'
import './Login.css'
import { login, auth } from '../services/api'
import { useStore } from '../store/StoreContext'

export default function Login() {
  const navigate = useNavigate()
  const { dispatch } = useStore()
  const [form, setForm] = useState({ email: '', password: '', remember: false })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login({ email: form.email, password: form.password })
      .then((res) => {
        if (res.token) auth.saveToken(res.token)
        if (res.user) {
          dispatch({ type: 'SET_USER', payload: res.user })
          const role = String(res.user.role || 'guest').toLowerCase()
          navigate(role === 'guest' ? '/listings' : '/dashboard/overview')
        } else {
          navigate('/listings')
        }
      })
      .catch((err) => alert(err?.message || 'Login failed'))
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
              <input id="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" required />
            </div>

            <div className="signup-form-group">
              <label htmlFor="password">Password *</label>
              <input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
            </div>

            <div className="signup-terms">
              <input id="remember" name="remember" type="checkbox" checked={form.remember} onChange={handleChange} />
              <label htmlFor="remember">Remember me next time</label>
            </div>

            <button type="submit" className="signup-submit-btn">Sign In</button>
          </form>

          <p className="signup-login-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
