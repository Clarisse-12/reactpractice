export type ConversationMessage = {
  id: string
  senderId: string
  senderName: string
  text: string
  createdAt: string
}

export type ConversationThread = {
  id: string
  listingId: string
  listingTitle: string
  hostId: string
  hostName: string
  guestId: string
  guestName: string
  updatedAt: string
  messages: ConversationMessage[]
}

const STORAGE_KEY = 'airbnb_message_threads_v1'

const threadKey = (listingId: string, hostId: string, guestId: string) => `${listingId}:${hostId}:${guestId}`

const readThreads = (): ConversationThread[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ConversationThread[]) : []
  } catch {
    return []
  }
}

const saveThreads = (threads: ConversationThread[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads))
}

export const getThreadsForUser = (userId?: string): ConversationThread[] => {
  if (!userId) return []
  return readThreads()
    .filter((thread) => thread.hostId === userId || thread.guestId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export const getThread = (listingId: string, hostId: string, guestId: string): ConversationThread | undefined => {
  return readThreads().find((thread) => thread.id === threadKey(listingId, hostId, guestId))
}

export const sendMessage = (payload: {
  listingId: string
  listingTitle: string
  hostId: string
  hostName: string
  guestId: string
  guestName: string
  senderId: string
  senderName: string
  text: string
}) => {
  const messageText = payload.text.trim()
  if (!messageText) return null

  const threads = readThreads()
  const id = threadKey(payload.listingId, payload.hostId, payload.guestId)
  const now = new Date().toISOString()
  const message: ConversationMessage = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    senderId: payload.senderId,
    senderName: payload.senderName,
    text: messageText,
    createdAt: now,
  }

  const threadIndex = threads.findIndex((thread) => thread.id === id)
  if (threadIndex >= 0) {
    const thread = threads[threadIndex]
    thread.messages = [...thread.messages, message]
    thread.updatedAt = now
    thread.listingTitle = payload.listingTitle
    thread.hostName = payload.hostName
    thread.guestName = payload.guestName
  } else {
    threads.push({
      id,
      listingId: payload.listingId,
      listingTitle: payload.listingTitle,
      hostId: payload.hostId,
      hostName: payload.hostName,
      guestId: payload.guestId,
      guestName: payload.guestName,
      updatedAt: now,
      messages: [message],
    })
  }

  saveThreads(threads)
  return threads.find((thread) => thread.id === id) || null
}
