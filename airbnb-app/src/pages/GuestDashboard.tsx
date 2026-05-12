import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getBookings, updateBookingStatus } from '../services/api'
import { useStore } from '../store/StoreContext'
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiHome, FiAlertCircle } from 'react-icons/fi'
import './GuestDashboard.css'


interface Booking {
  id: string
  checkIn: string
  checkOut: string
  status: string
  totalPrice?: number
  createdAt?: string
  listing?: {
    id?: string
    title?: string
    location?: string
    pricePerNight?: number
    photos?: { url: string; optimizedUrl?: string }[]
  }
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Pending',   className: 'status--pending',   icon: <FiClock /> },
  CONFIRMED: { label: 'Confirmed', className: 'status--confirmed', icon: <FiCheckCircle /> },
  CANCELLED: { label: 'Cancelled', className: 'status--cancelled', icon: <FiXCircle /> },
}

function getStatus(status: string) {
  return STATUS_CONFIG[String(status).toUpperCase()] || STATUS_CONFIG.PENDING
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)))
}

export default function GuestDashboard() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    if (!state.user) {
      navigate('/login')
      return
    }
    setLoading(true)
    getBookings()
      .then((res: any) => {
        const all: Booking[] = Array.isArray(res) ? res : res?.data || []
        // only show this guest's bookings
        const mine = all.filter((b) => !b.listing || true) // backend already filters by auth user
        setBookings(mine)
      })
      .catch((err: any) => setError(err?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [state.user, navigate])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await updateBookingStatus(id, 'CANCELLED')
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b)))
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status.toUpperCase() === 'PENDING').length,
    confirmed: bookings.filter((b) => b.status.toUpperCase() === 'CONFIRMED').length,
    cancelled: bookings.filter((b) => b.status.toUpperCase() === 'CANCELLED').length,
  }

  return (
    <div className="guest-db">
      <main className="guest-db__main">
        {/* Hero */}
        <div className="guest-db__hero">
          <div>
            <p className="guest-db__hero-eyebrow">Guest Dashboard</p>
            <h1 className="guest-db__hero-title">My Bookings</h1>
            <p className="guest-db__hero-sub">
              Welcome back, <strong>{state.user?.name || 'Guest'}</strong>. Track and manage your reservations.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="guest-db__stats">
          <div className="guest-db__stat">
            <span className="guest-db__stat-value">{stats.total}</span>
            <span className="guest-db__stat-label">Total</span>
          </div>
          <div className="guest-db__stat guest-db__stat--pending">
            <span className="guest-db__stat-value">{stats.pending}</span>
            <span className="guest-db__stat-label">Pending</span>
          </div>
          <div className="guest-db__stat guest-db__stat--confirmed">
            <span className="guest-db__stat-value">{stats.confirmed}</span>
            <span className="guest-db__stat-label">Confirmed</span>
          </div>
          <div className="guest-db__stat guest-db__stat--cancelled">
            <span className="guest-db__stat-value">{stats.cancelled}</span>
            <span className="guest-db__stat-label">Cancelled</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="guest-db__loading">Loading your bookings...</div>
        ) : error ? (
          <div className="guest-db__error"><FiAlertCircle /> {error}</div>
        ) : bookings.length === 0 ? (
          <div className="guest-db__empty">
            <FiCalendar className="guest-db__empty-icon" />
            <h2>No bookings yet</h2>
            <p>Start exploring listings and make your first booking!</p>
            <Link to="/listings" className="guest-db__browse-btn">Browse Listings</Link>
          </div>
        ) : (
          <div className="guest-db__cards">
            {bookings.map((booking) => {
              const s = getStatus(booking.status)
              const photo = booking.listing?.photos?.[0]?.optimizedUrl || booking.listing?.photos?.[0]?.url
              const nights = booking.checkIn && booking.checkOut ? nightsBetween(booking.checkIn, booking.checkOut) : null
              const total = booking.totalPrice || (nights && booking.listing?.pricePerNight ? nights * booking.listing.pricePerNight : null)
              const isCancellable = booking.status.toUpperCase() === 'PENDING'

              return (
                <article key={booking.id} className="guest-db__card">
                  {/* Photo */}
                  <div className="guest-db__card-photo">
                    {photo ? (
                      <img src={photo} alt={booking.listing?.title || 'Listing'} />
                    ) : (
                      <div className="guest-db__card-photo-placeholder"><FiHome /></div>
                    )}
                    <span className={`guest-db__status-badge ${s.className}`}>
                      {s.icon} {s.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="guest-db__card-body">
                    <h3 className="guest-db__card-title">
                      {booking.listing?.id ? (
                        <Link to={`/listings/${booking.listing.id}`}>{booking.listing.title || 'Listing'}</Link>
                      ) : (
                        booking.listing?.title || 'Listing'
                      )}
                    </h3>

                    {booking.listing?.location && (
                      <p className="guest-db__card-location">
                        <FiMapPin /> {booking.listing.location}
                      </p>
                    )}

                    <div className="guest-db__card-dates">
                      <div className="guest-db__card-date">
                        <span>Check-in</span>
                        <strong>{formatDate(booking.checkIn)}</strong>
                      </div>
                      <div className="guest-db__card-date-sep">→</div>
                      <div className="guest-db__card-date">
                        <span>Check-out</span>
                        <strong>{formatDate(booking.checkOut)}</strong>
                      </div>
                    </div>

                    {nights && (
                      <p className="guest-db__card-nights">{nights} night{nights > 1 ? 's' : ''}</p>
                    )}

                    {total && (
                      <p className="guest-db__card-total">Total: <strong>${total.toFixed(2)}</strong></p>
                    )}

                    {/* Status message */}
                    <div className={`guest-db__status-msg ${s.className}`}>
                      {booking.status.toUpperCase() === 'PENDING' && (
                        <><FiClock /> Awaiting host confirmation</>
                      )}
                      {booking.status.toUpperCase() === 'CONFIRMED' && (
                        <><FiCheckCircle /> Your booking has been confirmed by the host</>
                      )}
                      {booking.status.toUpperCase() === 'CANCELLED' && (
                        <><FiXCircle /> This booking was cancelled</>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="guest-db__card-actions">
                    {booking.listing?.id && (
                      <Link to={`/listings/${booking.listing.id}`} className="guest-db__view-btn">
                        View Listing
                      </Link>
                    )}
                    {isCancellable && (
                      <button
                        className="guest-db__cancel-btn"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
