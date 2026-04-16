'use client'

import { useState } from 'react'
import { X, Sparkles, Tag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const promos = [
  {
    id: 'rewards',
    icon: Sparkles,
    text: 'Join AdoraTrip Rewards — earn points on every Cambodia booking',
    cta: 'Join Free',
    href: '/rewards',
    bg: 'bg-[#287DFA]'
  },
  {
    id: 'app',
    icon: Tag,
    text: 'App-exclusive: extra 10% off hotels in Siem Reap & Phnom Penh',
    cta: 'Get App',
    href: '/app',
    bg: 'bg-[#F59E0B]'
  },
  {
    id: 'deals',
    icon: Sparkles,
    text: '🌴 Koh Rong flash sale — beach bungalows from $25/night. Limited rooms!',
    cta: 'Book Now',
    href: '/deals',
    bg: 'bg-[#EF4444]'
  }
]

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [current, setCurrent] = useState(0)

  if (dismissed) return null

  const promo = promos[current]
  const Icon = promo.icon

  return (
    <div className={`relative flex items-center justify-center gap-3 px-4 py-2.5 text-white text-[12.5px] sm:text-[13px] font-medium ${promo.bg} transition-colors duration-300`}>
      {/* Pagination dots */}
      <div className='hidden sm:flex items-center gap-1 absolute left-4'>
        {promos.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-200 ${i === current ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'}`}
            aria-label={`Promo ${i + 1}`}
          />
        ))}
      </div>

      <div className='flex items-center gap-2 max-w-2xl'>
        <Icon className='w-4 h-4 shrink-0 opacity-90' />
        <span className='opacity-95'>{promo.text}</span>
        <Link
          href={promo.href}
          className='inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity shrink-0'
        >
          {promo.cta}
          <ArrowRight className='w-3.5 h-3.5' />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className='absolute right-3 p-1 rounded hover:bg-white/20 transition-colors duration-200'
        aria-label='Dismiss'
      >
        <X className='w-3.5 h-3.5' />
      </button>
    </div>
  )
}
