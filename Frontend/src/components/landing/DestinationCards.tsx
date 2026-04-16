'use client'

import Image from 'next/image'
import { MapPin, Star, ArrowRight, Heart, Hotel, Compass } from 'lucide-react'
import Link from 'next/link'

interface Destination {
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
  highlight?: string
}

const destinations: Destination[] = [
  {
    id: 'siem-reap',
    name: 'Siem Reap',
    province: 'Siem Reap Province',
    tagline: 'Gateway to Angkor Wat',
    image: 'https://images.unsplash.com/photo-1578091880033-7b9b0baef249?w=600&h=420&fit=crop',
    rating: 4.9,
    reviews: 8412,
    hotels: 450,
    priceFrom: 18,
    tag: 'Most Popular',
    highlight: 'Angkor Wat'
  },
  {
    id: 'phnom-penh',
    name: 'Phnom Penh',
    province: 'Capital City',
    tagline: 'Vibrant Capital on the Mekong',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600&h=420&fit=crop',
    rating: 4.7,
    reviews: 5230,
    hotels: 620,
    priceFrom: 22,
    highlight: 'Royal Palace'
  },
  {
    id: 'sihanoukville',
    name: 'Sihanoukville',
    province: 'Preah Sihanouk Province',
    tagline: 'Pristine Beaches & Islands',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=420&fit=crop',
    rating: 4.6,
    reviews: 3980,
    hotels: 310,
    priceFrom: 25,
    tag: 'Beach Escape',
    highlight: 'Koh Rong Island'
  },
  {
    id: 'kampot',
    name: 'Kampot & Kep',
    province: 'Kampot Province',
    tagline: 'Riverside Charm & Pepper Farms',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=420&fit=crop',
    rating: 4.8,
    reviews: 2740,
    hotels: 180,
    priceFrom: 15,
    tag: 'Hidden Gem',
    highlight: 'Bokor Mountain'
  },
  {
    id: 'battambang',
    name: 'Battambang',
    province: 'Battambang Province',
    tagline: 'Colonial Architecture & Art',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=420&fit=crop',
    rating: 4.6,
    reviews: 1890,
    hotels: 140,
    priceFrom: 12,
    highlight: 'Bamboo Train'
  },
  {
    id: 'mondulkiri',
    name: 'Mondulkiri',
    province: 'Mondulkiri Province',
    tagline: 'Wild Highlands & Waterfalls',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=420&fit=crop',
    rating: 4.7,
    reviews: 1240,
    hotels: 65,
    priceFrom: 20,
    tag: 'Eco Adventure',
    highlight: 'Elephant Valley'
  },
  {
    id: 'ratanakiri',
    name: 'Ratanakiri',
    province: 'Ratanakiri Province',
    tagline: 'Volcanic Lakes & Indigenous Culture',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=420&fit=crop',
    rating: 4.7,
    reviews: 890,
    hotels: 45,
    priceFrom: 18,
    highlight: 'Yeak Lom Lake'
  },
  {
    id: 'kratie',
    name: 'Kratie',
    province: 'Kratie Province',
    tagline: 'Irrawaddy Dolphins & Mekong',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=420&fit=crop',
    rating: 4.5,
    reviews: 720,
    hotels: 38,
    priceFrom: 10,
    highlight: 'River Dolphins'
  }
]

const tagStyles: Record<string, string> = {
  'Most Popular': 'bg-[#287DFA] text-white',
  'Beach Escape': 'bg-[#0891B2] text-white',
  'Hidden Gem':   'bg-[#059669] text-white',
  'Eco Adventure':'bg-[#065F46] text-white'
}

