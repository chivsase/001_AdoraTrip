'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, Flame, ArrowRight, Zap, MapPin } from 'lucide-react'
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
  'Flash Sale': 'bg-red-500 text-white',
  'Hot Deal': 'bg-amber-400 text-amber-900',
  'Member Price': 'bg-violet-600 text-white',
  'Best Seller': 'bg-[#287DFA] text-white'
}

const typeLabel: Record<Deal['type'], { label: string; color: string }> = {
  tour: { label: 'Tour', color: 'text-emerald-700 bg-emerald-50 border border-emerald-100' },
  hotel: { label: 'Hotel', color: 'text-violet-700  bg-violet-50  border border-violet-100' },
  package: { label: 'Package', color: 'text-amber-700   bg-amber-50   border border-amber-100' }
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

function CountdownTimer({ target }: { target: Date }) {
  const { days, h, m, s, expired, mounted } = useCountdown(target)

  if (!mounted) return (
    <span className='flex items-center gap-1 text-[10px] text-white/70 tabular-nums'>
      <Clock className='w-3 h-3' /> --:--:--
    </span>
  )

  if (expired) return <span className='text-[10px] text-red-300 font-medium'>Expired</span>

  const display = days > 0
    ? `${days}d ${String(h).padStart(2, '0')}h left`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <span className='flex items-center gap-1 text-[10px] text-white/80 font-medium tabular-nums'>
      <Clock className='w-3 h-3' />
      {display}
    </span>
  )
}

export default function DealsSection() {
  return (
    <section className='py-20 bg-white'>
      <div className='max-w-[1240px] mx-auto px-4 sm:px-6'>

        {/* Header */}
        <div className='flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-5'>
          <div>
            <p className='flex items-center gap-2 text-red-500 text-[11px] font-semibold uppercase tracking-[0.2em] mb-3'>
              <Flame className='w-3.5 h-3.5' />
              Limited Time Deals
            </p>
            <h2 className='text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-tight'>
              Today&apos;s Best Deals
            </h2>
            <p className='mt-2 text-sm text-slate-500 max-w-md leading-relaxed'>
              Exclusive discounts on hotels, tours, and packages — grab them before they&apos;re gone.
            </p>
          </div>
          <Link
            href='/deals'
            className='hidden sm:flex items-center gap-2 text-sm font-semibold text-red-500 border border-red-200 hover:border-red-500 bg-white hover:bg-red-500 hover:text-white px-5 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap group'
          >
            All Deals
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300' />
          </Link>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
          {deals.map((deal, idx) => {
            const tl = typeLabel[deal.type]

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className='group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-in fade-in zoom-in-95 duration-500 fill-mode-both'
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Image */}
                <div className='relative h-52 overflow-hidden'>
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />

                  {/* Discount pill */}
                  <div className='absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full'>
                    -{deal.discount}%
                  </div>

                  {/* Special badge */}
                  {deal.badge && (
                    <span className={`absolute top-3 left-3 text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1 ${badgeStyle[deal.badge] ?? 'bg-[#287DFA] text-white'}`}>
                      <Zap className='w-2.5 h-2.5' />
                      {deal.badge}
                    </span>
                  )}

                  {/* Bottom overlay */}
                  <div className='absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between'>
                    <span className='flex items-center gap-1 text-[10px] text-white/80 font-medium'>
                      <MapPin className='w-3 h-3' />
                      {deal.location}
                    </span>
                    <CountdownTimer target={deal.expiresAt} />
                  </div>
                </div>

                {/* Body */}
                <div className='p-4'>
                  <span className={`inline-block text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2.5 ${tl.color}`}>
                    {tl.label}
                  </span>

                  <h3 className='text-sm font-semibold text-slate-900 group-hover:text-[#287DFA] transition-colors duration-300 leading-snug line-clamp-2 mb-1.5'>
                    {deal.title}
                  </h3>
                  <p className='text-xs text-slate-500 line-clamp-1 leading-relaxed'>
                    {deal.description}
                  </p>

                  {/* Price row */}
                  <div className='flex items-center justify-between pt-3.5 mt-3.5 border-t border-slate-100'>
                    <div>
                      <p className='text-[10px] text-slate-400 line-through'>${deal.originalPrice}</p>
                      <p className='text-lg font-bold text-slate-900'>
                        ${deal.salePrice}
                        <span className='text-[10px] font-normal text-slate-400 ml-1'>/ total</span>
                      </p>
                    </div>
                    <span className='text-[10px] font-semibold text-red-500 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg'>
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
          <Link
            href='/deals'
            className='flex items-center gap-2 text-sm font-semibold text-red-500 bg-white border border-red-200 px-6 py-3 rounded-xl'
          >
            All Deals <ArrowRight className='w-4 h-4' />
          </Link>
        </div>

      </div>
    </section>
  )
}
