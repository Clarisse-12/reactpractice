import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiPlus, FiTrash2, FiMapPin, FiHome, FiDollarSign, FiUploadCloud, FiX } from 'react-icons/fi';
import { deleteListing, deleteListingPhoto, me, updateListing, uploadListingPhotos } from '../../services/api';
import './MyListingsPage.css';
import ConfirmModal from '../../components/ConfirmModal';

interface Photo { id: string; url: string; publicId?: string; optimizedUrl?: string }
interface Listing {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  pricePerNight?: number;
  guests?: number;
  type?: string;
  amenities?: string[];
  photos?: Photo[];
}

export function MyListingsPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [form, setForm] = useState({ title: '', description: '', location: '', pricePerNight: '', guests: '', type: 'APARTMENT', amenities: '' });
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    me().then((user) => {
      setListings(Array.isArray(user?.listings) ? user.listings : []);
    }).catch((err: any) => setError(err?.message || 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    total: listings.length,
    apartments: listings.filter((l) => String(l.type).toUpperCase() === 'APARTMENT').length,
    villas: listings.filter((l) => String(l.type).toUpperCase() === 'VILLA').length,
    houses: listings.filter((l) => String(l.type).toUpperCase() === 'HOUSE').length,
    cabins: listings.filter((l) => String(l.type).toUpperCase() === 'CABIN').length,
  }), [listings]);

  const openEditor = (listing: Listing) => {
    setEditingListing(listing);
    setForm({
      title: listing.title || '',
      description: listing.description || '',
      location: listing.location || '',
      pricePerNight: String(listing.pricePerNight || ''),
      guests: String(listing.guests || ''),
      amenities: Array.isArray(listing.photos) ? '' : '',
      type: listing.type || 'APARTMENT',
    });
    setPhotos(listing.photos || []);
    setNewFiles([]);
    setNewPreviews([]);
  };

  const [generating, setGenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = 5 - photos.length - newFiles.length;
    const toAdd = files.slice(0, remaining);
    setNewFiles((prev) => [...prev, ...toAdd]);
    toAdd.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews((prev) => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!editingListing) return;
    setDeletingPhotoId(photoId);
    try {
      await deleteListingPhoto(editingListing.id, photoId);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      setListings((prev) => prev.map((l) =>
        l.id === editingListing.id ? { ...l, photos: (l.photos || []).filter((p) => p.id !== photoId) } : l
      ));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete photo');
    } finally {
      setDeletingPhotoId(null);
    }
  };

  const handleSave = async () => {
    if (!editingListing) return;
    setSaving(true);
    try {
      const updated = await updateListing(editingListing.id, {
        title: form.title,
        description: form.description,
        location: form.location,
        pricePerNight: Number(form.pricePerNight),
        guests: Number(form.guests),
        type: form.type,
      });

      let updatedPhotos = photos;
      if (newFiles.length > 0) {
        const res = await uploadListingPhotos(editingListing.id, newFiles);
        updatedPhotos = res?.photos || photos;
      }

      setListings((prev) => prev.map((l) =>
        l.id === editingListing.id ? { ...l, ...updated, photos: updatedPhotos } : l
      ));
      setEditingListing(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmLoading(true);
    try {
      await deleteListing(pendingDeleteId);
      setListings((prev) => prev.filter((l) => l.id !== pendingDeleteId));
      setConfirmOpen(false);
      setPendingDeleteId(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete listing');
    } finally {
      setConfirmLoading(false);
    }
  };

  const totalPhotoSlots = photos.length + newFiles.length;

  const getDescriptionPreview = (description?: string) => {
    const text = description?.trim() || '';
    if (!text) return { preview: '', hasMore: false };

    const words = text.split(/\s+/).filter(Boolean);
    const hasMore = words.length > 20;
    return {
      preview: hasMore ? words.slice(0, 20).join(' ') : text,
      hasMore,
    };
  };

  const toggleDescription = (listingId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [listingId]: !prev[listingId],
    }));
  };

  return (
    <div className="my-listings-page">
      <header className="my-listings-hero">
        <div>
          <p className="my-listings-eyebrow">Host Listings</p>
          <h1>All your listings in one place</h1>
          <p>Quickly edit, delete, and manage every home you host.</p>
        </div>
        <button className="my-listings-add-btn" type="button" onClick={() => navigate('/dashboard/add-listing')}>
          <FiPlus /> Add Listing
        </button>
      </header>

      <section className="my-listings-stats">
        {[['Total Listings', stats.total], ['Apartments', stats.apartments], ['Houses', stats.houses], ['Villas', stats.villas], ['Cabins', stats.cabins]].map(([label, val]) => (
          <article key={label} className="my-listings-stat-card">
            <span>{label}</span>
            <strong>{val}</strong>
          </article>
        ))}
      </section>

      {loading && <div className="my-listings-state">Loading listings...</div>}
      {error && <div className="my-listings-state my-listings-state--error">{error}</div>}

      {!loading && !error && listings.length === 0 && (
        <div className="my-listings-empty">
          <h2>No listings yet</h2>
          <p>Add your first property and start hosting.</p>
          <button type="button" onClick={() => navigate('/dashboard/add-listing')}>Add Listing</button>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <section className="my-listings-grid">
          {listings.map((listing) => (
            <article key={listing.id} className="listing-card-cute">
              <div className="listing-card-cute__imageWrap">
                <img
                  src={listing.photos?.[0]?.optimizedUrl || listing.photos?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80'}
                  alt={listing.title || 'Listing'}
                  className="listing-card-cute__image"
                />
                <span className="listing-card-cute__badge">{listing.type || 'Home'}</span>
                {listing.photos && listing.photos.length > 1 && (
                  <span className="listing-card-cute__photo-count">{listing.photos.length} photos</span>
                )}
              </div>
              <div className="listing-card-cute__content">
                <h3>{listing.title || 'Untitled Listing'}</h3>
                <div className="listing-card-cute__description-wrap">
                  <p className="listing-card-cute__description">
                    {(() => {
                      const { preview, hasMore } = getDescriptionPreview(listing.description);
                      const isExpanded = !!expandedDescriptions[listing.id];

                      if (!listing.description) return 'No description provided.';
                      if (!hasMore || isExpanded) return listing.description;
                      return `${preview}...`;
                    })()}
                  </p>
                  {getDescriptionPreview(listing.description).hasMore && (
                    <button
                      type="button"
                      className="listing-card-cute__read-more"
                      onClick={() => toggleDescription(listing.id)}
                    >
                      {expandedDescriptions[listing.id] ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
                <div className="listing-card-cute__meta">
                  <span><FiMapPin /> {listing.location || 'Unknown'}</span>
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
      )}

      {/* Edit Modal */}
      {editingListing && (
        <div className="mle-overlay" onClick={() => setEditingListing(null)}>
          <div className="mle-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mle-modal__header">
              <h2>Edit Listing</h2>
              <button type="button" className="mle-modal__close" onClick={() => setEditingListing(null)}><FiX /></button>
            </div>

            <div className="mle-modal__body">
              {/* Form fields */}
              <div className="mle-grid">
                <label className="mle-field">
                  <span>Title</span>
                  <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </label>
                <label className="mle-field">
                  <span>Type</span>
                  <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                    <option value="APARTMENT">Apartment</option>
                    <option value="HOUSE">House</option>
                    <option value="VILLA">Villa</option>
                    <option value="CABIN">Cabin</option>
                  </select>
                </label>
                <label className="mle-field">
                  <span>Location</span>
                  <input value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                </label>
                <label className="mle-field">
                  <span>Price / night ($)</span>
                  <input type="number" value={form.pricePerNight} onChange={(e) => setForm((p) => ({ ...p, pricePerNight: e.target.value }))} />
                </label>
                <label className="mle-field">
                  <span>Max Guests</span>
                  <input type="number" value={form.guests} onChange={(e) => setForm((p) => ({ ...p, guests: e.target.value }))} />
                </label>
                <label className="mle-field">
                  <span>Amenities (comma separated)</span>
                  <input value={form.amenities} onChange={(e) => setForm((p) => ({ ...p, amenities: e.target.value }))} placeholder="WiFi, Kitchen, Parking" />
                </label>
                <label className="mle-field mle-field--full">
                  <span>Description</span>
                  <textarea rows={4} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      className="mle-btn mle-btn--secondary"
                      onClick={async () => {
                        try {
                          setGenerating(true);
                          const payload = {
                            title: form.title,
                            location: form.location,
                            type: form.type,
                            guests: Number(form.guests) || 1,
                            amenities: form.amenities ? form.amenities.split(",").map(s => s.trim()) : [],
                            price: Number(form.pricePerNight) || 0,
                          };
                          const res = await (await import('../../services/api')).generateDescription(payload);
                          if (res?.description) setForm((p) => ({ ...p, description: res.description }));
                        } catch (err: any) {
                          alert(err?.message || 'Failed to generate description');
                        } finally {
                          setGenerating(false);
                        }
                      }}
                      disabled={generating}
                    >
                      {generating ? 'Generating...' : 'Generate description'}
                    </button>
                  </div>
                </label>
              </div>

              {/* Photos section */}
              <div className="mle-photos">
                <div className="mle-photos__header">
                  <p className="mle-photos__label">Photos <span>({totalPhotoSlots}/5)</span></p>
                  {totalPhotoSlots < 5 && (
                    <button type="button" className="mle-photos__add-btn" onClick={() => fileInputRef.current?.click()}>
                      <FiUploadCloud /> Add Photos
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>

                <div className="mle-photos__grid">
                  {/* Existing photos */}
                  {photos.map((photo) => (
                    <div key={photo.id} className="mle-photo-item">
                      <img src={photo.url} alt="Listing photo" />
                      <button
                        type="button"
                        className="mle-photo-item__delete"
                        onClick={() => handleDeletePhoto(photo.id)}
                        disabled={deletingPhotoId === photo.id}
                        aria-label="Delete photo"
                      >
                        {deletingPhotoId === photo.id ? '...' : <FiTrash2 />}
                      </button>
                    </div>
                  ))}

                  {/* New photo previews */}
                  {newPreviews.map((src, i) => (
                    <div key={`new-${i}`} className="mle-photo-item mle-photo-item--new">
                      <img src={src} alt={`New photo ${i + 1}`} />
                      <button type="button" className="mle-photo-item__delete" onClick={() => removeNewFile(i)} aria-label="Remove photo">
                        <FiX />
                      </button>
                      <span className="mle-photo-item__new-badge">New</span>
                    </div>
                  ))}

                  {/* Empty slot prompt */}
                  {totalPhotoSlots === 0 && (
                    <div className="mle-photos__empty" onClick={() => fileInputRef.current?.click()}>
                      <FiUploadCloud />
                      <span>Click to add photos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mle-modal__footer">
              <button type="button" className="mle-btn mle-btn--cancel" onClick={() => setEditingListing(null)}>Cancel</button>
              <button type="button" className="mle-btn mle-btn--save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmOpen}
        title="Delete listing?"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete listing"
        confirmTone="danger"
        loading={confirmLoading}
        onConfirm={confirmDelete}
        onCancel={closeConfirm}
      />
    </div>
  );
}
