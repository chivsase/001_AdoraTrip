'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, Flame, ArrowRight, Zap, Percent, MapPin } from 'lucide-react'
import Link from 'next/link'

interface Deal {
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

const now = new Date()

const deals: Deal[] = [
  {
    id: '1',
    title: 'Angkor Wat Sunrise Tour',
    description: 'Private guided tour + breakfast, departing Siem Reap',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=500&h=320&fit=crop',
    originalPrice: 85,
    salePrice: 49,
    discount: 42,
    expiresAt: new Date(now.getTime() + 4 * 3600_000 + 15 * 60_000),
    type: 'tour',
    badge: 'Flash Sale',
    location: 'Siem Reap'
  },
  {
    id: '2',
    title: 'Phnom Penh Boutique Hotel',
    description: 'Superior room with city view, breakfast included',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&h=320&fit=crop',
    originalPrice: 75,
    salePrice: 42,
    discount: 44,
    expiresAt: new Date(now.getTime() + 9 * 3600_000 + 30 * 60_000),
    type: 'hotel',
    badge: 'Member Price',
    location: 'Phnom Penh'
  },
  {
    id: '3',
    title: 'Koh Rong Island Escape',
    description: 'Beach bungalow + speedboat transfer, 3 nights',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=320&fit=crop',
    originalPrice: 220,
    salePrice: 138,
    discount: 37,
    expiresAt: new Date(now.getTime() + 1 * 86400_000 + 7 * 3600_000),
    type: 'package',
    location: 'Sihanoukville'
  },
  {
    id: '4',
    title: 'Kampot River Resort',
    description: 'Garden villa with pool, riverside breakfast buffet',
    image: 'https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=500&h=320&fit=crop',
    originalPrice: 90,
    salePrice: 56,
    discount: 38,
    expiresAt: new Date(now.getTime() + 2 * 86400_000 + 3 * 3600_000),
    type: 'hotel',
    badge: 'Hot Deal',
    location: 'Kampot'
  },
  {
    id: '5',
    title: 'Elephant Valley Day Trip',
    description: 'Full-day ethical elephant experience, lunch & transport',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=320&fit=crop',
    originalPrice: 120,
    salePrice: 79,
    discount: 34,
    expiresAt: new Date(now.getTime() + 6 * 3600_000 + 45 * 60_000),
    type: 'tour',
    location: 'Mondulkiri'
  },
  {
    id: '6',
    title: 'Siem Reap 3-Night Package',
    description: 'Boutique hotel + Angkor pass + tuk-tuk for 3 days',
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=500&h=320&fit=crop',
    originalPrice: 280,
    salePrice: 168,
    discount: 40,
    expiresAt: new Date(now.getTime() + 12 * 3600_000),
    type: 'package',
    badge: 'Best Seller',
    location: 'Siem Reap'
  }
]

const badgeStyle: Record<string, string> = {
  'Flash Sale': 'bg-[#EF4444] text-white',
  'Hot Deal': 'bg-[#F59E0B] text-[#111827]',
  'Member Price': 'bg-[#7C3AED] text-white',
  'Best Seller': 'bg-[#287DFA] text-white'
}

const typeLabel: Record<Deal['type'], { label: string; color: string }> = {
  tour: { label: 'Tour', color: 'text-[#059669] bg-[#ECFDF5]' },
  hotel: { label: 'Hotel', color: 'text-[#7C3AED] bg-[#F5F3FF]' },
  package: { label: 'Package', color: 'text-[#D97706] bg-[#FFFBEB]' }
}

function useCountdown(target: Date) {
  const [mounted, setMounted] = useState(false)
  const [diff, setDiff] = useState(0)
  useEffect(() => {
    setMounted(true)
    setDiff(Math.max(0, target.getTime() - Date.now()))
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])
  const days = Math.floor(diff / 86400_000)
  const h = Math.floor((diff % 86400_000) / 3600_000)
  const m = Math.floor((diff % 3600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return { days, h, m, s, expired: mounted && diff === 0, mounted }
}

function Countdown({ target }: { target: Date }) {
  const { days, h, m, s, expired, mounted } = useCountdown(target)
  if (!mounted) return (
    <span className='flex items-center gap-1 text-[10px] font-bold text-white/90 tabular-nums'>
      <Clock className='w-3 h-3' />--:--:--
    </span>
  )
  if (expired) return <span className='text-[10px] text-[#FCA5A5] font-bold'>Expired</span>
  const display = days > 0
    ? `${days}d ${String(h).padStart(2, '0')}h left`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return (
    <span className='flex items-center gap-1 text-[10px] font-bold text-white/90 tabular-nums'>
      <Clock className='w-3 h-3' />
      {display}
    </span>
  )
}

export default function DealsSection() {
  return (
    <section className='py-14 md:py-20 bg-white'>
      <div className='max-w-[1200px] mx-auto px-4 sm:px-6'>

        {/* Header */}
        <div className='flex items-end justify-between mb-10'>
          <div>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-1.5 bg-[#FEF2F2] text-[#DC2626] text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-full mb-3'>
              <Flame className='w-3 h-3' />
              Limited Time
            </div>
            <h2 className='text-[1.85rem] sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight'>
              Today&apos;s Best Deals
            </h2>
            <p className='mt-2 text-sm sm:text-base text-[#6B7280]'>
              Exclusive discounts on hotels, tours & packages across Cambodia
            </p>
          </div>
          <Link
            href='/deals'
            className='hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#287DFA] hover:text-[#1a6ae0] transition-colors duration-200 group whitespace-nowrap'
          >
            All Deals
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' />
          </Link>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
          {deals.map(deal => {
            const tl = typeLabel[deal.type]

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className='group bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] hover:border-transparent hover:shadow-[0_12px_36px_rgba(0,0,0,0.11)] transition-all duration-300 hover:-translate-y-0.5'
              >
                {/* Image */}
                <div className='relative h-48 overflow-hidden'>
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover group-hover:scale-[1.06] transition-transform duration-500'
                  />

                  {/* Discount chip */}
                  <div className='absolute top-3 right-3 flex items-center gap-0.5 bg-[#EF4444] text-white text-[11px] font-extrabold px-2 py-1 rounded-lg shadow-sm'>
                    <Percent className='w-2.5 h-2.5' />
                    {deal.discount}% OFF
                  </div>

                  {/* Special badge */}
                  {deal.badge && (
                    <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm ${badgeStyle[deal.badge] ?? 'bg-[#287DFA] text-white'}`}>
                      <Zap className='w-2.5 h-2.5' />
                      {deal.badge}
                    </span>
                  )}

                  {/* Countdown + location overlay */}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3.5 py-3 flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-[11px] text-white/80 font-medium'>
                      <MapPin className='w-3 h-3' />
                      {deal.location}
                    </span>
                    <Countdown target={deal.expiresAt} />
                  </div>
                </div>

                {/* Body */}
                <div className='p-4'>
                  <div className='flex items-center gap-2 mb-2.5'>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tl.color}`}>
                      {tl.label}
                    </span>
                  </div>

                  <h3 className='text-[15px] font-bold text-[#111827] group-hover:text-[#287DFA] transition-colors duration-200 leading-snug'>
                    {deal.title}
                  </h3>
                  <p className='text-xs text-[#6B7280] mt-1 line-clamp-2 leading-relaxed'>{deal.description}</p>

                  {/* Price row */}
                  <div className='mt-3.5 flex items-center justify-between'>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-sm text-[#C9CBD6] line-through'>${deal.originalPrice}</span>
                      <span className='text-xl font-extrabold text-[#F59E0B]'>${deal.salePrice}</span>
                    </div>
                    <span className='text-[10px] font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-1 rounded-full'>
                      Save ${deal.originalPrice - deal.salePrice}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile CTA */}
        <div className='flex justify-center mt-8 sm:hidden'>
          <Link href='/deals' className='flex items-center gap-1.5 text-sm font-semibold text-[#287DFA]'>
            View All Deals <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
