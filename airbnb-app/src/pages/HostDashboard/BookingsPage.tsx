import { useEffect, useMemo, useState } from 'react';
import { getBookings, updateBookingStatus } from '../../services/api';
import { FiCheckCircle, FiXCircle, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './BookingsPage.css';

interface Booking {
  id: string;
  guestName?: string;
  guestPhoto?: string;
  listingTitle?: string;
  bookingDate?: string;
  checkIn?: string;
  checkOut?: string;
  paymentType?: string;
  status: string;
  totalPrice?: number;
  guest?: { name?: string; photo?: string };
  listing?: { title?: string; photos?: any[] };
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const response = await getBookings();
        const data = Array.isArray(response) ? response : response?.data || [];
        setBookings(data);
        setFilteredBookings(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load bookings');
        console.error('Error loading bookings:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const bookingSummary = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => String(booking.status).toUpperCase() === 'PENDING').length,
      confirmed: bookings.filter(
        (booking) => String(booking.status).toUpperCase() === 'CONFIRMED' || String(booking.status).toUpperCase() === 'APPROVED'
      ).length,
      cancelled: bookings.filter((booking) => String(booking.status).toUpperCase() === 'CANCELLED').length,
    }),
    [bookings]
  );

  // Search filter
  useEffect(() => {
    const filtered = bookings.filter((booking) => {
      const guestName = (booking.guest?.name || booking.guestName || '').toLowerCase();
      const listingTitle = (booking.listing?.title || booking.listingTitle || '').toLowerCase();
      const search = searchTerm.toLowerCase();
      return guestName.includes(search) || listingTitle.includes(search);
    });
    setFilteredBookings(filtered);
    setCurrentPage(1);
  }, [searchTerm, bookings]);

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + entriesPerPage);

  const getStatusColor = (status: string) => {
    const s = String(status).toUpperCase();
    if (s === 'CONFIRMED' || s === 'APPROVED') return 'approved';
    if (s === 'PENDING') return 'pending';
    if (s === 'CANCELLED') return 'cancelled';
    return 'pending';
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getListingPhoto = (booking: Booking) => {
    const photo = booking.listing?.photos?.[0];
    if (!photo) return 'https://via.placeholder.com/80?text=Listing';
    return photo.optimizedUrl || photo.url || 'https://via.placeholder.com/80?text=Listing';
  };

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      await updateBookingStatus(bookingId, status);
      setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
      setFilteredBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)));
    } catch (err: any) {
      setError(err?.message || 'Failed to update booking status');
    }
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1>Recent Bookings</h1>
        <p>Manage all your property bookings</p>
      </div>

      <div className="booking-summary-cards">
        <article className="booking-summary-card">
          <span>Total</span>
          <strong>{bookingSummary.total}</strong>
        </article>
        <article className="booking-summary-card booking-summary-card--pending">
          <span>Pending</span>
          <strong>{bookingSummary.pending}</strong>
        </article>
        <article className="booking-summary-card booking-summary-card--confirmed">
          <span>Confirmed</span>
          <strong>{bookingSummary.confirmed}</strong>
        </article>
        <article className="booking-summary-card booking-summary-card--cancelled">
          <span>Cancelled</span>
          <strong>{bookingSummary.cancelled}</strong>
        </article>
      </div>

      <div className="bookings-controls">
        <div className="entries-selector">
          <label>Show</label>
          <select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <label>entries</label>
        </div>

        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by guest name or listing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="loading">Loading bookings...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : paginatedBookings.length === 0 ? (
        <div className="empty-state">
          <h2>No bookings found</h2>
          <p>{searchTerm ? 'Try adjusting your search' : 'You have no bookings yet'}</p>
        </div>
      ) : (
        <>
          <div className="bookings-table-wrapper">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>SL</th>
                  <th>LOGO</th>
                  <th>NAME</th>
                  <th>BOOKING DATE</th>
                  <th>PAYMENT TYPE</th>
                  <th>STATUS</th>
                  <th>VIEW BOOKING</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookings.map((booking, index) => (
                  <tr key={booking.id}>
                    <td className="sl-cell">{String(startIndex + index + 1).padStart(2, '0')}</td>
                    <td className="logo-cell">
                      <img
                        src={getListingPhoto(booking)}
                        alt={booking.listing?.title || 'Listing'}
                        className="listing-photo"
                      />
                    </td>
                    <td className="name-cell">
                      <div className="guest-info">
                        <p className="guest-name">{booking.guest?.name || booking.guestName || 'Guest'}</p>
                        <p className="listing-name">{booking.listing?.title || booking.listingTitle || '-'}</p>
                      </div>
                    </td>
                    <td className="date-cell">
                      {formatDate(booking.bookingDate || booking.checkIn)}
                    </td>
                    <td className="payment-cell">
                      {booking.paymentType || 'Online'}
                    </td>
                    <td className="status-cell">
                      <span className={`status-badge status-${getStatusColor(booking.status)}`}>
                        {booking.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <div className="booking-actions">
                        <button
                          className="booking-action-btn booking-action-btn--confirm"
                          onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          type="button"
                        >
                          <FiCheckCircle /> Confirm
                        </button>
                        <button
                          className="booking-action-btn booking-action-btn--cancel"
                          onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
                          type="button"
                        >
                          <FiXCircle /> Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bookings-footer">
            <p className="entries-info">
              Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, filteredBookings.length)} of {filteredBookings.length} entries
            </p>

            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  const distance = Math.abs(page - currentPage);
                  return distance <= 1 || page === 1 || page === totalPages;
                })
                .map((page, idx, arr) => {
                  if (idx > 0 && arr[idx - 1] !== page - 1) {
                    return (
                      <span key={`ellipsis-${page}`} className="pagination-ellipsis">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}

              <button
                className="pagination-btn"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