export default function DestinationCards() {
  return (
    <section className='py-14 md:py-20 bg-[#F5F7FA]'>
      <div className='max-w-[1200px] mx-auto px-4 sm:px-6'>

        {/* Section header */}
        <div className='flex items-end justify-between mb-10'>
          <div>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-1.5 bg-[#EBF3FF] text-[#287DFA] text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-full mb-3'>
              <MapPin className='w-3 h-3' />
              Explore Cambodia
            </div>
            <h2 className='text-[1.85rem] sm:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight'>
              Popular Destinations
            </h2>
            <p className='mt-2 text-sm sm:text-base text-[#6B7280]'>
              From ancient temples to island beaches — discover every province
            </p>
          </div>
          <Link
            href='/destinations'
            className='hidden sm:flex items-center gap-1.5 text-sm font-semibold text-[#287DFA] hover:text-[#1a6ae0] transition-colors duration-200 group whitespace-nowrap'
          >
            All Provinces
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' />
          </Link>
        </div>

        {/* Cards grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5'>
          {destinations.map(dest => (
            <Link
              key={dest.id}
              href={`/province/${dest.id}`}
              className='group bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-1'
            >
              {/* Image */}
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src={dest.image}
                  alt={`${dest.name}, Cambodia`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  className='object-cover group-hover:scale-[1.06] transition-transform duration-500'
                />
                {/* Gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent' />

                {/* Wishlist */}
                <button
                  onClick={e => e.preventDefault()}
                  className='absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-[#EF4444] transition-all duration-200'
                  aria-label='Save to wishlist'
                >
                  <Heart className='w-3.5 h-3.5' />
                </button>

                {/* Tag badge */}
                {dest.tag && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagStyles[dest.tag] ?? 'bg-white/80 text-[#111827]'}`}>
                    {dest.tag}
                  </span>
                )}

                {/* Name overlay */}
                <div className='absolute bottom-0 left-0 right-0 px-3.5 pb-3.5'>
                  <h3 className='text-[15px] font-extrabold text-white leading-tight drop-shadow-sm'>
                    {dest.name}
                  </h3>
                  <div className='flex items-center gap-1 mt-0.5'>
                    <MapPin className='w-3 h-3 text-white/75' />
                    <span className='text-[11px] text-white/75 font-medium'>{dest.province}</span>
                  </div>
                </div>
              </div>

              {/* Info body */}
              <div className='p-4'>
                <p className='text-xs text-[#6B7280] mb-3 line-clamp-1'>{dest.tagline}</p>

                {/* Rating row */}
                <div className='flex items-center gap-2 mb-3'>
                  <div className='flex items-center gap-1 bg-[#287DFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md'>
                    <Star className='w-2.5 h-2.5 fill-current' />
                    {dest.rating}
                  </div>
                  <span className='text-xs text-[#9CA3AF]'>
                    {dest.reviews.toLocaleString()} reviews
                  </span>
                </div>

                {/* Price + properties */}
                <div className='flex items-center justify-between pt-3 border-t border-[#F3F4F6]'>
                  <div className='flex items-center gap-1 text-[11px] text-[#9CA3AF]'>
                    <Hotel className='w-3.5 h-3.5' />
                    <span>{dest.hotels}+ stays</span>
                  </div>
                  <div className='text-right'>
                    <span className='text-[10px] text-[#9CA3AF]'>from </span>
                    <span className='text-[15px] font-extrabold text-[#287DFA]'>${dest.priceFrom}</span>
                    <span className='text-[10px] text-[#9CA3AF]'>/night</span>
                  </div>
                </div>

                {/* Highlight pill */}
                {dest.highlight && (
                  <div className='mt-2.5 flex items-center gap-1.5 bg-[#F0F5FF] rounded-xl px-2.5 py-1.5'>
                    <Compass className='w-3 h-3 text-[#287DFA] shrink-0' />
                    <span className='text-[11px] font-semibold text-[#287DFA]'>{dest.highlight}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className='flex justify-center mt-8 sm:hidden'>
          <Link href='/destinations' className='flex items-center gap-1.5 text-sm font-semibold text-[#287DFA]'>
            View All Provinces <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
