import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiInbox, FiMessageSquare, FiSend, FiCalendar } from 'react-icons/fi'
import { useStore } from '../store/StoreContext'
import { getThreadsForUser, sendMessage, type ConversationThread } from '../services/messages'
import './GuestDashboard.css'

type GuestThread = ConversationThread

export default function GuestMessagesPage() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [threads, setThreads] = useState<GuestThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!state.user) {
      navigate('/login')
      return
    }

    const items = getThreadsForUser(state.user.id)
    setThreads(items)
    setSelectedThreadId((current) => current || items[0]?.id || '')
  }, [state.user, navigate])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  )

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const user = state.user
    if (!user || !selectedThread) return

    const text = draft.trim()
    if (!text) return

    setSending(true)
    try {
      sendMessage({
        listingId: selectedThread.listingId,
        listingTitle: selectedThread.listingTitle,
        hostId: selectedThread.hostId,
        hostName: selectedThread.hostName,
        guestId: selectedThread.guestId,
        guestName: selectedThread.guestName,
        senderId: user.id,
        senderName: user.name || user.username || 'Guest',
        text,
      })
      setDraft('')
      const items = getThreadsForUser(user.id)
      setThreads(items)
      setSelectedThreadId((current) => current || items[0]?.id || '')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="guest-db guest-db--messages-page">
      <main className="guest-db__main">
        <div className="guest-db__hero">
          <div className="guest-db__hero-main">
            <div>
              <p className="guest-db__hero-eyebrow">Guest Dashboard</p>
              <h1 className="guest-db__hero-title">Messages</h1>
              <p className="guest-db__hero-sub">
                Continue your conversations with hosts from your bookings.
              </p>
            </div>
          </div>
        </div>

        <div className="guest-db__dashboard-layout">
          <section className="guest-db__messages-section guest-db__content">
            <div className="guest-db__messages-header">
              <div>
                <p className="guest-db__messages-eyebrow">Messages</p>
                <h2>Continue chatting with hosts</h2>
              </div>
              <div className="guest-db__messages-count">
                <FiInbox /> {threads.length} conversation{threads.length === 1 ? '' : 's'}
              </div>
            </div>

            <div className="guest-db__messages-layout">
              <aside className="guest-db__messages-sidebar">
                {threads.length === 0 ? (
                  <div className="guest-db__messages-empty">
                    <FiMessageSquare />
                    <p>No conversations yet. Open a listing and message the host first.</p>
                  </div>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      type="button"
                      className={`guest-db__thread ${selectedThreadId === thread.id ? 'is-active' : ''}`}
                      onClick={() => setSelectedThreadId(thread.id)}
                    >
                      <strong>{thread.hostName}</strong>
                      <span>{thread.listingTitle}</span>
                      <p>{thread.messages[thread.messages.length - 1]?.text || 'No messages yet'}</p>
                    </button>
                  ))
                )}
              </aside>

              <div className="guest-db__messages-panel">
                {!selectedThread ? (
                  <div className="guest-db__messages-empty-convo">
                    <FiMessageSquare />
                    <h3>Select a conversation</h3>
                    <p>Pick a host thread to read and reply here.</p>
                  </div>
                ) : (
                  <>
                    <div className="guest-db__messages-thread-head">
                      <div>
                        <p>{selectedThread.listingTitle}</p>
                        <h3>Chat with {selectedThread.hostName}</h3>
                      </div>
                      <button
                        type="button"
                        className="guest-db__messages-open-listing"
                        onClick={() => navigate(`/listings/${selectedThread.listingId}`)}
                      >
                        Open listing
                      </button>
                    </div>

                    <div className="guest-db__messages-list">
                      {selectedThread.messages.map((message) => {
                        const isMine = message.senderId === state.user?.id
                        return (
                          <div key={message.id} className={`guest-db__message ${isMine ? 'is-me' : 'is-host'}`}>
                            <div className="guest-db__message-bubble">
                              <p>{message.text}</p>
                              <small>{message.senderName} · {new Date(message.createdAt).toLocaleString()}</small>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <form className="guest-db__composer" onSubmit={handleSendMessage}>
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Write a message to the host..."
                        rows={3}
                      />
                      <button type="submit" disabled={sending || !draft.trim()}>
                        <FiSend /> {sending ? 'Sending...' : 'Send Message'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </section>

          <aside className="guest-db__side-nav">
            <div className="guest-db__side-header">
              <h2>Guest Dashboard</h2>
            </div>
            <nav className="guest-db__side-nav-list" aria-label="Guest dashboard navigation">
              <Link to="/guest/bookings" className="guest-db__side-link">
                <FiCalendar /> Bookings
              </Link>
              <button type="button" className="guest-db__side-link is-active">
                <FiMessageSquare /> Messages
              </button>
            </nav>
          </aside>
        </div>
      </main>
    </div>
  )
}
