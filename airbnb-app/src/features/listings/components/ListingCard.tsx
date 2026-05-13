import clsx from 'clsx'
import numeral from 'numeral'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { useStore } from '../../../store/StoreContext'
import type { ApiListing } from '../../../store/types'
import styles from './ListingCard.module.css'

interface ListingCardProps {
  listing: ApiListing
  saved: boolean
  onToggleSave: (id: string) => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false)
  const navigate = useNavigate()
  const { state } = useStore()

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!state.user) {
      toast.error('Please sign in to save listings')
      navigate('/login')
      return
    }
    onToggleSave(listing.id)
  }

  const handleReadMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setShowFullDescription((prev) => !prev)
  }

  const imgUrl = listing.photos?.[0]?.optimizedUrl || listing.photos?.[0]?.url || 'https://via.placeholder.com/400'
  const price = listing.pricePerNight || 0
  const description = listing.description?.trim() || ''
  const words = description ? description.split(/\s+/).filter(Boolean) : []
  const hasLongDescription = words.length > 30
  const previewWordCount = 28
  const previewDescription = hasLongDescription ? words.slice(0, previewWordCount).join(' ') : description

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.media}>
          <img className={styles.image} src={imgUrl} alt={listing.title} />
          {price > 300 && <span className={styles.luxury}>Luxury</span>}
          <button
            type="button"
            className={clsx(styles.save, { [styles.saveActive]: saved })}
            onClick={handleSaveClick}
            aria-label={saved ? `Unsave ${listing.title}` : `Save ${listing.title}`}
          >
            {saved ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{listing.title}</h3>
            {listing.rating && (
              <span className={styles.rating}>
                <FaStar aria-hidden="true" /> {numeral(listing.rating).format('0.00')}
              </span>
            )}
          </div>

          <p className={styles.location}>
            <FaMapMarkerAlt aria-hidden="true" /> {listing.location}
          </p>

          {description && (
            <div className={styles.descriptionBlock}>
              <p className={styles.description}>
                {showFullDescription || !hasLongDescription ? description : `${previewDescription}...`}
              </p>
              {hasLongDescription && (
                <button
                  type="button"
                  className={styles.readMore}
                  onClick={handleReadMoreClick}
                >
                  {showFullDescription ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          )}

          <p className={styles.meta}>
            <strong>{numeral(price).format('$0')}</strong> / night
          </p>
        </div>
      </motion.article>
    </Link>
  )
}
