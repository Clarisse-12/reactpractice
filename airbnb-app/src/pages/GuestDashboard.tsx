import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deleteBooking, getBookings } from '../services/api'
import { useStore } from '../store/StoreContext'
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiXCircle, FiHome, FiAlertCircle, FiBell, FiInbox, FiMessageSquare, FiSend } from 'react-icons/fi'
import { getThreadsForUser, sendMessage, type ConversationThread } from '../services/messages'
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

type GuestThread = ConversationThread

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
  const [threads, setThreads] = useState<GuestThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

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

  useEffect(() => {
    if (!state.user) return
    const items = getThreadsForUser(state.user.id)
    setThreads(items)
    setSelectedThreadId((current) => current || items[0]?.id || '')
  }, [state.user, bookings.length])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  )

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

  const refreshThreads = () => {
    if (!state.user) return
    const items = getThreadsForUser(state.user.id)
    setThreads(items)
    setSelectedThreadId((current) => current || items[0]?.id || '')
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const user = state.user
    if (!user || !selectedThread) return

    const text = draft.trim()
    if (!text) return

    setSending(true)
    try {
      sendMessage({
        listingId: selectedThread.listingId,
        listingTitle: selectedThread.listingTitle,
        hostId: selectedThread.hostId,
        hostName: selectedThread.hostName,
        guestId: selectedThread.guestId,
        guestName: selectedThread.guestName,
        senderId: user.id,
        senderName: user.name || user.username || 'Guest',
        text,
      })
      setDraft('')
      refreshThreads()
    } finally {
      setSending(false)
    }
  }

  const openBookingConversation = (listingId?: string) => {
    if (!listingId) return
    const thread = threads.find((item) => item.listingId === listingId)
    if (thread) {
      setSelectedThreadId(thread.id)
      return
    }
    navigate(`/listings/${listingId}`)
  }

  return (
    <div className="guest-db">
      <main className="guest-db__main">
        {/* Hero */}
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
                        <Link to={booking.listing?.id ? `/listings/${booking.listing.id}` : '/listings'} className="guest-db__notif-link">
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

        <section className="guest-db__messages-section">
          <div className="guest-db__messages-header">
            <div>
              <p className="guest-db__messages-eyebrow">Messages</p>
              <h2>Continue chatting with hosts</h2>
            </div>
            <div className="guest-db__messages-count">
              <FiInbox /> {threads.length} conversation{threads.length === 1 ? '' : 's'}
            </div>
          </div>

          <div className="guest-db__messages-layout">
            <aside className="guest-db__messages-sidebar">
              {threads.length === 0 ? (
                <div className="guest-db__messages-empty">
                  <FiMessageSquare />
                  <p>No conversations yet. Open a listing and message the host first.</p>
                </div>
              ) : (
                threads.map((thread) => (
                  <button
                    key={thread.id}
                    type="button"
                    className={`guest-db__thread ${selectedThreadId === thread.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedThreadId(thread.id)}
                  >
                    <strong>{thread.hostName}</strong>
                    <span>{thread.listingTitle}</span>
                    <p>{thread.messages[thread.messages.length - 1]?.text || 'No messages yet'}</p>
                  </button>
                ))
              )}
            </aside>

            <div className="guest-db__messages-panel">
              {!selectedThread ? (
                <div className="guest-db__messages-empty-convo">
                  <FiMessageSquare />
                  <h3>Select a conversation</h3>
                  <p>Pick a host thread to read and reply here.</p>
                </div>
              ) : (
                <>
                  <div className="guest-db__messages-thread-head">
                    <div>
                      <p>{selectedThread.listingTitle}</p>
                      <h3>Chat with {selectedThread.hostName}</h3>
                    </div>
                    <button
                      type="button"
                      className="guest-db__messages-open-listing"
                      onClick={() => navigate(`/listings/${selectedThread.listingId}`)}
                    >
                      Open listing
                    </button>
                  </div>

                  <div className="guest-db__messages-list">
                    {selectedThread.messages.map((message) => {
                      const isMine = message.senderId === state.user?.id
                      return (
                        <div key={message.id} className={`guest-db__message ${isMine ? 'is-me' : 'is-host'}`}>
                          <div className="guest-db__message-bubble">
                            <p>{message.text}</p>
                            <small>{message.senderName} · {new Date(message.createdAt).toLocaleString()}</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <form className="guest-db__composer" onSubmit={handleSendMessage}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      placeholder="Write a message to the host..."
                      rows={3}
                    />
                    <button type="submit" disabled={sending || !draft.trim()}>
                      <FiSend /> {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

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

                  {/* Actions */}
                  <div className="guest-db__card-actions">
                    {booking.listing?.id && (
                      <button
                        type="button"
                        className="guest-db__view-btn"
                        onClick={() => openBookingConversation(booking.listing?.id)}
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
                      <button
                        className="guest-db__cancel-btn"
                        onClick={async () => {
                          setCancelling(booking.id)
                          try {
                            await deleteBooking(booking.id, 'Acknowledged by guest')
                            setBookings((prev) => prev.filter((b) => b.id !== booking.id))
                          } catch (err: any) {
                            alert(err?.message || 'Failed to acknowledge cancellation')
                          } finally {
                            setCancelling(null)
                          }
                        }}
                        disabled={cancelling === booking.id}
                      >
                        {cancelling === booking.id ? 'Processing...' : 'OK'}
                      </button>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        )}
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
