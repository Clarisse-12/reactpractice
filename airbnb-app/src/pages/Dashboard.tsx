import './Dashboard.css'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { me, getBookings, updateBookingStatus, updateListing, deleteListing } from '../services/api'
import ConfirmModal from '../components/ConfirmModal'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [hostListings, setHostListings] = useState<any[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmAction, setConfirmAction] = useState<null | { type: 'cancel-booking' | 'delete-listing'; id: string }>(null)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    guests: '',
    type: 'apartment',
    amenities: '',
  })
  const role = String(user?.role || 'guest').toLowerCase()

  useEffect(() => {
    let mounted = true
    Promise.all([me().catch(() => null), getBookings().catch(() => ({ data: [] }))])
      .then(([u, bookingsRes]) => {
        if (!mounted) return
        setUser(u)
        const all = bookingsRes?.data || []
        if (u && u.listings && Array.isArray(u.listings)) {
          setHostListings(u.listings)
          const hostIds = new Set(u.listings.map((l: any) => l.id))
          setBookings(all.filter((b: any) => hostIds.has(b.listingId)))
        } else if (u && u.id && u.bookings) {
          setBookings(u.bookings)
        } else {
          setBookings(all)
        }
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateBookingStatus(id, status)
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
    } catch (err: any) {
      alert(err?.message || 'Failed to update booking')
    }
  }

  const handleCancelBooking = async (id: string) => {
    setConfirmAction({ type: 'cancel-booking', id })
    setCancelReason('')
    setConfirmOpen(true)
  }

  const handleEditStart = (listing: any) => {
    setEditingId(listing.id)
    setEditForm({
      title: listing.title || '',
      description: listing.description || '',
      location: listing.location || '',
      pricePerNight: String(listing.pricePerNight || ''),
      guests: String(listing.guests || ''),
      type: listing.type || 'apartment',
      amenities: Array.isArray(listing.amenities) ? listing.amenities.join(', ') : '',
    })
  }

  const handleEditSave = async () => {
    if (!editingId) return
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        pricePerNight: Number(editForm.pricePerNight),
        guests: Number(editForm.guests),
        type: editForm.type,
        amenities: editForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      }
      const updated = await updateListing(editingId, payload)
      setHostListings((prev) => prev.map((l) => (l.id === editingId ? { ...l, ...updated } : l)))
      setEditingId(null)
    } catch (err: any) {
      alert(err?.message || 'Failed to update listing')
    }
  }

  const handleDeleteListing = async (listingId: string) => {
    setConfirmAction({ type: 'delete-listing', id: listingId })
    setConfirmOpen(true)
  }

  const closeConfirm = () => {
    if (confirmLoading) return
    setConfirmOpen(false)
    setConfirmAction(null)
    setCancelReason('')
  }

  const runConfirmedAction = async () => {
    if (!confirmAction) return
    setConfirmLoading(true)
    try {
      if (confirmAction.type === 'cancel-booking') {
        if (!cancelReason.trim()) {
          setConfirmLoading(false)
          return
        }
        await updateBookingStatus(confirmAction.id, 'CANCELLED', cancelReason.trim())
        setBookings((prev) => prev.map((b) => (b.id === confirmAction.id ? { ...b, status: 'CANCELLED', cancellationReason: cancelReason.trim() } : b)))
      } else {
        await deleteListing(confirmAction.id)
        setHostListings((prev) => prev.filter((l) => l.id !== confirmAction.id))
        setBookings((prev) => prev.filter((b) => b.listingId !== confirmAction.id))
      }
      setConfirmOpen(false)
      setConfirmAction(null)
      setCancelReason('')
    } catch (err: any) {
      alert(err?.message || 'Action failed')
    } finally {
      setConfirmLoading(false)
    }
  }

  const hostStats = {
    totalListings: hostListings.length,
    pendingBookings: bookings.filter((b) => String(b.status).toUpperCase() === 'PENDING').length,
    confirmedBookings: bookings.filter((b) => String(b.status).toUpperCase() === 'CONFIRMED').length,
    cancelledBookings: bookings.filter((b) => String(b.status).toUpperCase() === 'CANCELLED').length,
  }

  return (
    <section className="dashboard-page" aria-label="Dashboard">
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar__brand">
          <span className="dashboard-sidebar__dot" />
          <span className="dashboard-sidebar__name">ListOn</span>
        </div>

        <div className="dashboard-sidebar__section">
          <p className="dashboard-sidebar__label">Main Menu</p>
          <a className="dashboard-sidebar__item is-active" href="#dashboard">{role === 'guest' ? 'My Bookings' : 'Dashboard'}</a>
          {role === 'host' ? <a className="dashboard-sidebar__item" href="#my-listings">My Listings</a> : null}
          {role === 'host' ? <a className="dashboard-sidebar__item" href="#bookings">Listing Bookings</a> : null}
        </div>

        {role === 'host' ? (
          <div className="dashboard-sidebar__section">
            <p className="dashboard-sidebar__label">Host</p>
            <Link className="dashboard-sidebar__item" to="/dashboard/add-listing">Add Listing</Link>
          </div>
        ) : null}
      </aside>

      <div className="dashboard-main" id="dashboard">
        <div className="dashboard-hero">
          <div>
            <p className="dashboard-hero__eyebrow">{role === 'guest' ? 'My Bookings' : 'Host Dashboard'}</p>
            <h1 className="dashboard-hero__title">{role === 'guest' ? 'Track and manage your bookings' : 'Manage your listings and booking requests'}</h1>
            <p className="dashboard-hero__text">{user?.name ? `Welcome, ${user.name}` : 'Loading your dashboard...'}</p>
            
          </div>
          <div className="dashboard-hero__visual" aria-hidden="true" />
        </div>

        {role === 'host' ? (
          <div className="dashboard-cards">
            <article className="dashboard-card">
              <p className="dashboard-card__title">My Listings</p>
              <div className="dashboard-card__body">
                <strong className="dashboard-card__value">{hostStats.totalListings}</strong>
                <span className="dashboard-card__icon dashboard-card__icon--chart" />
              </div>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card__title">Pending Bookings</p>
              <div className="dashboard-card__body">
                <strong className="dashboard-card__value">{hostStats.pendingBookings}</strong>
                <span className="dashboard-card__icon dashboard-card__icon--pie" />
              </div>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card__title">Confirmed Bookings</p>
              <div className="dashboard-card__body">
                <strong className="dashboard-card__value">{hostStats.confirmedBookings}</strong>
                <span className="dashboard-card__icon dashboard-card__icon--money" />
              </div>
            </article>
            <article className="dashboard-card">
              <p className="dashboard-card__title">Cancelled Bookings</p>
              <div className="dashboard-card__body">
                <strong className="dashboard-card__value">{hostStats.cancelledBookings}</strong>
                <span className="dashboard-card__icon dashboard-card__icon--chart" />
              </div>
            </article>
          </div>
        ) : null}

        <ConfirmModal
          open={confirmOpen}
          title={confirmAction?.type === 'delete-listing' ? 'Delete listing?' : 'Cancel booking?'}
          message={confirmAction?.type === 'delete-listing'
            ? 'Are you sure you want to delete this listing? This action cannot be undone.'
            : 'Are you sure you want to cancel this booking? This action cannot be undone.'}
          confirmLabel={confirmAction?.type === 'delete-listing' ? 'Delete' : 'Cancel booking'}
          confirmTone="danger"
          loading={confirmLoading}
          reason={confirmAction?.type === 'cancel-booking' ? cancelReason : ''}
          reasonLabel="Cancellation reason"
          reasonPlaceholder="Tell the guest why this booking is being cancelled"
          reasonRequired={confirmAction?.type === 'cancel-booking'}
          onReasonChange={confirmAction?.type === 'cancel-booking' ? setCancelReason : undefined}
          onConfirm={runConfirmedAction}
          onCancel={closeConfirm}
        />

        {role === 'host' ? (
          <section className="dashboard-table" id="my-listings">
            <div className="dashboard-table__head">
              <h2>My Listings</h2>
            </div>
            <div className="dashboard-table__scroll">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Guests</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hostListings.map((listing) => (
                    <tr key={listing.id}>
                      <td>{listing.title}</td>
                      <td>{listing.location}</td>
                      <td>${listing.pricePerNight}</td>
                      <td>{listing.guests}</td>
                      <td>{listing.type}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="dashboard-table__button" type="button" onClick={() => handleEditStart(listing)}>Edit</button>
                          <button className="dashboard-table__button dashboard-table__button--danger" type="button" onClick={() => handleDeleteListing(listing.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {editingId ? (
          <section className="dashboard-edit-card">
            <h3>Edit Listing</h3>
            <div className="dashboard-edit-grid">
              <input value={editForm.title} placeholder="Title" onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} />
              <input value={editForm.location} placeholder="Location" onChange={(e) => setEditForm((p) => ({ ...p, location: e.target.value }))} />
              <input value={editForm.pricePerNight} placeholder="Price" onChange={(e) => setEditForm((p) => ({ ...p, pricePerNight: e.target.value }))} />
              <input value={editForm.guests} placeholder="Guests" onChange={(e) => setEditForm((p) => ({ ...p, guests: e.target.value }))} />
              <select value={editForm.type} onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="APARTMENT">APARTMENT</option>
                <option value="HOUSE">HOUSE</option>
                <option value="VILLA">VILLA</option>
                <option value="CABIN">CABIN</option>
              </select>
              <input value={editForm.amenities} placeholder="Amenities (comma separated)" onChange={(e) => setEditForm((p) => ({ ...p, amenities: e.target.value }))} />
              <textarea value={editForm.description} placeholder="Description" onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="dashboard-edit-actions">
              <button className="dashboard-table__button" type="button" onClick={handleEditSave}>Save</button>
              <button className="dashboard-table__button dashboard-table__button--ghost" type="button" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </section>
        ) : null}

        <section className="dashboard-table" id="bookings">
          <div className="dashboard-table__head">
            <h2>{role === 'guest' ? 'My Bookings' : 'Bookings For My Listings'}</h2>
          </div>

          <div className="dashboard-table__scroll">
            <table>
              <thead>
                <tr>
                  <th>SL</th>
                  <th>Logo</th>
                  <th>{role === 'guest' ? 'Listing' : 'Guest'}</th>
                  <th>Booking Date</th>
                  <th>{role === 'guest' ? 'Location' : 'Listing Location'}</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>{String(i + 1).padStart(2, '0')}</td>
                    <td><span className="dashboard-table__avatar" /></td>
                    <td>{role === 'guest' ? (row.listing?.title || row.title || '—') : (row.guest?.name || row.guestName || row.name || '—')}</td>
                    <td>{new Date(row.createdAt || row.checkIn || Date.now()).toDateString()}</td>
                    <td>{row.listing?.location || row.location || '—'}</td>
                    <td>
                      <div className="dashboard-table__status-wrap">
                        <span className={`dashboard-table__status dashboard-table__status--${String(row.status || '').toLowerCase()}`}>
                          {row.status || '—'}
                        </span>
                        {String(row.status || '').toUpperCase() === 'CANCELLED' && row.cancellationReason ? (
                          <small className="dashboard-table__status-reason">Reason: {row.cancellationReason}</small>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {role === 'host' ? (
                          String(row.status || '').toUpperCase() === 'PENDING' ? (
                            <>
                              <button className="dashboard-table__button" type="button" onClick={() => handleUpdateStatus(row.id, 'CONFIRMED')}>Confirm</button>
                              <button className="dashboard-table__button dashboard-table__button--danger" type="button" onClick={() => handleCancelBooking(row.id)}>Decline</button>
                            </>
                          ) : (
                            <span className="dashboard-table__status-note">No actions available</span>
                          )
                        ) : (
                          String(row.status || '').toUpperCase() === 'PENDING' ? (
                            <button className="dashboard-table__button dashboard-table__button--danger" type="button" onClick={() => handleCancelBooking(row.id)}>Cancel Booking</button>
                          ) : (
                            <span className="dashboard-table__status-note">No actions available</span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}
