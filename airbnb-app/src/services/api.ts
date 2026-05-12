export const apiBaseUrl = "/api/v1";

const getToken = (): string | null => {
  return localStorage.getItem("auth_token")
}

const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let message = `Request failed: ${res.status}`
    try {
      const parsed = JSON.parse(text)
      if (parsed && parsed.message) message = parsed.message
    } catch {}
    throw new Error(message)
  }
  return (await res.json()) as T
}

export const apiGet = async <T,>(path: string, auth = false): Promise<T> => {
  const headers: Record<string,string> = { "Content-Type": "application/json" }
  if (auth) Object.assign(headers, authHeaders())
  const response = await fetch(`${apiBaseUrl}${path}`, { headers })
  return handleResponse<T>(response)
}

export const apiPost = async <T,>(path: string, body: unknown, auth = false): Promise<T> => {
  const headers: Record<string,string> = { "Content-Type": "application/json" }
  if (auth) Object.assign(headers, authHeaders())
  const res = await fetch(`${apiBaseUrl}${path}`, { method: "POST", headers, body: JSON.stringify(body) })
  return handleResponse<T>(res)
}

export const apiPut = async <T,>(path: string, body: unknown, auth = false): Promise<T> => {
  const headers: Record<string,string> = { "Content-Type": "application/json" }
  if (auth) Object.assign(headers, authHeaders())
  const res = await fetch(`${apiBaseUrl}${path}`, { method: "PUT", headers, body: JSON.stringify(body) })
  return handleResponse<T>(res)
}

export const apiDelete = async <T,>(path: string, auth = false): Promise<T> => {
  const headers: Record<string,string> = { "Content-Type": "application/json" }
  if (auth) Object.assign(headers, authHeaders())
  const res = await fetch(`${apiBaseUrl}${path}`, { method: "DELETE", headers })
  return handleResponse<T>(res)
}

export const auth = {
  saveToken: (token: string) => localStorage.setItem("auth_token", token),
  removeToken: () => localStorage.removeItem("auth_token"),
}

// Higher level API helpers
export const register = async (payload: { name: string; email: string; username: string; phone: string; password: string; role?: string }) => {
  return apiPost<{ id: string; name: string; email: string }>("/auth/register", payload, false)
}

export const login = async (payload: { email: string; password: string }) => {
  return apiPost<{ token: string; user: any }>("/auth/login", payload, false)
}

export const me = async () => apiGet<any>("/auth/me", true)

export const createListing = async (payload: unknown) => apiPost<any>("/listings", payload, true)
export const updateListing = async (id: string, payload: unknown) => apiPut<any>(`/listings/${id}`, payload, true)
export const deleteListing = async (id: string) => apiDelete<any>(`/listings/${id}`, true)

export const uploadListingPhotos = async (listingId: string, files: File[]) => {
  const form = new FormData()
  files.forEach((f) => form.append("photos", f))
  const headers: Record<string,string> = { ...(authHeaders() as Record<string,string>) }
  const res = await fetch(`${apiBaseUrl}/upload/listings/${listingId}/photos`, { method: "POST", headers, body: form })
  return handleResponse<any>(res)
}

export const deleteListingPhoto = async (listingId: string, photoId: string) => {
  const headers: Record<string,string> = { ...(authHeaders() as Record<string,string>) }
  const res = await fetch(`${apiBaseUrl}/upload/listings/${listingId}/photos/${photoId}`, { method: "DELETE", headers })
  return handleResponse<any>(res)
}

export const getListings = async (params?: { type?: string; maxPrice?: string; location?: string }) => {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.maxPrice) query.set('maxPrice', params.maxPrice)
  if (params?.location) query.set('location', params.location)
  query.set('limit', '100')
  const qs = query.toString()
  return apiGet<{ data: any[]; meta?: any }>(`/listings/search${qs ? `?${qs}` : ''}`)
}

export const getListingById = async (id: string) => apiGet<any>(`/listings/${id}`)

export const createBooking = async (payload: { listingId: string; checkIn: string; checkOut: string }) => apiPost<any>("/bookings", payload, true)

export const getBookings = async () => apiGet<{ data: any[]; meta?: any }>("/bookings")

export const updateBookingStatus = async (id: string, status: string) => apiPut<any>(`/bookings/${id}`, { status }, true)

export const deleteBooking = async (id: string) => apiDelete<any>(`/bookings/${id}`, true)

export const getUsers = async () => apiGet<any[]>("/users", true)

export const getUsersStats = async () => apiGet<any>("/users/stats", true)

export const getListingsStats = async () => apiGet<any>("/listings/stats")

export const updateUser = async (id: string, payload: unknown) => apiPut<any>(`/users/${id}`, payload, true)

