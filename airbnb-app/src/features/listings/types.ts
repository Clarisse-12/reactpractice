export type ListingCategory = 'beach' | 'mountain' | 'city' | 'countryside'

export interface Review {
  id: number
  author: string
  rating: number
  text: string
  date: string
}

export interface MenuItem {
  name: string
  price: number
  description: string
  tag?: string
}

export interface OpeningHours {
  [key: string]: string
}

export interface Listing {
  id: number
  title: string
  location: string
  price: number
  rating: number
  reviews: number
  superhost: boolean
  available: boolean
  availableFrom: string
  img: string
  category: ListingCategory
  images: string[]
  description: string
  amenities: string[]
  menu: MenuItem[]
  openingHours: OpeningHours
  reviews_list: Review[]
}
