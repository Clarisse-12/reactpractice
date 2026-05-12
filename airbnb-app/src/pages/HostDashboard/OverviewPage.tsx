import { useEffect, useMemo, useState } from 'react';
import { FiBarChart2, FiHome, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { getBookings, me } from '../../services/api';
import './OverviewPage.css';

interface Booking {
  id: string;
  status?: string;
  totalPrice?: number;
  checkIn?: string;
  bookingDate?: string;
  listingId?: string;
}

export function OverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hostName, setHostName] = useState('Host');
  const [hostListings, setHostListings] = useState<any[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        const [user, bookingsRes] = await Promise.all([
          me().catch(() => null),
          getBookings().catch(() => ({ data: [] })),
        ]);

        setHostName(user?.name || 'Host');
        const listings = Array.isArray(user?.listings) ? user.listings : [];
        setHostListings(listings);
        setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load overview');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  const hostBookingRows = useMemo(
    () => bookings.filter((booking) => hostListings.some((listing) => listing.id === booking.listingId)),
    [bookings, hostListings]
  );

  const dashboardStats = useMemo(() => {
    const totalListings = hostListings.length;
    const totalBookings = hostBookingRows.length;
    const confirmedBookings = hostBookingRows.filter((booking) => String(booking.status).toUpperCase() === 'CONFIRMED' || String(booking.status).toUpperCase() === 'APPROVED').length;
    const pendingBookings = hostBookingRows.filter((booking) => String(booking.status).toUpperCase() === 'PENDING').length;
    const cancelledBookings = hostBookingRows.filter((booking) => String(booking.status).toUpperCase() === 'CANCELLED').length;
    const revenue = hostBookingRows
      .filter((booking) => String(booking.status).toUpperCase() === 'CONFIRMED' || String(booking.status).toUpperCase() === 'APPROVED')
      .reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const estimatedProfit = revenue;

    return {
      totalListings,
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      revenue,
      estimatedProfit,
    };
  }, [hostListings, hostBookingRows]);



  return (
    <div className="overview-page">
      <header className="overview-hero">
        <div>
          <p className="overview-hero__eyebrow">Host Overview</p>
          <h1>Welcome back, {hostName}</h1>
          <p>Live totals and booking activity from your database, organized for quick decisions.</p>
        </div>

        <div className="overview-hero__badge">
          <FiBarChart2 />
          <span>{dashboardStats.totalBookings} bookings tracked</span>
        </div>
      </header>

      {loading ? <div className="overview-state">Loading overview...</div> : null}
      {error ? <div className="overview-state overview-state--error">{error}</div> : null}

      {!loading && !error ? (
        <>
          <section className="overview-metric-grid">
            <article className="overview-metric-card overview-metric-card--accent">
              <span className="overview-metric-card__icon"><FiHome /></span>
              <div>
                <p>Total Listings</p>
                <strong>{dashboardStats.totalListings}</strong>
                <small>Listings in your host account</small>
              </div>
            </article>

            <article className="overview-metric-card">
              <span className="overview-metric-card__icon"><FiCheckCircle /></span>
              <div>
                <p>Total Bookings</p>
                <strong>{dashboardStats.totalBookings}</strong>
                <small>Across all your listings</small>
              </div>
            </article>

            <article className="overview-metric-card">
              <span className="overview-metric-card__icon"><FiTrendingUp /></span>
              <div>
                <p>Revenue</p>
                <strong>${dashboardStats.revenue.toLocaleString()}</strong>
                <small>Confirmed booking income</small>
              </div>
            </article>

            <article className="overview-metric-card">
              <span className="overview-metric-card__icon"><FiTrendingUp /></span>
              <div>
                <p>Total Profit</p>
                <strong>${dashboardStats.estimatedProfit.toLocaleString()}</strong>
                <small>Estimated from completed bookings</small>
              </div>
            </article>
          </section>


        </>
      ) : null}
    </div>
  );
}
