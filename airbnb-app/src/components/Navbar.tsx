import { useState } from "react";
import "./Navbar.css";
import { NavLink, Link } from "react-router-dom";
import { FiHeart, FiPlus, FiX, FiUser } from "react-icons/fi";
import { Transition } from "@headlessui/react";
import numeral from "numeral";
import { useStore } from "../store/StoreContext";
import { useFavorites } from "../features/listings/hooks/useFavorites";

const navItems = [
    {to: "/", label: "Home"},
    {to: "/listings", label: "Listings"}, 
    {to: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useStore();
  const { toggle } = useFavorites();
  const savedListings = state.listings.filter((listing) => state.saved.includes(listing.id));

  return (
    <header className="navbar">
      <div className="navbar__brand" aria-label="ListOn home">
        <span className="navbar__brand-main">List</span>
        <span className="navbar__brand-accent">On.</span>
      </div>

      <nav className="navbar__menu" aria-label="Primary navigation">
        {navItems.map((item) => (
            <NavLink 
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({isActive}) => (isActive ? " active" : "normal")}
            >
            {item.label}
            </NavLink>
        ))}
      </nav>

      <div className="navbar__actions">
        <button 
          className="navbar__icon-button" 
          type="button" 
          aria-label="Favorites"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FiHeart className="navbar__icon" />
          <span className="navbar__badge">{state.saved.length}</span>
        </button>
        <Link to="/signup" className="navbar__profile-button" aria-label="Profile">
          <FiUser className="navbar__icon" />
        </Link>
        <button className="navbar__cta" type="button">
          <span className="navbar__cta-plus"><FiPlus aria-hidden="true" /></span>
          Add Listing
        </button>
      </div>

      <Transition show={isOpen}>
        <div className="saved-listings-overlay" onClick={() => setIsOpen(false)}>
          <Transition.Child
            enter="transition ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <div className="saved-listings-panel" onClick={(e) => e.stopPropagation()}>
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
                        <p className="saved-listing-price">{numeral(listing.price).format('$0')} / night</p>
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
    </header>
  );
}
