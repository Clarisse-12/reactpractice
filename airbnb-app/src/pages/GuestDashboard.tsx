import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteBooking, getBookings } from '../services/api'
import { useStore } from '../store/StoreContext'
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiHome, FiAlertCircle, FiBell, FiMessageSquare } from 'react-icons/fi'
import './GuestDashboard.css'
import ConfirmModal from '../components/ConfirmModal'


interface Booking {
  id: string
  checkIn: string
  checkOut: string
  status: string
  cancellationReason?: string | null
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)

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
    setPendingCancelId(id)
    setCancelReason('')
    setConfirmOpen(true)
  }

  const closeConfirm = () => {
    if (cancelling) return
    setConfirmOpen(false)
    setPendingCancelId(null)
    setCancelReason('')
  }

  const confirmCancel = async () => {
    if (!pendingCancelId || !cancelReason.trim()) return
    setCancelling(pendingCancelId)
    try {
      const updated = await deleteBooking(pendingCancelId, cancelReason.trim())
      setBookings((prev) => prev.map((booking) => (booking.id === pendingCancelId ? { ...booking, ...updated, status: 'CANCELLED', cancellationReason: cancelReason.trim() } : booking)))
      setConfirmOpen(false)
      setPendingCancelId(null)
      setCancelReason('')
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

  const cancelledNotifications = bookings.filter((booking) => booking.status.toUpperCase() === 'CANCELLED' && booking.cancellationReason)

  const renderBookingsView = () => {
    if (loading) {
      return <div className="guest-db__loading">Loading your bookings...</div>
    }

    if (error) {
      return (
        <div className="guest-db__error">
          <FiAlertCircle /> {error}
        </div>
      )
    }

    if (bookings.length === 0) {
      return (
        <div className="guest-db__empty">
          <FiCalendar className="guest-db__empty-icon" />
          <h2>No bookings yet</h2>
          <p>Start exploring listings and make your first booking!</p>
          <Link to="/listings" className="guest-db__browse-btn">Browse Listings</Link>
        </div>
      )
    }

    return (
      <div className="guest-db__cards">
        {bookings.map((booking) => {
          const s = getStatus(booking.status)
          const photo = booking.listing?.photos?.[0]?.optimizedUrl || booking.listing?.photos?.[0]?.url
          const nights = booking.checkIn && booking.checkOut ? nightsBetween(booking.checkIn, booking.checkOut) : null
          const total = booking.totalPrice || (nights && booking.listing?.pricePerNight ? nights * booking.listing.pricePerNight : null)
          const isCancellable = booking.status.toUpperCase() === 'PENDING'

          return (
            <article key={booking.id} className="guest-db__card">
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

                <div className={`guest-db__status-msg ${s.className}`}>
                  {booking.status.toUpperCase() === 'PENDING' && (
                    <><FiClock /> Awaiting host confirmation</>
                  )}
                  {booking.status.toUpperCase() === 'CONFIRMED' && (
                    <><FiCheckCircle /> Your booking has been confirmed by the host</>
                  )}
                  {booking.status.toUpperCase() === 'CANCELLED' && (
                    <>
                      <FiXCircle />
                      {booking.cancellationReason ? ` Host cancelled this booking. Reason: ${booking.cancellationReason}` : ' This booking was cancelled by the host.'}
                    </>
                  )}
                </div>

                {booking.status.toUpperCase() === 'CANCELLED' && booking.listing?.id && (
                  <p className="guest-db__card-followup">
                    You can still contact the host for more information or other dates right here.
                  </p>
                )}
              </div>

              <div className="guest-db__card-actions">
                {booking.listing?.id && (
                  <button
                    type="button"
                    className="guest-db__view-btn"
                      onClick={() => navigate('/guest/messages')}
                  >
                    Message Host
                  </button>
                )}
                {booking.listing?.id && (
                  <Link to={`/listings/${booking.listing.id}`} className="guest-db__view-btn">
                    View Listing
                  </Link>
                )}
                {isCancellable ? (
                  <button
                    className="guest-db__cancel-btn"
                    onClick={() => handleCancel(booking.id)}
                    disabled={cancelling === booking.id}
                  >
                    {cancelling === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                ) : booking.status.toUpperCase() === 'CANCELLED' ? (
                  <span className="guest-db__cancelled-note">No further actions available</span>
                ) : null}
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <div className="guest-db">
      <main className="guest-db__main">
        <div className="guest-db__hero">
          <div className="guest-db__hero-main">
            <div>
              <p className="guest-db__hero-eyebrow">Guest Dashboard</p>
              <h1 className="guest-db__hero-title">My Bookings</h1>
              <p className="guest-db__hero-sub">
                Welcome back, <strong>{state.user?.name || 'Guest'}</strong>. Track and manage your reservations.
              </p>
            </div>

            <div className="guest-db__hero-actions">
              <button
                type="button"
                className="guest-db__notif-btn"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Booking notifications"
              >
                <FiBell />
                {cancelledNotifications.length > 0 ? <span className="guest-db__notif-badge">{cancelledNotifications.length}</span> : null}
              </button>
              {notificationsOpen ? (
                <div className="guest-db__notif-panel">
                  <h2>Notifications</h2>
                  {cancelledNotifications.length === 0 ? (
                    <p>No cancellation notifications yet.</p>
                  ) : (
                    cancelledNotifications.map((booking) => (
                      <div key={booking.id} className="guest-db__notif-item">
                        <strong>{booking.listing?.title || 'Booking'}</strong>
                        <p>{booking.cancellationReason}</p>
                        <Link
                          to={booking.listing?.id ? `/listings/${booking.listing.id}` : '/listings'}
                          className="guest-db__notif-link"
                        >
                          View listing and message host
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

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

        <div className="guest-db__dashboard-layout">
          <div className="guest-db__content">
            {renderBookingsView()}
          </div>

          <aside className="guest-db__side-nav">
            <div className="guest-db__side-header">
              <h2>Guest Dashboard</h2>
            </div>
            <nav className="guest-db__side-nav-list" aria-label="Guest dashboard navigation">
              <button type="button" className="guest-db__side-link is-active">
                <FiCalendar /> Bookings
              </button>
              <Link to="/guest/messages" className="guest-db__side-link">
                <FiMessageSquare /> Messages
              </Link>
            </nav>
          </aside>
        </div>
      </main>

      <ConfirmModal
        open={confirmOpen}
        title="Cancel booking?"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmLabel="Cancel booking"
        confirmTone="danger"
        loading={!!cancelling}
        reason={cancelReason}
        reasonLabel="Cancellation reason"
        reasonPlaceholder="Tell us why you're cancelling this booking"
        reasonRequired
        onReasonChange={setCancelReason}
        onConfirm={confirmCancel}
        onCancel={closeConfirm}
      />
    </div>
  )
}
