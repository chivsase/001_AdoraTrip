'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plane,
  Hotel,
  Train,
  Car,
  Compass,
  Tag,
  Globe,
  User,
  Menu,
  X,
  Phone,
  Building2,
  ChevronRight,
  Smartphone,
  Search,
  Headphones,
  ClipboardList
} from 'lucide-react'

const productTabs = [
  { label: 'Hotels & Homes', icon: Hotel, href: '/hotels' },
  { label: 'Flights', icon: Plane, href: '/flights' },
  { label: 'Trains', icon: Train, href: '/trains' },
  { label: 'Cars', icon: Car, href: '/car-rental' },
  { label: 'Attractions & Tours', icon: Compass, href: '/attractions' },
  { label: 'Flight + Hotel', icon: Building2, href: '/packages' }
]

const drawerNavItems = [
  { label: 'Hotels & Homes', icon: Hotel, href: '/hotels' },
  { label: 'Flights', icon: Plane, href: '/flights' },
  { label: 'Flight + Hotel', icon: Building2, href: '/packages' },
  { label: 'Trains', icon: Train, href: '/trains' },
  { label: 'Cars', icon: Car, href: '/car-rental' },
  { label: 'Attractions & Tours', icon: Compass, href: '/attractions' },
  { label: 'Deals', icon: Tag, href: '/deals' }
]

