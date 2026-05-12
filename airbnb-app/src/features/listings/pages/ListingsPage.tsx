import { useMemo, useState, useEffect } from 'react'
import { useStore } from '../../../store/StoreContext'
import { useListings } from '../hooks/useListings'
import { useFavorites } from '../hooks/useFavorites'
import { ListingCard } from '../components/ListingCard'
import { SearchBar } from '../components/SearchBar'
import { Spinner } from '../../../shared/components/Spinner'
import { FiHeart, FiX, FiSliders } from 'react-icons/fi'

const TYPES = ['APARTMENT', 'HOUSE', 'VILLA', 'CABIN']

export default function ListingsPage() {
  const { state } = useStore()
  const { toggle } = useFavorites()

  const [savedOnly, setSavedOnly] = useState(false)
  const [selectedType, setSelectedType] = useState('')
  const [location, setLocation] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Debounced values sent to API
  const [debouncedLocation, setDebouncedLocation] = useState('')
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedLocation(location), 500)
    return () => clearTimeout(t)
  }, [location])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedMaxPrice(maxPrice), 500)
    return () => clearTimeout(t)
  }, [maxPrice])

  // Pass type, maxPrice, location to API — re-fetches when they change
  useListings({ type: selectedType, maxPrice: debouncedMaxPrice, location: debouncedLocation })

  const activeFilterCount = [savedOnly, !!selectedType, !!location, !!maxPrice].filter(Boolean).length

  const clearAll = () => {
    setSavedOnly(false)
    setSelectedType('')
    setLocation('')
    setMaxPrice('')
    setDebouncedLocation('')
    setDebouncedMaxPrice('')
  }

  // Only savedOnly and search text are filtered on the frontend
  const filteredListings = useMemo(() => {
    const normalizedFilter = state.filter.trim().toLowerCase()
    return state.listings
      .filter((l) => {
        if (!normalizedFilter) return true
        return `${l.title} ${l.location}`.toLowerCase().includes(normalizedFilter)
      })
      .filter((l) => !savedOnly || state.saved.includes(l.id))
  }, [state.filter, state.listings, savedOnly, state.saved])

  if (state.loading) return <Spinner />

  const sidebar = (
    <aside className="lp-sidebar">
      <div className="lp-sidebar__header">
        <span className="lp-sidebar__title"><FiSliders /> Filters</span>
        {activeFilterCount > 0 && (
          <button className="lp-sidebar__clear" onClick={clearAll} type="button">
            Clear all
          </button>
        )}
      </div>

      {/* Saved only */}
      <div className="lp-sidebar__section">
        <button
          type="button"
          className={`lp-sidebar__saved-btn ${savedOnly ? 'active' : ''}`}
          onClick={() => setSavedOnly((v) => !v)}
        >
          <FiHeart /> Saved only
          {savedOnly && <span className="lp-sidebar__saved-count">{state.saved.length}</span>}
        </button>
      </div>

      {/* Type */}
      <div className="lp-sidebar__section">
        <p className="lp-sidebar__label">Property Type</p>
        <div className="lp-sidebar__types">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`lp-sidebar__type-chip ${selectedType === t ? 'active' : ''}`}
              onClick={() => setSelectedType((v) => (v === t ? '' : t))}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="lp-sidebar__section">
        <p className="lp-sidebar__label">Location</p>
        <div className="lp-sidebar__input-wrap">
          <input
            className="lp-sidebar__input"
            type="text"
            placeholder="e.g. Nairobi"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {location && (
            <button className="lp-sidebar__input-clear" onClick={() => setLocation('')} type="button">
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* Max Price */}
      <div className="lp-sidebar__section">
        <p className="lp-sidebar__label">Max Price / night</p>
        <div className="lp-sidebar__input-wrap">
          <span className="lp-sidebar__input-prefix">$</span>
          <input
            className="lp-sidebar__input lp-sidebar__input--price"
            type="number"
            min="0"
            placeholder="e.g. 300"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
          {maxPrice && (
            <button className="lp-sidebar__input-clear" onClick={() => setMaxPrice('')} type="button">
              <FiX />
            </button>
          )}
        </div>
        {maxPrice && <p className="lp-sidebar__price-hint">Up to ${maxPrice} / night</p>}
      </div>
    </aside>
  )

  return (
    <section className="listing-page" aria-label="Listings page">
      <div className="listing-page__hero">
        <div className="listing-page__hero-text">
          <p className="listing-page__eyebrow">Airbnb-style stays</p>
          <h1 className="listing-page__title">Find your next place to stay</h1>
          <p className="listing-page__subtitle">
            Search from a handpicked set of apartments and hotels, then save the ones you like.
          </p>
        </div>
        <div className="listing-page__hero-search">
          <SearchBar />
        </div>
      </div>

      <div className="listing-page__body">
        {/* Mobile filter toggle */}
        <div className="lp-mobile-bar">
          <button
            type="button"
            className="lp-mobile-bar__btn"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            <FiSliders />
            Filters
            {activeFilterCount > 0 && <span className="lp-mobile-bar__badge">{activeFilterCount}</span>}
          </button>
          <p className="listing-page__count">
            {filteredListings.length} result{filteredListings.length === 1 ? '' : 's'}
          </p>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lp-sidebar-overlay" onClick={() => setSidebarOpen(false)}>
            <div className="lp-sidebar-drawer" onClick={(e) => e.stopPropagation()}>
              <button className="lp-sidebar-drawer__close" onClick={() => setSidebarOpen(false)} type="button">
                <FiX />
              </button>
              {sidebar}
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="lp-sidebar-desktop">{sidebar}</div>

        {/* Listings */}
        <div className="listing-page__content">
          <div className="listing-page__toolbar">
            <p className="listing-page__count listing-page__count--desktop">
              {filteredListings.length} result{filteredListings.length === 1 ? '' : 's'}
            </p>
          </div>

          {filteredListings.length === 0 ? (
            <p className="listing-page__empty">No listings match your filters.</p>
          ) : (
            <div className="listing-grid">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  saved={state.saved.includes(listing.id)}
                  onToggleSave={() => toggle(listing.id, listing.title)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
