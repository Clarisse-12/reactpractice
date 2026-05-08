import { useState } from 'react'
import { FiPhone, FiMail } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import './Signup.css'

export default function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Signup submitted:', formData)
    // You can add signup logic here
    navigate('/listings')
  }

  return (
    <section className="signup-page" aria-label="Sign up">
      <div className="signup-container">
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
          </form>

          <p className="signup-login-link">
            Already have an account? <a href="/login">Sign In</a>
          </p>
        </div>

        <div className="signup-right">
          <div className="signup-illustration">
            <div className="signup-illustration-placeholder">
              <svg viewBox="0 0 200 300" width="100%" height="100%">
                <circle cx="100" cy="80" r="40" fill="#2c3e50" />
                <ellipse cx="100" cy="140" rx="50" ry="60" fill="#2c3e50" />
                <rect x="50" y="160" width="30" height="80" rx="8" fill="#2c3e50" />
                <rect x="120" y="160" width="30" height="80" rx="8" fill="#2c3e50" />
              </svg>
            </div>
            <h3>Effortlessly organize your workspace with ease.</h3>
            <p>
              It is a long established fact that a reader will be distracted by the readable content of a
              page when looking at its layout.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer">
        {/* Download App Section */}
        <div className="site-footer__download">
          <div className="site-footer__download-content">
            <h2>Download Our App</h2>
            <p>It is a long established fact that a reader will be distracted by the readable content.</p>
            <div className="site-footer__download-buttons">
              <button className="site-footer__download-btn">Available on the App Store</button>
              <button className="site-footer__download-btn">Get it on Google Play</button>
            </div>
          </div>
        </div>

        <div className="site-footer__inner">
          <div className="site-footer__cols">
            <div className="site-footer__col">
              <h4>Get In Touch</h4>
              <p>Join our newsletter and receive the best job openings of the week, right on your inbox.</p>

              <div className="site-footer__whatsapp">
                <p>Join our Whatsapp:</p>
                <a href="tel:+11234567890">
                  <span className="site-footer__wh-icon">📞</span> <u>(123) 456-7890</u>
                </a>
              </div>

              <p style={{ marginTop: 16 }}>Want to join ListOn? Write us!</p>
              <p>support@ListOn.com</p>
            </div>

            <div className="site-footer__col">
              <h4>Stay Connect</h4>
              <p>1123 Fictional St, San Francisco, CA 94103</p>
              <p>
                <FiPhone /> (123) 456-7890
              </p>
              <p>
                <FiMail /> support@ListOn.com
              </p>
            </div>

            <div className="site-footer__col">
              <h4>Get In Touch</h4>
              <div className="site-footer__subscribe">
                <input placeholder="name@example.com" />
                <button className="site-footer__subscribe-btn">→</button>
              </div>

              <h5 style={{ marginTop: 24 }}>Follow the location</h5>
              <div className="site-footer__socials">
                <span className="social">IG</span>
                <span className="social">TW</span>
                <span className="social">DB</span>
                <span className="social">FB</span>
                <span className="social">WA</span>
              </div>
            </div>
          </div>

          <div className="site-footer__bottom">
            <div className="site-footer__brand">
              <span className="site-footer__logo">
                List<span style={{ color: '#ff5a3c' }}>On</span>.
              </span>
              <span>© 2022 ListOn - All Rights Reserved</span>
            </div>

            <div className="site-footer__links">
              <a>Privacy</a>
              <a>Sitemap</a>
              <a>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </section>
  )
}
