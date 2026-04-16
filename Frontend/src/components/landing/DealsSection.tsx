'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Clock, Flame, ArrowRight, Zap, Percent } from 'lucide-react'
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
  type: 'flight' | 'hotel' | 'package'
  badge?: string
}

const now = new Date()
const deals: Deal[] = [
  {
    id: '1',
    title: 'Bangkok Getaway',
    description: 'Round trip flight + 5-star hotel, 5 nights',
    image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=500&h=300&fit=crop',
    originalPrice: 1299,
    salePrice: 789,
    discount: 39,
    expiresAt: new Date(now.getTime() + 3 * 3600_000 + 42 * 60_000 + 17_000),
    type: 'package',
    badge: 'Flash Sale'
  },
  {
    id: '2',
    title: 'Rome → Milan',
    description: 'One-way economy flight, flexible dates',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=500&h=300&fit=crop',
    originalPrice: 189,
    salePrice: 79,
    discount: 58,
    expiresAt: new Date(now.getTime() + 11 * 3600_000 + 5 * 60_000),
    type: 'flight',
    badge: 'Hot Deal'
  },
  {
    id: '3',
    title: 'Santorini Villa',
    description: 'Luxury sea-view villa, per night',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&h=300&fit=crop',
    originalPrice: 450,
    salePrice: 279,
    discount: 38,
    expiresAt: new Date(now.getTime() + 2 * 86400_000 + 6 * 3600_000),
    type: 'hotel'
  },
  {
    id: '4',
    title: 'Singapore City Break',
    description: 'Flight + 4-star hotel, 3 nights from JFK',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=500&h=300&fit=crop',
    originalPrice: 999,
    salePrice: 649,
    discount: 35,
    expiresAt: new Date(now.getTime() + 1 * 86400_000 + 14 * 3600_000),
    type: 'package'
  },
  {
    id: '5',
    title: 'Istanbul Heritage',
    description: 'Boutique hotel in Sultanahmet, per night',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=500&h=300&fit=crop',
    originalPrice: 220,
    salePrice: 129,
    discount: 41,
    expiresAt: new Date(now.getTime() + 5 * 3600_000 + 33 * 60_000),
    type: 'hotel',
    badge: 'Member Price'
  },
  {
    id: '6',
    title: 'NYC → London',
    description: 'Business class round trip, 2 passengers',
    image: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=500&h=300&fit=crop',
    originalPrice: 3200,
    salePrice: 1899,
    discount: 41,
    expiresAt: new Date(now.getTime() + 22 * 3600_000 + 10 * 60_000),
    type: 'flight'
  }
]

const badgeStyle: Record<string, string> = {
  'Flash Sale': 'bg-[#EF4444] text-white',
  'Hot Deal': 'bg-[#FFB400] text-[#1A1A2E]',
  'Member Price': 'bg-[#8B5CF6] text-white'
}

const typeLabel: Record<Deal['type'], { label: string; color: string }> = {
  flight: { label: 'Flight', color: 'text-[#287DFA] bg-[#EBF3FF]' },
  hotel: { label: 'Hotel', color: 'text-[#8B5CF6] bg-[#F3EEFF]' },
  package: { label: 'Package', color: 'text-[#10B981] bg-[#ECFDF5]' }
}

/* Countdown hook */
function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()))
  useEffect(() => {
    const id = setInterval(() => setDiff(Math.max(0, target.getTime() - Date.now())), 1000)
    return () => clearInterval(id)
  }, [target])

  const h = Math.floor(diff / 3600_000)
  const m = Math.floor((diff % 3600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  const days = Math.floor(diff / 86400_000)
  return { h, m, s, days, expired: diff === 0 }
}

function DealCountdown({ target, compact = false }: { target: Date; compact?: boolean }) {
  const { h, m, s, days, expired } = useCountdown(target)
  if (expired) return <span className='text-[10px] text-[#EF4444] font-semibold'>Expired</span>

  const display = days > 0
    ? `${days}d ${String(h % 24).padStart(2, '0')}h`
    : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  if (compact) {
    return (
      <span className='flex items-center gap-1 text-[10px] text-[#EF4444] font-bold tabular-nums'>
        <Clock className='w-3 h-3' />
        {display}
      </span>
    )
  }

  return (
    <div className='flex items-center gap-1 text-[10px] text-[#9CA3AF]'>
      <Clock className='w-3 h-3' />
      <span className='tabular-nums font-semibold text-[#EF4444]'>{display}</span>
      <span>left</span>
    </div>
  )
}

export default function DealsSection() {
  return (
    <section className='py-10 md:py-14 bg-white'>
      <div className='max-w-[1200px] mx-auto px-4'>
        {/* Section header */}
        <div className='flex items-end justify-between mb-8'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              <Flame className='w-5 h-5 text-[#EF4444]' />
              <h2 className='text-2xl sm:text-3xl font-bold text-[#1A1A2E]'>Today&apos;s Best Deals</h2>
            </div>
            <p className='text-sm sm:text-base text-[#666B7A]'>
              Limited-time offers you don&apos;t want to miss
            </p>
          </div>
          <Link
            href='/deals'
            className='hidden sm:flex items-center gap-1 text-sm font-semibold text-[#287DFA] hover:text-[#1a6ae0] transition-colors duration-200 group'
          >
            All Deals
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' />
          </Link>
        </div>

        {/* Deals grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5'>
          {deals.map(deal => {
            const tl = typeLabel[deal.type]

            return (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className='group bg-white rounded-2xl overflow-hidden border border-[#E8E8ED] hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300'
              >
                {/* Image */}
                <div className='relative h-44 overflow-hidden'>
                  <Image
                    src={deal.image}
                    alt={deal.title}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                    className='object-cover group-hover:scale-105 transition-transform duration-500'
                  />

                  {/* Discount badge */}
                  <div className='absolute top-3 right-3 bg-[#EF4444] text-white text-xs font-extrabold px-2 py-1 rounded-lg flex items-center gap-0.5'>
                    <Percent className='w-3 h-3' />
                    {deal.discount}% OFF
                  </div>

                  {/* Special badge */}
                  {deal.badge && (
                    <span
                      className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 ${badgeStyle[deal.badge] ?? 'bg-[#287DFA] text-white'}`}
                    >
                      <Zap className='w-3 h-3' />
                      {deal.badge}
                    </span>
                  )}

                  {/* Countdown overlay on image bottom */}
                  <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2 flex items-center justify-end'>
                    <DealCountdown target={deal.expiresAt} compact />
                  </div>
                </div>

                {/* Info */}
                <div className='p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${tl.color}`}>
                      {tl.label}
                    </span>
                  </div>

                  <h3 className='text-base font-bold text-[#1A1A2E] group-hover:text-[#287DFA] transition-colors duration-200'>
                    {deal.title}
                  </h3>
                  <p className='text-xs text-[#666B7A] mt-1'>{deal.description}</p>

                  {/* Price row */}
                  <div className='mt-3 flex items-center justify-between'>
                    <div className='flex items-baseline gap-2'>
                      <span className='text-sm text-[#9CA3AF] line-through'>${deal.originalPrice}</span>
                      <span className='text-xl font-extrabold text-[#FFB400]'>${deal.salePrice}</span>
                    </div>
                    <span className='text-[10px] font-semibold text-white bg-[#EF4444] px-2 py-0.5 rounded-full'>
                      Save ${deal.originalPrice - deal.salePrice}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Mobile link */}
        <div className='flex justify-center mt-6 sm:hidden'>
          <Link href='/deals' className='flex items-center gap-1.5 text-sm font-semibold text-[#287DFA]'>
            View All Deals
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
