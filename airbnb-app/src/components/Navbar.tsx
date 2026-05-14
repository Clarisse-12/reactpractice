import { useMemo, useState } from "react";
import "./Navbar.css";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { FiHeart, FiPlus, FiX, FiUser, FiSun, FiMoon, FiShield } from "react-icons/fi";
import { auth } from '../services/api'
import { Transition } from "@headlessui/react";
import numeral from "numeral";
import { useStore } from "../store/StoreContext";
import { useFavorites } from "../features/listings/hooks/useFavorites";

export default function Navbar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { state, dispatch } = useStore();
  const { toggle } = useFavorites();
  const savedListings = state.listings.filter((listing) => state.saved.includes(listing.id));
  const isDark = !!state.darkMode
  const role = String(state.user?.role || 'guest').toLowerCase()

  const navItemsToShow = useMemo(() => {
    if (!state.user) {
      return [
        { to: '/', label: 'Home' },
        { to: '/listings', label: 'Listings' },
      ]
    }

    if (role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
      ]
    }

    if (role === 'guest') {
      return [
        { to: '/', label: 'Home' },
        { to: '/listings', label: 'Listings' },
        { to: '/guest/bookings', label: 'My Bookings' },
      ]
    }

    return [
      { to: '/listings', label: 'Listings' },
      { to: '/dashboard/overview', label: 'Dashboard' },
    ]
  }, [state.user, role])

  const userInitial = useMemo(() => {
    const source = String(state.user?.name || state.user?.username || 'U').trim()
    return source.charAt(0).toUpperCase() || 'U'
  }, [state.user?.name, state.user?.username])

  const profileAvatar = state.user?.avatar
  const profileName = state.user?.name || state.user?.username || 'Profile'
  const profileEmail = state.user?.email || 'example@gmail.com'

  return (
    <header className="navbar">
      <div className="navbar__brand" aria-label="ListOn home">
        <span className="navbar__brand-main">List</span>
        <span className="navbar__brand-accent">On.</span>
      </div>

      <nav className="navbar__menu" aria-label="Primary navigation">
        {navItemsToShow.map((item) => (
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
        {role !== 'admin' ? (
          <>
            <button 
              className="navbar__icon-button" 
              type="button" 
              aria-label="Favorites"
              onClick={() => setIsOpen(!isOpen)}
            >
              <FiHeart className="navbar__icon" />
              <span className="navbar__badge">{state.saved.length}</span>
            </button>
            <button className="navbar__icon-button" type="button" aria-label="Toggle dark mode" onClick={() => {
              const next = !isDark
              dispatch({ type: 'SET_DARKMODE', payload: next })
              localStorage.setItem('dark_mode', next ? '1' : '0')
              document.documentElement.classList.toggle('dark', next)
            }}>
              {isDark ? <FiSun className="navbar__icon" /> : <FiMoon className="navbar__icon" />}
            </button>
          </>
        ) : (
          <span className="navbar__admin-pill">Admin Access</span>
        )}

        {state.user ? (
          <div className="navbar__profile-menu">
            {role === 'admin' ? (
              <Link to="/profile" className="navbar__profile-card navbar__profile-card--guest" aria-label="Admin profile">
                <span className="navbar__profile-avatar navbar__profile-avatar--guest">
                  {profileAvatar ? (
                    <img src={profileAvatar} alt="Profile avatar" />
                  ) : (
                    <FiShield className="navbar__icon" />
                  )}
                </span>
                <span className="navbar__profile-copy">
                  <strong>{profileName}</strong>
                  <small>{profileEmail}</small>
                </span>
              </Link>
            ) : (
              <Link to="/profile" className="navbar__profile-card" aria-label="Profile">
                <span className="navbar__profile-avatar">
                  {profileAvatar ? <img src={profileAvatar} alt="Profile avatar" /> : <span>{userInitial}</span>}
                </span>
                <span className="navbar__profile-copy">
                  <strong>{profileName}</strong>
                  <small>{profileEmail}</small>
                </span>
              </Link>
            )}
            <button className="navbar__logout navbar__logout--pill" type="button" onClick={() => {
              auth.removeToken()
              dispatch({ type: 'LOGOUT' })
              navigate('/')
            }}>
              Logout
            </button>
          </div>
        ) : (
          <div className="navbar__profile-menu">
            <Link to="/login" className="navbar__profile-card navbar__profile-card--guest" aria-label="Sign in">
              <span className="navbar__profile-avatar navbar__profile-avatar--guest">
                <FiUser className="navbar__icon" />
              </span>
              <span className="navbar__profile-copy">
                <strong>Create account</strong>
                <small>explore</small>
              </span>
            </Link>
          </div>
        )}
        {role === 'host' ? (
          <Link className="navbar__cta" to="/dashboard/add-listing">
            <span className="navbar__cta-plus"><FiPlus aria-hidden="true" /></span>
            Add Listing
          </Link>
        ) : null}
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
        .navbar__admin-pill {
          display: inline-flex;
          align-items: center;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255, 90, 95, 0.12);
          color: #ff5a5f;
          font-weight: 700;
          letter-spacing: 0.04em;
        }
      `}</style>

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
          background: var(--surface-bg);
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
          border-bottom: 1px solid var(--surface-border);
        }

        .saved-listings-title {
          margin: 0;
          font-size: 1.25rem;
          color: var(--app-text);
        }

        .saved-listings-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .saved-listings-close:hover {
          color: var(--app-text);
        }

        .saved-listings-empty {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
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
          border: 1px solid var(--surface-border);
          border-radius: 12px;
        }

        .saved-listing-info {
          flex: 1;
          min-width: 0;
        }

        .saved-listing-title {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          color: var(--app-text);
          font-weight: 600;
        }

        .saved-listing-location {
          margin: 0 0 4px 0;
          font-size: 0.85rem;
          color: var(--text-muted);
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
