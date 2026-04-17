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
    image: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&h=420&fit=crop',
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
    <section className='py-16 md:py-24 bg-[#F8FAFC]'>
      <div className='max-w-[1240px] mx-auto px-4 sm:px-6'>

        {/* Section header */}
        <div className='flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4'>
          <div className='animate-in fade-in slide-in-from-left-6 duration-1000 fill-mode-both'>
            {/* Eyebrow */}
            <div className='inline-flex items-center gap-2 bg-[#E0EDFF] text-[#287DFA] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4'>
              <MapPin className='w-3 h-3' />
              Explore the Kingdom
            </div>
            <h2 className='text-[2rem] sm:text-4xl font-[900] text-[#0F172A] tracking-tight leading-tight'>
              Popular Destinations
            </h2>
            <p className='mt-3 text-base text-[#64748B] max-w-lg'>
              Discover the breathtaking beauty of Cambodia's provinces, 
              from timeless heritage sites to pristine coastal escapes.
            </p>
          </div>
          <Link
            href='/destinations'
            className='flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-[#287DFA] bg-white border border-[#E2E8F0] hover:bg-[#287DFA] hover:text-white hover:border-[#287DFA] shadow-sm transition-all duration-300 group whitespace-nowrap animate-in fade-in slide-in-from-right-6 duration-1000 fill-mode-both'
          >
            All Provinces
            <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-300' />
          </Link>
        </div>

        {/* Cards grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6'>
          {destinations.map((dest, idx) => (
            <Link
              key={dest.id}
              href={`/province/${dest.id}`}
              className='group relative bg-white rounded-3xl overflow-hidden border border-[#F1F5F9] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2 animate-in fade-in zoom-in-95 duration-700 fill-mode-both'
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Image Container */}
              <div className='relative h-56 overflow-hidden'>
                <Image
                  src={dest.image}
                  alt={`${dest.name}, Cambodia`}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                  className='object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                />
                
                {/* Refined Overlays */}
                <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90' />
                
                {/* Interactive Heart */}
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                  className='absolute top-4 right-4 w-9 h-9 rounded-full bg-black/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-[#EF4444] transition-all duration-300 group/heart scale-90 hover:scale-100'
                >
                  <Heart className='w-4 h-4 transition-transform group-hover/heart:scale-110' />
                </button>

                {/* Tags */}
                {dest.tag && (
                  <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/10 ${tagStyles[dest.tag] ?? 'bg-white/90 text-[#0F172A]'}`}>
                    {dest.tag}
                  </span>
                )}

                {/* Bottom Details Overlay */}
                <div className='absolute bottom-0 left-0 right-0 p-5'>
                  <div className='flex items-center gap-1.5 mb-1'>
                    <MapPin className='w-3 h-3 text-[#FFD166]' />
                    <span className='text-[10px] text-white/80 font-bold uppercase tracking-wider'>{dest.province}</span>
                  </div>
                  <h3 className='text-lg font-black text-white leading-tight'>
                    {dest.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className='p-6'>
                <p className='text-[13px] text-[#64748B] mb-4 line-clamp-1 font-medium italic'>"{dest.tagline}"</p>

                <div className='flex items-center justify-between mb-5'>
                  <div className='flex items-center gap-1.5'>
                    <div className='flex items-center gap-1 bg-[#287DFA]/10 text-[#287DFA] text-[11px] font-black px-2 py-1 rounded-lg'>
                      <Star className='w-3 h-3 fill-current' />
                      {dest.rating}
                    </div>
                    <span className='text-[11px] text-[#94A3B8] font-semibold'>
                      ({dest.reviews.toLocaleString()})
                    </span>
                  </div>
                  
                  <div className='flex items-center gap-1 text-[11px] text-[#64748B] font-bold'>
                    <Hotel className='w-3.5 h-3.5 text-[#287DFA]' />
                    <span>{dest.hotels}+ stays</span>
                  </div>
                </div>

                <div className='flex items-center justify-between pt-5 border-t border-[#F1F5F9]'>
                  <div className='flex flex-col'>
                    <span className='text-[10px] text-[#94A3B8] font-bold uppercase tracking-tighter'>Starting from</span>
                    <div className='flex items-baseline gap-0.5'>
                      <span className='text-xl font-black text-[#0F172A]'>${dest.priceFrom}</span>
                      <span className='text-[10px] text-[#64748B] font-bold'>/ night</span>
                    </div>
                  </div>
                  
                  <div className='w-10 h-10 rounded-xl bg-[#F1F5F9] group-hover:bg-[#287DFA] flex items-center justify-center text-[#94A3B8] group-hover:text-white transition-all duration-500'>
                    <ArrowRight className='w-5 h-5' />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {/* Mobile CTA */}
        <div className='flex justify-center mt-12 sm:hidden'>
          <Link href='/destinations' className='flex items-center gap-2 text-sm font-bold text-[#287DFA] bg-[#E0EDFF] px-6 py-3 rounded-xl'>
            View All Provinces <ArrowRight className='w-4 h-4' />
          </Link>
        </div>
      </div>
    </section>
  )
}
