import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiPlus, FiTrash2, FiMapPin, FiHome, FiDollarSign } from 'react-icons/fi';
import { deleteListing, me, updateListing } from '../../services/api';
import './MyListingsPage.css';

interface Listing {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  pricePerNight?: number;
  guests?: number;
  type?: string;
  photos?: Array<{ url?: string }>;
}

interface ListingFormState {
  title: string;
  description: string;
  location: string;
  pricePerNight: string;
  guests: string;
  type: string;
}

export function MyListingsPage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);
  const [form, setForm] = useState<ListingFormState>({
    title: '',
    description: '',
    location: '',
    pricePerNight: '',
    guests: '',
    type: 'APARTMENT',
  });

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const user = await me();
        const userListings = Array.isArray(user?.listings) ? user.listings : [];
        setListings(userListings);
      } catch (err: any) {
        setError(err?.message || 'Failed to load listings');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, []);

  const stats = useMemo(
    () => ({
      total: listings.length,
      apartments: listings.filter((listing) => String(listing.type).toUpperCase() === 'APARTMENT').length,
      villas: listings.filter((listing) => String(listing.type).toUpperCase() === 'VILLA').length,
      houses: listings.filter((listing) => String(listing.type).toUpperCase() === 'HOUSE').length,
    }),
    [listings]
  );

  const openEditor = (listing: Listing) => {
    setEditingListingId(listing.id);
    setForm({
      title: listing.title || '',
      description: listing.description || '',
      location: listing.location || '',
      pricePerNight: String(listing.pricePerNight || ''),
      guests: String(listing.guests || ''),
      type: listing.type || 'APARTMENT',
    });
  };

  const handleSave = async () => {
    if (!editingListingId) return;

    try {
      const updated = await updateListing(editingListingId, {
        title: form.title,
        description: form.description,
        location: form.location,
        pricePerNight: Number(form.pricePerNight),
        guests: Number(form.guests),
        type: form.type,
      });

      setListings((prev) => prev.map((listing) => (listing.id === editingListingId ? { ...listing, ...updated } : listing)));
      setEditingListingId(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update listing');
    }
  };

  const handleDelete = async (listingId: string) => {
    const confirmDelete = window.confirm('Delete this listing?');
    if (!confirmDelete) return;

    try {
      await deleteListing(listingId);
      setListings((prev) => prev.filter((listing) => listing.id !== listingId));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete listing');
    }
  };

  return (
    <div className="my-listings-page">
      <header className="my-listings-hero">
        <div>
          <p className="my-listings-eyebrow">Host Listings</p>
          <h1>All your listings in one cute place</h1>
          <p>Quickly edit, delete, and manage every home you host.</p>
        </div>
        <button className="my-listings-add-btn" type="button" onClick={() => navigate('/dashboard/add-listing')}>
          <FiPlus /> Add Listing
        </button>
      </header>

      <section className="my-listings-stats">
        <article className="my-listings-stat-card">
          <span>Total Listings</span>
          <strong>{stats.total}</strong>
        </article>
        <article className="my-listings-stat-card">
          <span>Apartments</span>
          <strong>{stats.apartments}</strong>
        </article>
        <article className="my-listings-stat-card">
          <span>Houses</span>
          <strong>{stats.houses}</strong>
        </article>
        <article className="my-listings-stat-card">
          <span>Villas</span>
          <strong>{stats.villas}</strong>
        </article>
      </section>

      {loading ? <div className="my-listings-state">Loading listings...</div> : null}
      {error ? <div className="my-listings-state my-listings-state--error">{error}</div> : null}

      {!loading && !error && listings.length === 0 ? (
        <div className="my-listings-empty">
          <h2>No listings yet</h2>
          <p>Add your first property and start hosting.</p>
          <button type="button" onClick={() => navigate('/dashboard/add-listing')}>
            Add Listing
          </button>
        </div>
      ) : null}

      {!loading && !error && listings.length > 0 ? (
        <section className="my-listings-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="listing-card-cute">
              <div className="listing-card-cute__imageWrap">
                <img
                  src={listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'}
                  alt={listing.title || 'Listing'}
                  className="listing-card-cute__image"
                />
                <span className="listing-card-cute__badge">{listing.type || 'Home'}</span>
              </div>

              <div className="listing-card-cute__content">
                <h3>{listing.title || 'Untitled Listing'}</h3>
                <p className="listing-card-cute__description">{listing.description || 'No description provided.'}</p>

                <div className="listing-card-cute__meta">
                  <span><FiMapPin /> {listing.location || 'Unknown location'}</span>
                  <span><FiHome /> {listing.guests || 1} guests</span>
                  <span><FiDollarSign /> ${listing.pricePerNight || 0}/night</span>
                </div>

                <div className="listing-card-cute__actions">
                  <button type="button" className="listing-card-cute__btn listing-card-cute__btn--edit" onClick={() => openEditor(listing)}>
                    <FiEdit3 /> Edit
                  </button>
                  <button type="button" className="listing-card-cute__btn listing-card-cute__btn--delete" onClick={() => handleDelete(listing.id)}>
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {editingListingId ? (
        <section className="my-listings-editor">
          <div className="my-listings-editor__header">
            <h2>Edit Listing</h2>
            <button type="button" className="my-listings-editor__close" onClick={() => setEditingListingId(null)}>
              Close
            </button>
          </div>

          <div className="my-listings-editor__grid">
            <label>
              <span>Title</span>
              <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </label>
            <label>
              <span>Location</span>
              <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} />
            </label>
            <label>
              <span>Price per night</span>
              <input value={form.pricePerNight} onChange={(e) => setForm((prev) => ({ ...prev, pricePerNight: e.target.value }))} />
            </label>
            <label>
              <span>Guests</span>
              <input value={form.guests} onChange={(e) => setForm((prev) => ({ ...prev, guests: e.target.value }))} />
            </label>
            <label>
              <span>Type</span>
              <select value={form.type} onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}>
                <option value="APARTMENT">APARTMENT</option>
                <option value="HOUSE">HOUSE</option>
                <option value="VILLA">VILLA</option>
                <option value="CABIN">CABIN</option>
              </select>
            </label>
            <label className="my-listings-editor__full">
              <span>Description</span>
              <textarea rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </label>
          </div>

          <div className="my-listings-editor__actions">
            <button type="button" className="my-listings-editor__save" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
