export type DestinationCategory = 'Beach' | 'Culture' | 'Nature' | 'Urban'

export interface ApiDestination {
  id: string                // slug, e.g. "siem-reap"
  name: string
  province: string
  tagline: string
  image: string
  rating_avg: string        // Django DecimalField serialises as string
  review_count: number
  listing_count: number
  price_from: string
  tag: string
  categories: DestinationCategory[]
  is_trending: boolean
  sort_order: number
}

/** Normalised shape used by UI components — mirrors the old hardcoded interface */
export interface Destination {
  id: string
  name: string
  province: string
  tagline: string
  image: string
  rating: number
  reviews: number
  hotels: number
  priceFrom: number
  tag?: string
  categories: DestinationCategory[]
  isTrending?: boolean
}

export function apiDestinationToDestination(d: ApiDestination): Destination {
  return {
    id: d.id,
    name: d.name,
    province: d.province,
    tagline: d.tagline,
    image: d.image,
    rating: parseFloat(d.rating_avg),
    reviews: d.review_count,
    hotels: d.listing_count,
    priceFrom: parseFloat(d.price_from),
    tag: d.tag || undefined,
    categories: d.categories,
    isTrending: d.is_trending,
  }
}
