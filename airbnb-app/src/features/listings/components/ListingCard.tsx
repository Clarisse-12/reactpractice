import clsx from 'clsx'
import numeral from 'numeral'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import type { ApiListing } from '../../../store/types'
import styles from './ListingCard.module.css'

interface ListingCardProps {
  listing: ApiListing
  saved: boolean
  onToggleSave: (id: string) => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSave(listing.id)
  }

  const imgUrl = listing.photos?.[0]?.optimizedUrl || listing.photos?.[0]?.url || 'https://via.placeholder.com/400'
  const price = listing.pricePerNight || 0

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

          <p className={styles.meta}>
            <strong>{numeral(price).format('$0')}</strong> / night
          </p>
        </div>
      </motion.article>
    </Link>
  )
}
