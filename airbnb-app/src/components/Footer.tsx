import React from 'react'
import { FiPhone, FiMail } from 'react-icons/fi'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
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
  )
}
