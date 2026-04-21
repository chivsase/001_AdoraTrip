export type DealListingType = 'hotel' | 'tour' | 'package' | 'attraction' | 'restaurant' | 'transfer'

export type DealBadge = 'flash' | 'hot' | 'member' | 'bestseller' | ''

export interface ApiDeal {
  id: string
  title: string
  description: string
  image: string
  original_price: string   // Django DecimalField serialises as string
  sale_price: string
  discount_pct: number
  listing_type: DealListingType
  listing_type_display: string
  badge: DealBadge
  badge_display: string
  location: string
  destination: string | null
  starts_at: string
  expires_at: string
  is_active: boolean
  is_expired: boolean
  is_live: boolean
  priority: number
}

/** Normalised shape used by UI components — mirrors the old hardcoded interface */
export interface Deal {
  id: string
  title: string
  description: string
  image: string
  originalPrice: number
  salePrice: number
  discount: number
  expiresAt: Date
  type: 'hotel' | 'tour' | 'package'
  badge?: string
  location: string
}

/** Map badge key → display label (matches the original hardcoded badgeStyle keys) */
export const BADGE_LABELS: Record<DealBadge, string> = {
  flash: 'Flash Sale',
  hot: 'Hot Deal',
  member: 'Member Price',
  bestseller: 'Best Seller',
  '': '',
}

export function apiDealToDeal(d: ApiDeal): Deal {
  const type = (['hotel', 'tour', 'package'] as const).includes(d.listing_type as any)
    ? (d.listing_type as 'hotel' | 'tour' | 'package')
    : 'package'

  return {
    id: d.id,
    title: d.title,
    description: d.description,
    image: d.image,
    originalPrice: parseFloat(d.original_price),
    salePrice: parseFloat(d.sale_price),
    discount: d.discount_pct,
    expiresAt: new Date(d.expires_at),
    type,
    badge: d.badge ? BADGE_LABELS[d.badge] : undefined,
    location: d.location,
  }
}
