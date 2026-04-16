'use client'

import Image from 'next/image'
import { MapPin, Star, ArrowRight, Heart } from 'lucide-react'
import Link from 'next/link'

interface Destination {
  id: string
  name: string
  country: string
  image: string
  rating: number
  reviews: number
  priceFrom: number
  tag?: string
}

const destinations: Destination[] = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    rating: 4.8,
    reviews: 12450,
    priceFrom: 299,
    tag: 'Popular'
  },
  {
    id: '2',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    rating: 4.9,
    reviews: 9823,
    priceFrom: 459,
    tag: 'Trending'
  },
  {
    id: '3',
    name: 'Bali',
    country: 'Indonesia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
    rating: 4.7,
    reviews: 8741,
    priceFrom: 189,
    tag: 'Best Value'
  },
  {
    id: '4',
    name: 'New York',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop',
    rating: 4.6,
    reviews: 15230,
    priceFrom: 199
  },
  {
    id: '5',
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=400&fit=crop',
    rating: 4.8,
    reviews: 7234,
    priceFrom: 349,
    tag: 'Luxury'
  },
  {
    id: '6',
    name: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=400&fit=crop',
    rating: 4.7,
    reviews: 11890,
    priceFrom: 279
  },
  {
    id: '7',
    name: 'Sydney',
    country: 'Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop',
    rating: 4.6,
    reviews: 6543,
    priceFrom: 529
  },
  {
    id: '8',
    name: 'Maldives',
    country: 'Maldives',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=400&fit=crop',
    rating: 4.9,
    reviews: 4321,
    priceFrom: 699,
    tag: 'Luxury'
  }
]

const tagStyles: Record<string, string> = {
  Popular: 'bg-[#287DFA] text-white',
  Trending: 'bg-[#EF4444] text-white',
  'Best Value': 'bg-[#10B981] text-white',
  Luxury: 'bg-[#FFB400] text-[#1A1A2E]'
}

export default function DestinationCards() {
  return (
    <section className='py-10 md:py-14 bg-[#F8F9FA]'>
      <div className='max-w-[1200px] mx-auto px-4'>
        {/* Section header */}
        <div className='flex items-end justify-between mb-8'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-bold text-[#1A1A2E]'>Popular Destinations</h2>
            <p className='text-sm sm:text-base text-[#666B7A] mt-1'>
              Explore the world&apos;s most loved travel spots
            </p>
          </div>
          <Link
            href='/destinations'
            className='hidden sm:flex items-center gap-1 text-sm font-semibold text-[#287DFA] hover:text-[#1a6ae0] transition-colors duration-200 group'
          >
            View All
            <ArrowRight className='w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200' />
          </Link>
        </div>

        {/* Cards grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5'>
          {destinations.map(dest => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.id}`}
              className='group bg-white rounded-2xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300'
            >
              {/* Image container */}
              <div className='relative h-48 overflow-hidden'>
                <Image
                  src={dest.image}
                  alt={`${dest.name}, ${dest.country}`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  className='object-cover group-hover:scale-105 transition-transform duration-500'
                />
                {/* Gradient overlay */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent' />

                {/* Wishlist button */}
                <button
                  onClick={e => e.preventDefault()}
                  className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white hover:text-[#EF4444] transition-all duration-200'
                  aria-label='Save to wishlist'
                >
                  <Heart className='w-4 h-4' />
                </button>

                {/* Tag badge */}
                {dest.tag && (
                  <span
                    className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${tagStyles[dest.tag] ?? 'bg-white/80 text-[#1A1A2E]'}`}
                  >
                    {dest.tag}
                  </span>
                )}

                {/* Location overlay */}
                <div className='absolute bottom-3 left-3 flex items-center gap-1 text-white'>
                  <MapPin className='w-3.5 h-3.5' />
                  <span className='text-xs font-medium drop-shadow'>{dest.country}</span>
                </div>
              </div>

              {/* Info */}
              <div className='p-4'>
                <h3 className='text-base font-bold text-[#1A1A2E] group-hover:text-[#287DFA] transition-colors duration-200'>
                  {dest.name}
                </h3>

                {/* Rating */}
                <div className='flex items-center gap-1.5 mt-1.5'>
                  <div className='flex items-center gap-0.5 bg-[#287DFA] text-white text-[10px] font-bold px-1.5 py-0.5 rounded'>
                    <Star className='w-2.5 h-2.5 fill-current' />
                    {dest.rating}
                  </div>
                  <span className='text-xs text-[#9CA3AF]'>{dest.reviews.toLocaleString()} reviews</span>
                </div>

                {/* Price */}
                <div className='mt-3 flex items-baseline gap-1'>
                  <span className='text-xs text-[#9CA3AF]'>From</span>
                  <span className='text-lg font-extrabold text-[#287DFA]'>${dest.priceFrom}</span>
                  <span className='text-xs text-[#9CA3AF]'>/ person</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile "View all" link */}
        <div className='flex justify-center mt-6 sm:hidden'>
          <Link
            href='/destinations'
            className='flex items-center gap-1.5 text-sm font-semibold text-[#287DFA] hover:text-[#1a6ae0]'
          >
            View All Destinations
            <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
