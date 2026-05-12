import { useMemo, useState } from 'react'
import { useStore } from '../../../store/StoreContext'
import { useListings } from '../hooks/useListings'
import { useFavorites } from '../hooks/useFavorites'
import { ListingCard } from '../components/ListingCard'
import { SearchBar } from '../components/SearchBar'
import { Spinner } from '../../../shared/components/Spinner'

export default function ListingsPage() {
  const { state } = useStore()
  const { toggle } = useFavorites()
  useListings()

  const [savedOnly, setSavedOnly] = useState(false)

  const filteredListings = useMemo(() => {
    const normalizedFilter = state.filter.trim().toLowerCase()
    return state.listings
      .filter((listing) => {
        if (!normalizedFilter) return true
        return `${listing.title} ${listing.location}`.toLowerCase().includes(normalizedFilter)
      })
      .filter((listing) => !savedOnly || state.saved.includes(listing.id))
  }, [state.filter, state.listings, savedOnly, state.saved])

  if (state.loading) return <Spinner />

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
        <label className="listing-page__filter">
          <input type="checkbox" checked={savedOnly} onChange={(e) => setSavedOnly(e.target.checked)} />
          Saved only
        </label>
      </div>

      <div className="listing-page__toolbar">
        <p className="listing-page__count">
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
    </section>
  )
}
