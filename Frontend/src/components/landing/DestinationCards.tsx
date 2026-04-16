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
  'Beach Escape': 'bg-[#06B6D4] text-white',
  'Hidden Gem': 'bg-[#10B981] text-white',
  'Eco Adventure': 'bg-[#059669] text-white'
}

export default function DestinationCards() {
  return (
    <section className='py-10 md:py-14 bg-[#F8F9FA]'>
      <div className='max-w-[1080px] mx-auto px-4'>

        {/* Section header */}
        <div className='flex items-end justify-between mb-8'>
          <div>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-xl'>🇰🇭</span>
              <h2 className='text-2xl sm:text-3xl font-extrabold text-[#1A1A2E]'>
                Explore Cambodia
              </h2>
            </div>
            <p className='text-sm sm:text-base text-[#666B7A]'>
              Discover stunning provinces — from ancient temples to island beaches
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
              className='group bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1'
            >
              {/* Image */}
              <div className='relative h-44 overflow-hidden'>
                <Image
                  src={dest.image}
                  alt={`${dest.name}, Cambodia`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  className='object-cover group-hover:scale-105 transition-transform duration-500'
                />
                {/* Gradient */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent' />

                {/* Wishlist */}
                <button
                  onClick={e => e.preventDefault()}
                  className='absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-[#EF4444] transition-all duration-200'
                  aria-label='Save to wishlist'
                >
                  <Heart className='w-3.5 h-3.5' />
                </button>

                {/* Tag badge */}
                {dest.tag && (
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${tagStyles[dest.tag] ?? 'bg-white/80 text-[#1A1A2E]'}`}>
                    {dest.tag}
                  </span>
                )}

                {/* Bottom info overlay */}
                <div className='absolute bottom-0 left-0 right-0 px-3 pb-3'>
                  <h3 className='text-base font-extrabold text-white leading-tight drop-shadow'>
                    {dest.name}
                  </h3>
                  <div className='flex items-center gap-1 mt-0.5'>
                    <MapPin className='w-3 h-3 text-white/80' />
                    <span className='text-[11px] text-white/80 font-medium'>{dest.province}</span>
                  </div>
                </div>
              </div>

              {/* Info body */}
              <div className='p-3.5'>
                {/* Tagline */}
                <p className='text-xs text-[#666B7A] mb-2.5 line-clamp-1'>{dest.tagline}</p>

                {/* Rating row */}
                <div className='flex items-center gap-1.5 mb-2.5'>
                  <div className='flex items-center gap-0.5 bg-[#287DFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md'>
                    <Star className='w-2.5 h-2.5 fill-current' />
                    {dest.rating}
                  </div>
                  <span className='text-xs text-[#9CA3AF]'>
                    {dest.reviews.toLocaleString()} reviews
                  </span>
                </div>

                {/* Stats row */}
                <div className='flex items-center justify-between pt-2.5 border-t border-[#F0F0F5]'>
                  <div className='flex items-center gap-1 text-[11px] text-[#8A92A6]'>
                    <Hotel className='w-3.5 h-3.5' />
                    <span>{dest.hotels}+ properties</span>
                  </div>
                  <div className='text-right'>
                    <span className='text-[10px] text-[#9CA3AF]'>from </span>
                    <span className='text-sm font-extrabold text-[#287DFA]'>${dest.priceFrom}</span>
                    <span className='text-[10px] text-[#9CA3AF]'>/night</span>
                  </div>
                </div>

                {/* Highlight pill */}
                {dest.highlight && (
                  <div className='mt-2 flex items-center gap-1 bg-[#F0F5FF] rounded-lg px-2 py-1.5'>
                    <Compass className='w-3 h-3 text-[#287DFA] shrink-0' />
                    <span className='text-[11px] font-medium text-[#287DFA]'>{dest.highlight}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className='flex justify-center mt-6 sm:hidden'>
          <Link href='/destinations' className='flex items-center gap-1.5 text-sm font-semibold text-[#287DFA]'>
            View All Provinces <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
