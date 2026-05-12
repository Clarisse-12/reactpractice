import { useState } from 'react'
import { Transition } from '@headlessui/react'
import numeral from 'numeral'
import { FiX } from 'react-icons/fi'
import { useStore } from '../../../store/StoreContext'
import { useFavorites } from '../hooks/useFavorites'

export function SavedListings() {
  const [isOpen, setIsOpen] = useState(false)
  const { state } = useStore()
  const { toggle } = useFavorites()
  const savedListings = state.listings.filter((listing) => state.saved.includes(listing.id))

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="saved-listings-trigger"
        aria-label={`Open saved listings (${state.saved.length})`}
      >
        Saved ({state.saved.length})
      </button>

      <Transition show={isOpen}>
        <div className="saved-listings-overlay">
          <Transition.Child
            enter="transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="saved-listings-panel">
              <div className="saved-listings-header">
                <h2 className="saved-listings-title">Saved Listings ({state.saved.length})</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="saved-listings-close"
                  aria-label="Close saved listings"
                >
                  <FiX size={24} />
                </button>
              </div>

              {savedListings.length === 0 ? (
                <p className="saved-listings-empty">No saved listings yet</p>
              ) : (
                <div className="saved-listings-list">
                  {savedListings.map((listing) => (
                    <div key={listing.id} className="saved-listing-item">
                      <div className="saved-listing-info">
                        <h3 className="saved-listing-title">{listing.title}</h3>
                        <p className="saved-listing-location">{listing.location}</p>
                        <p className="saved-listing-price">{numeral(listing.pricePerNight).format('$0')} / night</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggle(listing.id, listing.title)}
                        className="saved-listing-remove"
                        aria-label={`Remove ${listing.title}`}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Transition>

      <style>{`
        .saved-listings-trigger {
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: #fff;
          color: #111827;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .saved-listings-trigger:hover {
          border-color: #9ca3af;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .saved-listings-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.3);
          z-index: 40;
        }

        .saved-listings-panel {
          position: fixed;
          top: 0;
          right: 0;
          height: 100vh;
          width: 400px;
          max-width: 100%;
          background: #fff;
          box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          z-index: 50;
        }

        .saved-listings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }

        .saved-listings-title {
          margin: 0;
          font-size: 1.25rem;
          color: #111827;
        }

        .saved-listings-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .saved-listings-close:hover {
          color: #111827;
        }

        .saved-listings-empty {
          padding: 20px;
          text-align: center;
          color: #6b7280;
        }

        .saved-listings-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: grid;
          gap: 16px;
        }

        .saved-listing-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
        }

        .saved-listing-info {
          flex: 1;
          min-width: 0;
        }

        .saved-listing-title {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          color: #111827;
          font-weight: 600;
        }

        .saved-listing-location {
          margin: 0 0 4px 0;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .saved-listing-price {
          margin: 0;
          font-size: 0.9rem;
          color: #ff5a3c;
          font-weight: 600;
        }

        .saved-listing-remove {
          padding: 6px 12px;
          border: 1px solid #ff5a3c;
          border-radius: 6px;
          background: transparent;
          color: #ff5a3c;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.85rem;
          transition: all 0.2s ease;
        }

        .saved-listing-remove:hover {
          background: #ff5a3c;
          color: #fff;
        }

        @media (max-width: 768px) {
          .saved-listings-panel {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
