import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiInbox, FiMessageSquare, FiSend, FiUser } from 'react-icons/fi'
import { useStore } from '../../store/StoreContext'
import { getThreadsForUser, sendMessage, type ConversationThread } from '../../services/messages'
import './MessagesPage.css'

export function MessagesPage() {
  const { state } = useStore()
  const navigate = useNavigate()
  const [threads, setThreads] = useState<ConversationThread[]>([])
  const [selectedThreadId, setSelectedThreadId] = useState('')
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const user = state.user
    if (!user) {
      navigate('/login')
      return
    }

    const role = String(user.role || '').toLowerCase()
    if (role !== 'host') {
      navigate('/dashboard/overview')
      return
    }

    const items = getThreadsForUser(user.id)
    setThreads(items)
    setSelectedThreadId(items[0]?.id || '')
  }, [navigate, state.user])

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.id === selectedThreadId) || null,
    [selectedThreadId, threads]
  )

  const refreshThreads = () => {
    const user = state.user
    if (!user) return
    const items = getThreadsForUser(user.id)
    setThreads(items)
    if (!selectedThreadId && items[0]) {
      setSelectedThreadId(items[0].id)
    }
  }

  const handleSend = (e: React.FormEvent) => {
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
        senderName: user.name || user.username || 'Host',
        text,
      })
      setDraft('')
      refreshThreads()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="messages-page">
      <header className="messages-page__hero">
        <div>
          <p className="messages-page__eyebrow">Host inbox</p>
          <h1>Messages</h1>
          <p>Reply to guests who asked about your listings.</p>
        </div>
        <div className="messages-page__hero-badge">
          <FiInbox /> {threads.length} conversation{threads.length === 1 ? '' : 's'}
        </div>
      </header>

      <div className="messages-page__layout">
        <aside className="messages-page__sidebar">
          {threads.length === 0 ? (
            <div className="messages-page__empty-sidebar">
              <FiMessageSquare />
              <p>No guest messages yet.</p>
            </div>
          ) : (
            threads.map((thread) => {
              const preview = thread.messages[thread.messages.length - 1]?.text || 'No messages yet'
              return (
                <button
                  key={thread.id}
                  type="button"
                  className={`messages-page__thread ${selectedThreadId === thread.id ? 'is-active' : ''}`}
                  onClick={() => setSelectedThreadId(thread.id)}
                >
                  <div className="messages-page__thread-head">
                    <strong>{thread.guestName}</strong>
                    <span>{thread.listingTitle}</span>
                  </div>
                  <p>{preview}</p>
                </button>
              )
            })
          )}
        </aside>

        <section className="messages-page__conversation">
          {!selectedThread ? (
            <div className="messages-page__empty-conversation">
              <FiMessageSquare />
              <h2>Select a conversation</h2>
              <p>Pick a guest thread from the left to read and reply.</p>
            </div>
          ) : (
            <>
              <div className="messages-page__conversation-head">
                <div>
                  <p className="messages-page__conversation-kicker">{selectedThread.listingTitle}</p>
                  <h2>Chat with {selectedThread.guestName}</h2>
                </div>
                <span className="messages-page__conversation-meta">
                  <FiUser /> Guest inquiry
                </span>
              </div>

              <div className="messages-page__messages">
                {selectedThread.messages.map((message) => {
                  const isHost = message.senderId === state.user?.id
                  return (
                    <div key={message.id} className={`messages-page__message ${isHost ? 'is-host' : 'is-guest'}`}>
                      <div className="messages-page__message-bubble">
                        <p>{message.text}</p>
                        <small>{message.senderName} · {new Date(message.createdAt).toLocaleString()}</small>
                      </div>
                    </div>
                  )
                })}
              </div>

              <form className="messages-page__composer" onSubmit={handleSend}>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write your reply to the guest..."
                  rows={4}
                />
                <button type="submit" disabled={sending || !draft.trim()}>
                  <FiSend /> {sending ? 'Sending...' : 'Send Reply'}
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
