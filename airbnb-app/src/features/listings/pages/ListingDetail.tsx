import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { FaStar, FaArrowLeft, FaHeart, FaRegHeart, FaMapMarkerAlt, FaUser } from 'react-icons/fa'
import { getListingById, createBooking } from '../../../services/api'
import { useFavorites } from '../hooks/useFavorites'
import { useStore } from '../../../store/StoreContext'
import { Spinner } from '../../../shared/components/Spinner'
import './ListingDetail.css'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useStore()
  const { toggle } = useFavorites()

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [bookingForm, setBookingForm] = useState({ checkin: '', checkout: '' })
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getListingById(id)
      .then(setListing)
      .catch(() => setListing(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />

  if (!listing) {
    return (
      <div className="listing-detail">
        <button onClick={() => navigate('/listings')} className="listing-detail__back-btn">
          <FaArrowLeft /> Back to Listings
        </button>
        <div className="listing-detail__not-found">
          <h1>Listing not found</h1>
        </div>
      </div>
    )
  }

  const photos: { url: string; optimizedUrl?: string }[] = listing.photos || []
  const images = photos.map((p) => p.optimizedUrl || p.url)
  const mainImage = images[selectedImage] || 'https://via.placeholder.com/900x500?text=No+Image'
  const isSaved = state.saved.includes(listing.id)

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault()
    setBookingError('')
    setBookingLoading(true)
    try {
      await createBooking({ listingId: listing.id, checkIn: bookingForm.checkin, checkOut: bookingForm.checkout })
      setBookingSuccess(true)
      setBookingForm({ checkin: '', checkout: '' })
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create booking'
      if (errMsg.includes('Missing or invalid authorization header') || errMsg.includes('Unauthorized')) {
        setBookingError('Please sign in to proceed with booking')
      } else {
        setBookingError(errMsg)
      }
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="listing-detail">
      <div className="listing-detail__header">
        <button onClick={() => navigate('/listings')} className="listing-detail__back-btn">
          <FaArrowLeft />
        </button>
        <div className="listing-detail__header-content">
          <h1 className="listing-detail__title">{listing.title}</h1>
          <div className="listing-detail__meta">
            {listing.rating && (
              <span className="listing-detail__rating">
                <FaStar /> {Number(listing.rating).toFixed(2)}
              </span>
            )}
            <span className="listing-detail__location">
              <FaMapMarkerAlt /> {listing.location}
            </span>
            {listing.type && <span className="listing-detail__type">{listing.type}</span>}
            {listing.guests && <span className="listing-detail__type">Up to {listing.guests} guests</span>}
          </div>
          {listing.host?.name && (
            <p className="listing-detail__posted">
              <FaUser /> Hosted by {listing.host.name}
            </p>
          )}
        </div>
        <button
          className={`listing-detail__save-btn ${isSaved ? 'active' : ''}`}
          onClick={() => toggle(listing.id, listing.title)}
          aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
        >
          {isSaved ? <FaHeart /> : <FaRegHeart />}
          <span>Save this listing</span>
        </button>
      </div>

      {/* Gallery */}
      <div className="listing-detail__gallery">
        <div className="listing-detail__main-image">
          <img src={mainImage} alt={listing.title} />
        </div>
        {images.length > 1 && (
          <div className="listing-detail__thumbnails">
            {images.map((img: string, index: number) => (
              <button
                key={index}
                className={`listing-detail__thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
                aria-label={`View image ${index + 1}`}
              >
                <img src={img} alt={`Thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="listing-detail__content">
        <div className="listing-detail__left">
          {listing.description && (
            <section className="listing-detail__section">
              <h2 className="listing-detail__section-title">
                About this <span className="highlight">Place</span>
              </h2>
              <p className="listing-detail__description">{listing.description}</p>
            </section>
          )}

          {listing.amenities?.length > 0 && (
            <section className="listing-detail__section">
              <h2 className="listing-detail__section-title">
                Amenities <span className="highlight">Available</span>
              </h2>
              <div className="listing-detail__amenities">
                {listing.amenities.map((amenity: string, index: number) => (
                  <div key={index} className="listing-detail__amenity">
                    <span className="listing-detail__amenity-icon">✓</span>
                    <span className="listing-detail__amenity-text">{amenity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {listing.reviews?.length > 0 && (
            <section className="listing-detail__section">
              <h2 className="listing-detail__section-title">
                Guest <span className="highlight">Reviews</span>
              </h2>
              {listing.reviews.map((review: any) => (
                <div key={review.id} className="listing-detail__review-item">
                  <div className="listing-detail__review-header">
                    <h4>{review.user?.name || 'Guest'}</h4>
                    <span className="listing-detail__review-rating">
                      <FaStar /> {review.rating}
                    </span>
                  </div>
                  <p className="listing-detail__review-text">{review.comment}</p>
                  <p className="listing-detail__review-date">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="listing-detail__right">
          <div className="listing-detail__booking">
            <h3>
              Book this <span className="highlight">Place</span>
            </h3>
            <p className="listing-detail__price">
              <strong>${listing.pricePerNight}</strong> / night
            </p>
            {bookingSuccess ? (
              <div className="listing-detail__booking-success">
                ✓ Booking submitted! Check your dashboard for details.
              </div>
            ) : (
              <form className="listing-detail__booking-form" onSubmit={handleBook}>
                <div className="listing-detail__form-group">
                  <label htmlFor="booking-checkin">Check-in Date *</label>
                  <input
                    type="date"
                    id="booking-checkin"
                    value={bookingForm.checkin}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, checkin: e.target.value }))}
                    required
                  />
                </div>
                <div className="listing-detail__form-group">
                  <label htmlFor="booking-checkout">Check-out Date *</label>
                  <input
                    type="date"
                    id="booking-checkout"
                    value={bookingForm.checkout}
                    min={bookingForm.checkin || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setBookingForm((prev) => ({ ...prev, checkout: e.target.value }))}
                    required
                  />
                </div>
                {bookingError && <p className="listing-detail__booking-error">{bookingError}</p>}
                <button type="submit" className="listing-detail__book-btn" disabled={bookingLoading}>
                  {bookingLoading ? 'Booking...' : 'Book Now'}
                </button>
              </form>
            )}
          </div>

          <div className="listing-detail__saved-count">
            <FaHeart /> Save this listing to your favorites
          </div>
        </aside>
      </div>
    </div>
  )
}
