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
    <section className='py-16 md:py-24 bg-white'>
      <div className='max-w-[1240px] mx-auto px-4 sm:px-6'>

        {/* Header */}
        <div className='flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4'>
          <div className='animate-in fade-in slide-in-from-left-6 duration-1000 fill-mode-both'>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-2 bg-[#FEF2F2] text-[#DC2626] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4'>
              <Flame className='w-4 h-4 mr-0.5 animate-pulse' />
              Limited Time Deals
            </div>
            <h2 className='text-[2rem] sm:text-4xl font-[900] text-[#0F172A] tracking-tight leading-tight'>
              Today&apos;s Best Deals
            </h2>
            <p className='mt-3 text-base text-[#64748B] max-w-lg'>
              Grab these exclusive, time-sensitive discounts on premium hotels, 
              cultural tours, and complete vacation packages.
            </p>
          </div>
          <Link
            href='/deals'
            className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#DC2626] bg-[#FEF2F2] hover:bg-[#DC2626] hover:text-white transition-all duration-300 group whitespace-nowrap animate-in fade-in slide-in-from-right-6 duration-1000 fill-mode-both'
          >
            All Deals
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' />
          </Link>
        </div>

        {/* Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-7'>
          {deals.map((deal, idx) => {
            const tl = typeLabel[deal.type]

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className='group bg-white rounded-3xl overflow-hidden border border-[#F1F5F9] hover:border-transparent hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 animate-in fade-in zoom-in-95 duration-700 fill-mode-both'
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Image */}
                <div className='relative h-60 overflow-hidden'>
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                  />

                  {/* Discount chip */}
                  <div className='absolute top-4 right-4 flex items-center gap-1 bg-[#EF4444] text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg'>
                    <Percent className='w-3 h-3' />
                    {deal.discount}% OFF
                  </div>

                  {/* Special badge */}
                  {deal.badge && (
                    <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg backdrop-blur-md border border-white/10 ${badgeStyle[deal.badge] ?? 'bg-[#287DFA] text-white'}`}>
                      <Zap className='w-3 h-3' />
                      {deal.badge}
                    </span>
                  )}

                  {/* Countdown + location overlay */}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-5 py-4 flex items-center justify-between'>
                    <span className='flex items-center gap-1.5 text-[11px] text-white/90 font-bold'>
                      <MapPin className='w-3.5 h-3.5 text-[#FFD166]' />
                      {deal.location}
                    </span>
                    <Countdown target={deal.expiresAt} />
                  </div>
                </div>

                {/* Body */}
                <div className='p-6'>
                  <div className='flex items-center gap-2 mb-3'>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${tl.color}`}>
                      {tl.label}
                    </span>
                  </div>

                  <h3 className='text-lg font-black text-[#0F172A] group-hover:text-[#287DFA] transition-colors duration-300 leading-snug h-[3.5rem] line-clamp-2'>
                    {deal.title}
                  </h3>
                  <p className='text-[13px] text-[#64748B] mt-2 line-clamp-2 leading-relaxed font-medium'>{deal.description}</p>

                  {/* Price row */}
                  <div className='mt-6 flex items-center justify-between'>
                    <div className='flex flex-col'>
                      <span className='text-[10px] text-[#94A3B8] font-bold uppercase line-through'>${deal.originalPrice}</span>
                      <div className='flex items-baseline gap-1'>
                        <span className='text-2xl font-black text-[#F59E0B]'>${deal.salePrice}</span>
                        <span className='text-[10px] text-[#94A3B8] font-bold'>/ total</span>
                      </div>
                    </div>
                    <div className='flex flex-col items-end'>
                      <span className='text-[10px] font-black text-[#DC2626] bg-[#FEF2F2] px-3 py-1.5 rounded-xl'>
                        You Save ${deal.originalPrice - deal.salePrice}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        {/* Mobile CTA */}
        <div className='flex justify-center mt-12 sm:hidden'>
          <Link href='/deals' className='flex items-center gap-2 text-sm font-bold text-[#DC2626] bg-[#FEF2F2] px-6 py-3 rounded-xl'>
            View All Deals <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
