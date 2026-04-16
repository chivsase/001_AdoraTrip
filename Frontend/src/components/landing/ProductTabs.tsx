'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Plane,
  Hotel,
  Package,
  Compass,
  Tag,
  Train,
  Car,
  ShieldCheck
} from 'lucide-react'

const categories = [
  {
    id: 'flights',
    label: 'Flights',
    icon: Plane,
    description: 'Compare 500+ airlines',
    color: '#287DFA',
    bg: '#EBF3FF',
    href: '/flights'
  },
  {
    id: 'hotels',
    label: 'Hotels',
    icon: Hotel,
    description: '1.2M+ properties',
    color: '#8B5CF6',
    bg: '#F3EEFF',
    href: '/hotels'
  },
  {
    id: 'packages',
    label: 'Packages',
    icon: Package,
    description: 'Save up to 40%',
    color: '#F59E0B',
    bg: '#FFFBEB',
    href: '/packages'
  },
  {
    id: 'attractions',
    label: 'Attractions',
    icon: Compass,
    description: '50K+ experiences',
    color: '#10B981',
    bg: '#ECFDF5',
    href: '/attractions'
  },
  {
    id: 'trains',
    label: 'Trains',
    icon: Train,
    description: 'Rail passes & tickets',
    color: '#EF4444',
    bg: '#FEF2F2',
    href: '/trains'
  },
  {
    id: 'car-rental',
    label: 'Car Rental',
    icon: Car,
    description: 'Best price guarantee',
    color: '#06B6D4',
    bg: '#ECFEFF',
    href: '/car-rental'
  },
  {
    id: 'deals',
    label: 'Deals',
    icon: Tag,
    description: 'Exclusive savings',
    color: '#F97316',
    bg: '#FFF7ED',
    href: '/deals'
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: ShieldCheck,
    description: 'Travel worry-free',
    color: '#64748B',
    bg: '#F8FAFC',
    href: '/insurance'
  }
]

export default function ProductTabs() {
  const pathname = usePathname()

  return (
    <section className='py-10 md:py-14 bg-white'>
      <div className='max-w-[1200px] mx-auto px-4'>
        <h2 className='text-2xl sm:text-3xl font-bold text-[#1A1A2E] text-center mb-2'>
          What are you looking for?
        </h2>
        <p className='text-sm sm:text-base text-[#666B7A] text-center mb-8 md:mb-10'>
          Everything you need for a perfect trip, all in one place
        </p>

        <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4'>
          {categories.map(cat => {
            const isActive = pathname.startsWith(cat.href)

            return (
              <Link
                key={cat.id}
                href={cat.href}
                className={`group flex flex-col items-center p-4 sm:p-5 rounded-2xl border transition-all duration-250 cursor-pointer
                  ${isActive
                    ? 'bg-white border-[#287DFA]/30 shadow-[0_4px_16px_rgba(40,125,250,0.12)]'
                    : 'border-transparent bg-[#F8F9FA] hover:bg-white hover:border-[#E8E8ED] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]'
                  }`}
              >
                <div
                  className='w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform duration-250 group-hover:scale-110'
                  style={{
                    backgroundColor: isActive ? cat.bg : cat.bg,
                    color: cat.color
                  }}
                >
                  <cat.icon className='w-6 h-6' />
                </div>
                <span
                  className='text-sm font-semibold mb-0.5 transition-colors duration-200'
                  style={{ color: isActive ? cat.color : '#1A1A2E' }}
                >
                  {cat.label}
                </span>
                <span className='text-[10px] text-[#9CA3AF] leading-tight text-center hidden sm:block'>
                  {cat.description}
                </span>
                {/* Active indicator dot */}
                {isActive && (
                  <span
                    className='mt-2 w-1.5 h-1.5 rounded-full'
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
