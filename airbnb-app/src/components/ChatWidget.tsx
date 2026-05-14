import React, { useEffect, useRef, useState } from 'react'
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi'
import './ChatWidget.css'
import { aiChat } from '../services/api'

function genSessionId() {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([])
  const [input, setInput] = useState('')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const existing = localStorage.getItem('ai_session_id')
    if (existing) setSessionId(existing)
    else {
      const id = genSessionId()
      localStorage.setItem('ai_session_id', id)
      setSessionId(id)
    }
  }, [])

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [open, messages])

  const send = async () => {
    const trimmed = input.trim()
    if (!trimmed || !sessionId) return
    const userMsg = { from: 'user' as const, text: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await aiChat(trimmed, sessionId)
      const raw = res?.reply
      let replyText = 'Sorry, I could not generate a response.'
      if (typeof raw === 'string') replyText = raw
      else if (raw == null) replyText = 'Sorry, I could not generate a response.'
      else if (typeof (raw as any).text === 'string') replyText = (raw as any).text
      else {
        try {
          replyText = JSON.stringify(raw)
        } catch (e) {
          replyText = String(raw)
        }
      }

      setMessages((m) => [...m, { from: 'bot', text: replyText }])
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: 'Error: failed to contact assistant.' }])
    } finally {
      setLoading(false)
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
      }, 100)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="chat-widget-root">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="AI assistant chat">
          <div className="chat-panel__header">
            <div className="chat-panel__title">Assistant</div>
            <button className="chat-panel__close" onClick={() => setOpen(false)} aria-label="Close chat"><FiX /></button>
          </div>

          <div className="chat-panel__list" ref={listRef}>
            {messages.length === 0 && (
              <div className="chat-panel__empty">Hi — ask me to find listings, generate descriptions, or assist with bookings.</div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.from}`}>
                <div className="chat-msg__text">{m.text}</div>
              </div>
            ))}
          </div>

          <div className="chat-panel__input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask the assistant..."
              aria-label="Message"
            />
            <button onClick={send} className="chat-send-btn" aria-label="Send message" disabled={loading}>
              <FiSend />
            </button>
          </div>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Open assistant">
        <FiMessageCircle />
        <span className="chat-fab__label">Talk to chatbot</span>
      </button>
    </div>
  )
}
