'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { Star, ArrowRight, Heart, Hotel, Compass, Leaf, Waves, Landmark, TrendingUp, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import classnames from 'classnames'
import { useDestinations } from '@/hooks/useDestinations'
import type { Destination, DestinationCategory } from '@/types/destinations'

const tagColors: Record<string, string> = {
  'MOST POPULAR': 'bg-[#287DFA] text-white',
  'BEACH ESCAPE': 'bg-[#0891B2] text-white',
  'HIDDEN GEM': 'bg-emerald-600 text-white',
  'ECO ADVENTURE': 'bg-[#065F46] text-white'
}

type CategoryType = 'All' | DestinationCategory

const filterCategories: { label: CategoryType; icon: any }[] = [
  { label: 'All', icon: Compass },
  { label: 'Beach', icon: Waves },
  { label: 'Culture', icon: Landmark },
  { label: 'Nature', icon: Leaf },
  { label: 'Urban', icon: Hotel }
]

function WishlistButton() {
  const [active, setActive] = useState(false)

  return (
    <button
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        setActive(!active)
      }}
      className={classnames(
        'absolute top-4 right-4 w-9 h-9 rounded-xl backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-lg z-20 hover:scale-110 active:scale-95',
        active ? 'bg-red-500 text-white shadow-red-200' : 'bg-white/80 text-slate-500 hover:text-red-500 hover:bg-white'
      )}
      aria-label='Save to wishlist'
    >
      <Heart className={classnames('w-4 h-4 transition-transform', active && 'fill-white')} />
    </button>
  )
}

/* Skeleton for a featured card */
function FeaturedCardSkeleton() {
  return (
    <div className='col-span-1 sm:col-span-2 rounded-[2.5rem] overflow-hidden bg-slate-200 animate-pulse h-[480px] sm:h-[520px]' />
  )
}

/* Skeleton for a regular card */
function DestinationCardSkeleton() {
  return (
    <div className='rounded-[2.5rem] overflow-hidden border border-slate-100 bg-white animate-pulse p-2.5'>
      <div className='h-64 rounded-[2rem] bg-slate-200' />
      <div className='p-6 space-y-3'>
        <div className='flex justify-between'>
          <div className='h-3 w-20 bg-slate-200 rounded' />
          <div className='h-5 w-10 bg-slate-100 rounded-full' />
        </div>
        <div className='pt-5 border-t border-slate-50 flex justify-between'>
          <div className='space-y-1'>
            <div className='h-2 w-14 bg-slate-100 rounded' />
            <div className='h-5 w-16 bg-slate-200 rounded' />
          </div>
          <div className='w-10 h-10 rounded-2xl bg-slate-100' />
        </div>
      </div>
    </div>
  )
}

function FeaturedCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={`/province/${dest.id}`}
      className='group relative col-span-1 sm:col-span-2 bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 hover:-translate-y-2'
    >
      <div className='relative h-[480px] sm:h-[520px] overflow-hidden'>
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          priority
          sizes='(max-width: 640px) 100vw, 50vw'
          className='object-cover group-hover:scale-110 transition-transform duration-1000 ease-out flex'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent' />

        <WishlistButton />

        <div className='absolute top-5 left-5 flex flex-col gap-2 z-10'>
          {dest.tag && (
            <span className={classnames('text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-2 rounded-lg shadow-xl', tagColors[dest.tag] ?? 'bg-white text-slate-800')}>
              {dest.tag}
            </span>
          )}
          {dest.isTrending && (
            <span className='bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-2 rounded-lg shadow-xl flex items-center gap-1.5'>
              <TrendingUp className='w-3 h-3' />
              Trending Now
            </span>
          )}
        </div>

        <div className='absolute bottom-0 left-0 right-0 p-10'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='w-12 h-px bg-[#287DFA]' />
            <p className='text-white/80 text-[11px] uppercase tracking-[0.4em] font-black'>{dest.province}</p>
          </div>
          <h3 className='text-white text-5xl sm:text-6xl font-black leading-tight tracking-tighter drop-shadow-2xl mb-4'>{dest.name}</h3>
          <p className='text-white/90 text-base mt-2 max-w-md font-medium leading-relaxed line-clamp-2'>{dest.tagline}</p>

          <div className='mt-8 pt-8 border-t border-white/10 flex items-center gap-8'>
            <div className='flex flex-col gap-1'>
              <span className='text-[10px] text-white/40 uppercase font-black tracking-widest'>Rating</span>
              <div className='flex items-center gap-2'>
                <Star className='w-4 h-4 fill-amber-400 text-amber-400' />
                <span className='text-white text-lg font-black'>{dest.rating}</span>
                <span className='text-white/40 text-xs font-medium'>({dest.reviews.toLocaleString()} global reviews)</span>
              </div>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-[10px] text-white/40 uppercase font-black tracking-widest'>Availability</span>
              <div className='flex items-center gap-2 text-white text-lg font-black'>
                <Hotel className='w-4 h-4 text-[#287DFA]' />
                {dest.hotels}+ Premium stays
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='absolute bottom-10 right-10 flex items-center gap-6 z-10'>
        <div className='flex flex-col items-end'>
          <span className='text-[10px] text-white/50 uppercase tracking-widest font-black mb-1'>Starting from</span>
          <div className='flex items-baseline gap-1'>
            <span className='text-4xl font-black text-white'>${dest.priceFrom}</span>
            <span className='text-xs font-bold text-white/40'>/ night</span>
          </div>
        </div>

        <div className='w-14 h-14 rounded-2xl bg-[#287DFA] flex items-center justify-center text-white shadow-[0_12px_24px_-8px_rgba(40,125,250,0.7)] group-hover:scale-110 transition-all duration-300'>
          <ArrowRight className='w-6 h-6' />
        </div>
      </div>
    </Link>
  )
}