export default function Header() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <>
      <header className='sticky top-0 z-50 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)]'>
        {/* Top utility bar — desktop only (matches Trip.com top strip) */}
        <div className='hidden lg:block bg-[#F8F9FA] border-b border-[#E8E8ED]'>
          <div className='max-w-[1200px] mx-auto px-4 flex items-center justify-between h-9'>
            {/* Logo in top bar */}
            <Link href='/' className='flex items-center gap-1.5 group'>
              <div className='w-6 h-6 bg-[#287DFA] rounded-md flex items-center justify-center group-hover:bg-[#1a6ae0] transition-colors duration-200'>
                <Plane className='w-3.5 h-3.5 text-white -rotate-45' />
              </div>
              <span className='text-sm font-bold tracking-tight'>
                <span className='text-[#1A1A2E]'>Adora</span>
                <span className='text-[#287DFA]'>Trip</span>
              </span>
            </Link>

            {/* Right utility links */}
            <div className='flex items-center gap-1 text-xs text-[#666B7A]'>
              <Link
                href='/app'
                className='flex items-center gap-1 px-2.5 py-1 rounded hover:text-[#287DFA] hover:bg-white transition-all duration-200'
              >
                <Smartphone className='w-3 h-3' />
                App
              </Link>
              <Link
                href='/list-property'
                className='flex items-center gap-1 px-2.5 py-1 rounded hover:text-[#287DFA] hover:bg-white transition-all duration-200'
              >
                <Building2 className='w-3 h-3' />
                List your property
              </Link>
              <Link
                href='/support'
                className='flex items-center gap-1 px-2.5 py-1 rounded hover:text-[#287DFA] hover:bg-white transition-all duration-200'
              >
                <Headphones className='w-3 h-3' />
                Customer support
              </Link>
              <Link
                href='/bookings'
                className='flex items-center gap-1 px-2.5 py-1 rounded hover:text-[#287DFA] hover:bg-white transition-all duration-200'
              >
                <ClipboardList className='w-3 h-3' />
                Find bookings
              </Link>
              <span className='w-px h-3.5 bg-[#E8E8ED] mx-1' />
              <button className='flex items-center gap-1 px-2.5 py-1 rounded hover:text-[#287DFA] hover:bg-white transition-all duration-200'>
                <Globe className='w-3 h-3' />
                EN / USD
              </button>
              <span className='w-px h-3.5 bg-[#E8E8ED] mx-1' />
              <Link
                href='/login'
                className='flex items-center gap-1 px-2.5 py-1 rounded font-semibold text-[#287DFA] hover:bg-white transition-all duration-200'
              >
                <User className='w-3 h-3' />
                Sign in / Register
              </Link>
            </div>
          </div>
        </div>

        {/* Desktop product tabs row (below utility bar) */}
        <div className='hidden lg:block border-b border-[#F0F0F5]'>
          <div className='max-w-[1200px] mx-auto px-4'>
            <nav className='flex items-center gap-0 h-12'>
              {productTabs.map(tab => (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className='relative flex items-center gap-1.5 px-4 h-full text-[13px] font-medium text-[#4A4A5A] hover:text-[#287DFA] transition-colors duration-200 group'
                >
                  <tab.icon className='w-4 h-4' />
                  {tab.label}
                  {/* Active underline on hover */}
                  <span className='absolute bottom-0 left-2 right-2 h-[2px] bg-[#287DFA] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-center rounded-full' />
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile header bar */}
        <div className='lg:hidden'>
          <div className='flex items-center justify-between h-14 px-4'>
            {/* Left: hamburger + logo */}
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setDrawerOpen(true)}
                className='p-1.5 -ml-1.5 text-[#4A4A5A] hover:text-[#287DFA] rounded-lg transition-colors duration-200'
                aria-label='Open navigation menu'
              >
                <Menu className='w-6 h-6' />
              </button>
              <Link href='/' className='flex items-center gap-1.5'>
                <div className='w-8 h-8 bg-[#287DFA] rounded-lg flex items-center justify-center'>
                  <Plane className='w-4 h-4 text-white -rotate-45' />
                </div>
                <span className='text-lg font-bold tracking-tight'>
                  <span className='text-[#1A1A2E]'>Adora</span>
                  <span className='text-[#287DFA]'>Trip</span>
                </span>
              </Link>
            </div>

            {/* Right: search + sign in */}
            <div className='flex items-center gap-1'>
              <button className='p-2 text-[#4A4A5A] hover:text-[#287DFA] rounded-lg transition-colors duration-200'>
                <Search className='w-5 h-5' />
              </button>
              <Link
                href='/login'
                className='flex items-center gap-1 text-xs font-semibold text-white bg-[#287DFA] hover:bg-[#1a6ae0] px-3 py-1.5 rounded-lg transition-colors duration-200'
              >
                <User className='w-3.5 h-3.5' />
                <span className='hidden sm:inline'>Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── Left-side drawer (Trip.com mobile style) ── */}
      <div
        className={`lg:hidden fixed inset-0 z-[100] transition-visibility duration-300 ${
          drawerOpen ? 'visible' : 'invisible'
        }`}
        role='dialog'
        aria-modal='true'
        aria-label='Navigation menu'
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            drawerOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Left drawer panel */}
        <div
          className={`absolute top-0 left-0 w-[300px] max-w-[85vw] h-full bg-white shadow-[4px_0_24px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out flex flex-col ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Drawer header — user area */}
          <div className='bg-gradient-to-br from-[#287DFA] to-[#1a6ae0] px-5 pt-12 pb-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 rounded-full bg-white/20 flex items-center justify-center'>
                  <User className='w-6 h-6 text-white' />
                </div>
                <div>
                  <p className='text-white font-semibold text-sm'>Welcome!</p>
                  <Link
                    href='/login'
                    className='text-white/80 text-xs hover:text-white transition-colors'
                    onClick={() => setDrawerOpen(false)}
                  >
                    Sign in / Register →
                  </Link>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className='p-1 text-white/70 hover:text-white rounded-lg transition-colors'
                aria-label='Close menu'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </div>

          {/* Drawer nav items */}
          <div className='flex-1 overflow-y-auto'>
            <nav className='py-2'>
              {drawerNavItems.map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  className='flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#1A1A2E] hover:bg-[#F0F5FF] active:bg-[#E0ECFF] transition-colors duration-150'
                  onClick={() => setDrawerOpen(false)}
                >
                  <div className='flex items-center gap-3'>
                    <item.icon className='w-5 h-5 text-[#287DFA]' />
                    {item.label}
                  </div>
                  <ChevronRight className='w-4 h-4 text-[#C8CCD8]' />
                </Link>
              ))}
            </nav>

            <div className='mx-5 border-t border-[#F0F0F5]' />

            {/* Utility links */}
            <div className='py-2'>
              <Link
                href='/list-property'
                className='flex items-center justify-between px-5 py-3.5 text-sm text-[#4A4A5A] hover:bg-[#F0F5FF] transition-colors duration-150'
                onClick={() => setDrawerOpen(false)}
              >
                <div className='flex items-center gap-3'>
                  <Building2 className='w-5 h-5 text-[#9CA3AF]' />
                  List your property
                </div>
                <ChevronRight className='w-4 h-4 text-[#C8CCD8]' />
              </Link>
              <Link
                href='/support'
                className='flex items-center justify-between px-5 py-3.5 text-sm text-[#4A4A5A] hover:bg-[#F0F5FF] transition-colors duration-150'
                onClick={() => setDrawerOpen(false)}
              >
                <div className='flex items-center gap-3'>
                  <Headphones className='w-5 h-5 text-[#9CA3AF]' />
                  Customer support
                </div>
                <ChevronRight className='w-4 h-4 text-[#C8CCD8]' />
              </Link>
              <Link
                href='/app'
                className='flex items-center justify-between px-5 py-3.5 text-sm text-[#4A4A5A] hover:bg-[#F0F5FF] transition-colors duration-150'
                onClick={() => setDrawerOpen(false)}
              >
                <div className='flex items-center gap-3'>
                  <Smartphone className='w-5 h-5 text-[#9CA3AF]' />
                  Download App
                </div>
                <ChevronRight className='w-4 h-4 text-[#C8CCD8]' />
              </Link>
              <button className='flex items-center justify-between w-full px-5 py-3.5 text-sm text-[#4A4A5A] hover:bg-[#F0F5FF] transition-colors duration-150'>
                <div className='flex items-center gap-3'>
                  <Globe className='w-5 h-5 text-[#9CA3AF]' />
                  Language / Currency
                </div>
                <span className='text-xs text-[#9CA3AF]'>EN / USD</span>
              </button>
            </div>
          </div>

          {/* Drawer footer */}
          <div className='border-t border-[#F0F0F5] px-5 py-4'>
            <Link
              href='/bookings'
              className='flex items-center justify-center gap-2 w-full text-sm font-semibold text-[#287DFA] border border-[#287DFA] py-2.5 rounded-xl hover:bg-[#F0F5FF] transition-colors duration-200'
              onClick={() => setDrawerOpen(false)}
            >
              <ClipboardList className='w-4 h-4' />
              Find my bookings
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
