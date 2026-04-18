'use client'
import { useState, useEffect, useCallback } from 'react'
import { X, Sparkles, Tag, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const promos = [
  {
    id: 'rewards',
    icon: Sparkles,
    text: 'Join AdoraTrip Rewards — earn points on every Cambodia booking',
    cta: 'Join Free',
    href: '/rewards',
    bg: 'from-[#287DFA] to-[#1E62CA]'
  },
  {
    id: 'app',
    icon: Tag,
    text: 'App-exclusive: extra 10% off hotels in Siem Reap & Phnom Penh',
    cta: 'Get App',
    href: '/app',
    bg: 'from-[#F59E0B] to-[#D97706]'
  },
  {
    id: 'deals',
    icon: Sparkles,
    text: '🌴 Koh Rong flash sale — beach bungalows from $25/night',
    cta: 'Book Now',
    href: '/deals',
    bg: 'from-[#EF4444] to-[#DC2626]'
  }
]

export default function PromoBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const nextPromo = useCallback(() => {
    setCurrent((prev) => (prev + 1) % promos.length)
  }, [])

  useEffect(() => {
    if (dismissed || isPaused) return
    const timer = setInterval(nextPromo, 5000)
    return () => clearInterval(timer)
  }, [dismissed, isPaused, nextPromo])

  if (dismissed) return null

  const promo = promos[current]
  const Icon = promo.icon

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-r ${promo.bg} transition-all duration-700 ease-in-out`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Subtle animated light sweep */}
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]' />

      <div className='relative z-10 flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 max-w-[1440px] mx-auto'>

        {/* Left: pagination indicators */}
        <div className='hidden md:flex items-center gap-1.5'>
          {promos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`group relative h-1.5 transition-all duration-300 rounded-full overflow-hidden ${i === current ? 'w-6 bg-white/40' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              aria-label={`Promo ${i + 1}`}
            >
              {i === current && (
                <div
                  className='absolute inset-0 bg-white origin-left'
                  style={{
                    animation: isPaused ? 'none' : 'promoProgress 5s linear forwards',
                    width: isPaused ? '100%' : 'auto'
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Center: Content with transition */}
        <div className='flex-1 flex items-center justify-center min-w-0'>
          <div
            key={current}
            className='flex items-center gap-2.5 sm:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 text-white'
          >
            <div className='hidden sm:flex w-7 h-7 items-center justify-center bg-white/15 rounded-full backdrop-blur-sm shrink-0'>
              <Icon className='w-4 h-4' />
            </div>

            <div className='flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center sm:text-left'>
              <span className='text-[12px] sm:text-[13.5px] font-semibold tracking-tight leading-tight line-clamp-1 sm:line-clamp-none'>
                {promo.text}
              </span>
              <Link
                href={promo.href}
                className='inline-flex items-center gap-1.5 text-[11px] sm:text-[12.5px] font-bold bg-white text-black/90 px-4 py-1.5 rounded-full hover:bg-black hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 shrink-0 shadow-sm active:scale-95'
              >
                {promo.cta}
                <ArrowRight className='w-3.5 h-3.5' />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Close button */}
        <button
          onClick={() => setDismissed(true)}
          className='flex w-8 h-8 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/10 hover:bg-white/25 transition-all duration-300 text-white shrink-0 group shadow-sm'
          aria-label='Dismiss'
        >
          <X className='w-4 h-4 group-hover:rotate-90 group-hover:scale-110 transition-all duration-500' />
        </button>
      </div>
    </div>
  )
}