function DestinationCard({ dest, index }: { dest: Destination; index: number }) {
  return (
    <Link
      href={`/province/${dest.id}`}
      className='group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 fill-mode-both p-2.5'
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className='relative h-64 overflow-hidden rounded-[2rem]'>
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
          className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500' />

        <WishlistButton />

        <div className='absolute bottom-0 left-0 right-0 p-6 transform group-hover:-translate-y-1 transition-transform duration-500'>
          <p className='text-white/50 text-[10px] uppercase tracking-[0.2em] font-black mb-1'>{dest.province}</p>
          <h3 className='text-white text-xl font-black leading-tight tracking-tight'>{dest.name}</h3>
        </div>
      </div>

      <div className='p-6'>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-2 text-slate-400'>
            <Hotel className='w-3.5 h-3.5' />
            <span className='text-xs font-bold'>{dest.hotels}+ stays</span>
          </div>
          <div className='flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-full text-amber-700 font-black text-xs'>
            <Star className='w-3 h-3 fill-amber-500 text-amber-500' />
            {dest.rating}
          </div>
        </div>

        <div className='flex items-center justify-between pt-5 border-t border-slate-50'>
          <div>
            <span className='block text-[9px] text-slate-400 uppercase font-black tracking-[0.1em] mb-1'>Exclusive price</span>
            <p className='text-lg font-black text-slate-900'>
              ${dest.priceFrom}<span className='text-[10px] font-bold text-slate-400 ml-1'>/night</span>
            </p>
          </div>
          <div className='w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-[#287DFA] group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm'>
            <ArrowRight className='w-5 h-5 transition-transform group-hover:translate-x-0.5' />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function DestinationCards() {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All')
  const { destinations, isLoading, error, refetch } = useDestinations()

  const filteredDestinations = useMemo(() => {
    if (activeCategory === 'All') return destinations
    return destinations.filter(d => d.categories.includes(activeCategory as DestinationCategory))
  }, [activeCategory, destinations])

  const featured = filteredDestinations[0]
  const rest = filteredDestinations.slice(1)

  return (
    <section className='py-32 bg-[#F8FAFC] relative overflow-hidden'>
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none select-none overflow-hidden flex items-center justify-center -z-0 opacity-[0.03]'>
        <span className='text-[40rem] font-black font-serif italic transform -rotate-12 translate-y-20'>Explore</span>
      </div>

      <div className='max-w-[1440px] mx-auto px-6 sm:px-12 relative z-10'>

        {/* Section header */}
        <div className='flex flex-col lg:flex-row items-center lg:items-end justify-between mb-20 gap-12'>
          <div className='flex-1 text-center lg:text-left'>
            <div className='inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white shadow-sm border border-slate-100 text-[#287DFA] mb-8'>
              <Compass className='w-4.5 h-4.5' />
              <span className='text-xs font-black uppercase tracking-[0.3em]'>Grand Collection 2026</span>
            </div>
            <h2 className='text-5xl sm:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95] mb-8'>
              Popular <br /> <span className='text-[#287DFA]'>Destinations</span>
            </h2>
            <p className='text-xl text-slate-500 max-w-2xl font-medium leading-relaxed mx-auto lg:mx-0'>
              Embark on a journey through the <span className='text-slate-900 font-bold italic'>Kingdom of Cambodia</span>.
              Find your perfect escape from our handpicked provincial gems.
            </p>
          </div>

          <div className='flex flex-col items-center lg:items-end gap-8 bg-white/50 backdrop-blur-sm p-4 rounded-[2.5rem] border border-white'>
            <div className='flex items-center bg-white p-2 rounded-3xl shadow-sm border border-slate-100 overflow-x-auto max-w-full no-scrollbar'>
              {filterCategories.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  onClick={() => setActiveCategory(label)}
                  className={classnames(
                    'flex items-center gap-3 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 whitespace-nowrap',
                    activeCategory === label
                      ? 'bg-[#287DFA] text-white shadow-xl shadow-blue-200 scale-105'
                      : 'text-slate-500 hover:text-slate-900'
                  )}
                >
                  <Icon className='w-4 h-4' />
                  {label}
                </button>
              ))}
            </div>
            <Link
              href='/destinations'
              className='group flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-900 px-4 py-2 hover:text-[#287DFA] transition-all'
            >
              See our Full Archive
              <div className='w-10 h-10 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center group-hover:bg-[#287DFA] group-hover:border-[#287DFA] group-hover:text-white group-hover:scale-110 transition-all shadow-sm'>
                <ArrowRight className='w-5 h-5' />
              </div>
            </Link>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className='flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white border-2 border-dashed border-slate-100'>
            <p className='text-slate-500 mb-6'>Could not load destinations.</p>
            <button
              onClick={refetch}
              className='flex items-center gap-2 text-sm font-semibold text-[#287DFA] border border-blue-200 px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors'
            >
              <RefreshCw className='w-4 h-4' />
              Try again
            </button>
          </div>
        )}

        {/* Grid */}
        {!error && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
            {isLoading ? (
              <>
                <FeaturedCardSkeleton />
                {Array.from({ length: 5 }).map((_, i) => <DestinationCardSkeleton key={i} />)}
              </>
            ) : filteredDestinations.length > 0 ? (
              <>
                {featured && <FeaturedCard dest={featured} />}
                {rest.map((dest, i) => (
                  <DestinationCard key={dest.id} dest={dest} index={i} />
                ))}
              </>
            ) : (
              <div className='col-span-full flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white border-2 border-dashed border-slate-100'>
                <div className='w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8'>
                  <Compass className='w-12 h-12 text-slate-200 animate-spin-slow' />
                </div>
                <h3 className='text-2xl font-black text-slate-900 mb-3'>No treasures found here</h3>
                <p className='text-slate-500 max-w-xs text-center font-medium leading-relaxed'>
                  Our scouts are still exploring this theme. Try searching for <span className='text-[#287DFA] font-bold'>Beach</span> or <span className='text-emerald-600 font-bold'>Nature</span> adventures.
                </p>
                <button
                  onClick={() => setActiveCategory('All')}
                  className='mt-10 px-10 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-[#287DFA] hover:scale-105 transition-all shadow-xl'
                >
                  Show All Treasures
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
      `}</style>
    </section>
  )
}
