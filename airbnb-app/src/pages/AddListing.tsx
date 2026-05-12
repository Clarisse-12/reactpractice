import './AddListing.css'
import { useState, useRef } from 'react'
import { createListing, uploadListingPhotos } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { FiUploadCloud, FiX } from 'react-icons/fi'

const PRESET_AMENITIES = [
  'Wi-Fi', 'Kitchen', 'Parking', 'Pool', 'Gym', 'Air Conditioning',
  'Heating', 'Washer', 'Dryer', 'TV', 'Fireplace', 'Garden',
  'Jacuzzi', 'Security Cameras', 'Furnished', 'Balcony',
]

export default function AddListing() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [pricePerNight, setPricePerNight] = useState('')
  const [guests, setGuests] = useState('1')
  const [type, setType] = useState('APARTMENT')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return
    const newFiles = Array.from(list).filter((f) => {
      if (!f.type.startsWith('image/')) {
        setError(`"${f.name}" is not an image file`)
        return false
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`"${f.name}" exceeds 5MB limit`)
        return false
      }
      return true
    })
    if (!newFiles.length) return
    setError('')
    setFiles((prev) => [...prev, ...newFiles])
    newFiles.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (ev) => setPreviews((prev) => [...prev, ev.target?.result as string])
      reader.readAsDataURL(f)
    })
  }

  const removePhoto = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    )
  }

  const addCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !selectedAmenities.includes(trimmed)) {
      setSelectedAmenities((prev) => [...prev, trimmed])
    }
    setCustomAmenity('')
  }

  const removeAmenity = (amenity: string) => {
    setSelectedAmenities((prev) => prev.filter((a) => a !== amenity))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        title,
        description,
        location,
        pricePerNight: Number(pricePerNight),
        guests: Number(guests),
        type,
        amenities: selectedAmenities,
      }
      const listing = await createListing(payload)

      if (!listing?.id) {
        throw new Error('Listing created but no ID returned')
      }

      if (files.length > 0) {
        try {
          await uploadListingPhotos(listing.id, files)
        } catch (uploadErr: any) {
          // Listing was created — navigate but warn about photos
          setError(`Listing saved but photos failed: ${uploadErr?.message || 'upload error'}. You can add photos by editing the listing.`)
          setSubmitting(false)
          setTimeout(() => navigate('/dashboard/listings'), 3000)
          return
        }
      }

      navigate('/dashboard/listings')
    } catch (err: any) {
      setError(err?.message || 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="add-listing-page" aria-label="Add listing">
      <div className="add-listing-main">
        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <section className="add-listing-card">
            <div className="add-listing-card__heading">
              <span className="add-listing-card__accent" />
              <h1>Basic Information</h1>
            </div>
            <div className="add-listing-grid add-listing-grid--basic-informations">
              <label className="add-listing-field">
                <span>Listing Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter listing title"
                  required
                />
              </label>
              <label className="add-listing-field">
                <span>Category</span>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="APARTMENT">Apartment</option>
                  <option value="HOUSE">House</option>
                  <option value="VILLA">Villa</option>
                  <option value="CABIN">Cabin</option>
                </select>
              </label>
            </div>
          </section>

          {/* Location & Pricing */}
          <section className="add-listing-card">
            <div className="add-listing-card__heading">
              <span className="add-listing-card__accent" />
              <h1>Location & Pricing</h1>
            </div>
            <div className="add-listing-grid add-listing-grid--location">
              <label className="add-listing-field">
                <span>City / Location</span>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nairobi, Kenya"
                  required
                />
              </label>
              <label className="add-listing-field">
                <span>Price per Night ($)</span>
                <input
                  type="number"
                  min="1"
                  value={pricePerNight}
                  onChange={(e) => setPricePerNight(e.target.value)}
                  placeholder="e.g. 120"
                  required
                />
              </label>
              <label className="add-listing-field">
                <span>Max Guests</span>
                <input
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="Number of guests"
                  required
                />
              </label>
            </div>
          </section>

          {/* Amenities */}
          <section className="add-listing-card">
            <div className="add-listing-card__heading">
              <span className="add-listing-card__accent" />
              <h1>Amenities</h1>
            </div>
            <div className="add-listing-amenities-section">
              <p className="add-listing-amenities-hint">Select from common amenities or add your own:</p>
              <div className="add-listing-amenities-grid">
                {PRESET_AMENITIES.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    className={`add-listing-amenity-chip ${selectedAmenities.includes(amenity) ? 'selected' : ''}`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
              <div className="add-listing-custom-amenity">
                <input
                  value={customAmenity}
                  onChange={(e) => setCustomAmenity(e.target.value)}
                  placeholder="Add custom amenity..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomAmenity() } }}
                />
                <button type="button" onClick={addCustomAmenity} className="add-listing-custom-amenity__btn">
                  Add
                </button>
              </div>
              {selectedAmenities.length > 0 && (
                <div className="add-listing-selected-amenities">
                  <p>Selected:</p>
                  <div className="add-listing-selected-tags">
                    {selectedAmenities.map((a) => (
                      <span key={a} className="add-listing-selected-tag">
                        {a}
                        <button type="button" onClick={() => removeAmenity(a)} aria-label={`Remove ${a}`}>
                          <FiX />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Gallery */}
          <section className="add-listing-card">
            <div className="add-listing-card__heading">
              <span className="add-listing-card__accent" />
              <h1>Gallery</h1>
            </div>
            <div className="add-listing-grid add-listing-grid--gallery">
              <div
                className="add-listing-upload"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const dt = e.dataTransfer
                  if (dt.files) {
                    const synth = { target: { files: dt.files } } as any
                    handleFiles(synth)
                  }
                }}
              >
                <FiUploadCloud className="add-listing-upload__icon" />
                <p>Click or drag photos here</p>
                <small>Recommended 350 × 350 px (png, jpg, jpeg)</small>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFiles}
                  style={{ display: 'none' }}
                />
              </div>
              {previews.length > 0 && (
                <div className="add-listing-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="add-listing-preview-item">
                      <img src={src} alt={`Preview ${i + 1}`} />
                      <button
                        type="button"
                        className="add-listing-preview-remove"
                        onClick={() => removePhoto(i)}
                        aria-label="Remove photo"
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="add-listing-card">
            <div className="add-listing-card__heading">
              <span className="add-listing-card__accent" />
              <h1>Description</h1>
            </div>
            <div className="add-listing-grid add-listing-grid--details">
              <label className="add-listing-field add-listing-field--full">
                <span>Description</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your listing in detail (up to 4000 characters)."
                  rows={6}
                  required
                />
              </label>
            </div>
          </section>

          {error && <p className="add-listing-error">{error}</p>}

          <div className="add-listing-actions">
            <button
              className="add-listing-actions__secondary"
              type="button"
              onClick={() => navigate('/dashboard/overview')}
            >
              Cancel
            </button>
            <button className="add-listing-actions__primary" type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Listing'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
