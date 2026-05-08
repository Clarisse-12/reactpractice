import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { FaStar, FaArrowLeft, FaHeart, FaRegHeart } from 'react-icons/fa'
import numeral from 'numeral'
import { listings } from '../../../data/listings'
import { useStore } from '../../../store/StoreContext'
import { useFavorites } from '../hooks/useFavorites'
import './ListingDetail.css'

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useStore()
  const { toggle } = useFavorites()

  const listing = listings.find((l) => l.id === Number(id))
  const [selectedImage, setSelectedImage] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
  })

  if (!listing) {
    return (
      <div className="listing-detail">
        <button onClick={() => navigate('/listings')} className="listing-detail__back">
          <FaArrowLeft /> Back to Listings
        </button>
        <div className="listing-detail__not-found">
          <h1>Listing not found</h1>
        </div>
      </div>
    )
  }

  const isSaved = state.saved.includes(listing.id)

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setFormData({ name: '', email: '', comment: '' })
  }

  return (
    <div className="listing-detail">
      {/* Header */}
      <div className="listing-detail__header">
        <button onClick={() => navigate('/listings')} className="listing-detail__back-btn">
          <FaArrowLeft />
        </button>

        <div className="listing-detail__header-content">
          <h1 className="listing-detail__title">{listing.title}</h1>
          <div className="listing-detail__meta">
            <span className="listing-detail__rating">
              <FaStar /> {numeral(listing.rating).format('0.00')}
            </span>
            <span className="listing-detail__reviews">({numeral(listing.reviews).format('0,0')} reviews)</span>
            <span className="listing-detail__location">{listing.location}</span>
            <span className="listing-detail__type">Full time</span>
          </div>
          <p className="listing-detail__posted">Posted 7 hours ago</p>
        </div>

        <button
          className={`listing-detail__save-btn ${isSaved ? 'active' : ''}`}
          onClick={() => toggle(listing.id)}
          aria-label={isSaved ? 'Unsave listing' : 'Save listing'}
        >
          {isSaved ? <FaHeart /> : <FaRegHeart />}
          <span>Save this listing</span>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="listing-detail__gallery">
        <div className="listing-detail__main-image">
          <img src={listing.images[selectedImage]} alt={`${listing.title} - Image ${selectedImage + 1}`} />
        </div>
        <div className="listing-detail__thumbnails">
          {listing.images.map((img, index) => (
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
      </div>

      {/* Main Content */}
      <div className="listing-detail__content">
        {/* Left Column */}
        <div className="listing-detail__left">
          {/* Description Section */}
          <section className="listing-detail__section">
            <h2 className="listing-detail__section-title">
              Latest Property <span className="highlight">Reviews</span>
            </h2>
            <p className="listing-detail__description">{listing.description}</p>
          </section>

          {/* Amenities Section */}
          <section className="listing-detail__section">
            <h2 className="listing-detail__section-title">
              Amenities <span className="highlight">Available</span>
            </h2>
            <div className="listing-detail__amenities">
              {listing.amenities.map((amenity, index) => (
                <div key={index} className="listing-detail__amenity">
                  <span className="listing-detail__amenity-icon">✓</span>
                  <span className="listing-detail__amenity-text">{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing Section */}
          <section className="listing-detail__section">
            <h2 className="listing-detail__section-title">Pricing</h2>
            <div className="listing-detail__menu">
              {listing.menu.map((item, index) => (
                <div key={index} className="listing-detail__menu-item">
                  <div className="listing-detail__menu-header">
                    <h4 className="listing-detail__menu-name">{item.name}</h4>
                    {item.tag && <span className="listing-detail__menu-tag">{item.tag}</span>}
                  </div>
                  <p className="listing-detail__menu-desc">{item.description}</p>
                  <span className="listing-detail__menu-price">${item.price}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Comments Section */}
          <section className="listing-detail__section">
            <h2 className="listing-detail__section-title">
              Leave a <span className="highlight">Comment</span>
            </h2>
            <form className="listing-detail__form" onSubmit={handleSubmit}>
              <div className="listing-detail__form-row">
                <div className="listing-detail__form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="listing-detail__form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              <div className="listing-detail__form-group">
                <label htmlFor="comment">Comment *</label>
                <textarea
                  id="comment"
                  name="comment"
                  placeholder="Tell us what we can help you with!"
                  value={formData.comment}
                  onChange={handleFormChange}
                  rows={5}
                  required
                />
              </div>
              <button type="submit" className="listing-detail__submit-btn">
                Submit
              </button>
            </form>
          </section>
        </div>

        {/* Right Column */}
        <aside className="listing-detail__right">
          {/* Booking Widget */}
          <div className="listing-detail__booking">
            <h3>Book a table <span className="highlight">online</span></h3>
            <form className="listing-detail__booking-form">
              <div className="listing-detail__form-group">
                <label htmlFor="booking-name">Full Name *</label>
                <input
                  type="text"
                  id="booking-name"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="listing-detail__form-group">
                <label htmlFor="booking-email">Email Address *</label>
                <input
                  type="email"
                  id="booking-email"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              <div className="listing-detail__form-group">
                <label htmlFor="booking-comment">Comment *</label>
                <textarea
                  id="booking-comment"
                  placeholder="Tell us what we can help you with!"
                  rows={4}
                  required
                />
              </div>
              <button type="submit" className="listing-detail__book-btn">
                Book Now
              </button>
            </form>
          </div>

          {/* Opening Hours */}
          <div className="listing-detail__hours">
            <h3>
              Opening <span className="highlight">Hours</span>
            </h3>
            <div className="listing-detail__hours-list">
              {Object.entries(listing.openingHours).map(([day, hours]) => (
                <div key={day} className="listing-detail__hours-item">
                  <span className="listing-detail__day">{day}</span>
                  <span className={`listing-detail__time ${hours === 'Close' ? 'closed' : ''}`}>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {listing.reviews_list.length > 0 && (
            <div className="listing-detail__reviews">
              <h3>Recent Reviews</h3>
              {listing.reviews_list.map((review) => (
                <div key={review.id} className="listing-detail__review-item">
                  <div className="listing-detail__review-header">
                    <h4>{review.author}</h4>
                    <span className="listing-detail__review-rating">
                      <FaStar /> {review.rating}
                    </span>
                  </div>
                  <p className="listing-detail__review-text">{review.text}</p>
                  <p className="listing-detail__review-date">{review.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* People Saved */}
          <div className="listing-detail__saved-count">
            <FaHeart /> 46 people bookmarked this place
          </div>
        </aside>
      </div>
    </div>
  )
}
