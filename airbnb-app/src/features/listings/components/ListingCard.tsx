import clsx from 'clsx'
import { format } from 'date-fns'
import numeral from 'numeral'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt } from 'react-icons/fa'
import type { Listing } from '../types'
import styles from './ListingCard.module.css'

interface ListingCardProps {
  listing: Listing
  saved: boolean
  onToggleSave: (id: number) => void
}

export function ListingCard({ listing, saved, onToggleSave }: ListingCardProps) {
  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggleSave(listing.id)
  }

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.media}>
          <img className={styles.image} src={listing.img} alt={listing.title} />

          {listing.superhost && <span className={styles.badge}>Superhost</span>}
          {listing.price > 300 && <span className={styles.luxury}>Luxury</span>}

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
            <span className={styles.rating}>
              <FaStar aria-hidden="true" /> {numeral(listing.rating).format('0.00')}
            </span>
          </div>

          <p className={styles.location}>
            <FaMapMarkerAlt aria-hidden="true" /> {listing.location}
          </p>

          <p className={styles.meta}>
            <strong>{numeral(listing.price).format('$0')}</strong> / night
          </p>

          <p className={clsx(styles.availability, { [styles.availabilityBooked]: !listing.available })}>
            {listing.available ? `Available from ${format(new Date(listing.availableFrom), 'MMM dd, yyyy')}` : 'Booked'}
          </p>
        </div>
      </motion.article>
    </Link>
  )
}
