export interface ApiListing {
  id: string
  title: string
  location: string
  pricePerNight: number
  photos: { id?: string; url: string; publicId?: string; optimizedUrl?: string }[]
  host?: { name: string }
  type?: string
  guests?: number
  amenities?: string[]
  description?: string
  rating?: number
}

export interface State {
  listings: ApiListing[]
  loading: boolean
  filter: string
  saved: string[]
  user?: any
  darkMode: boolean
}

export type Action =
  | { type: 'SET_LISTINGS'; payload: ApiListing[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_FILTER'; payload: string }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'SET_USER'; payload: any }
  | { type: 'LOGOUT' }
  | { type: 'SET_DARKMODE'; payload: boolean }
