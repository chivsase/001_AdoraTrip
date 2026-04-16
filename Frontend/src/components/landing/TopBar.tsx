'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plane, Search, Globe, User, Building2, Headphones, ClipboardList, Smartphone, Menu, Bell } from 'lucide-react'

interface TopBarProps {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 6)
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled
          ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
          : 'border-b border-[#EBEEF3]'
      }`}
    >
      <div className='flex items-center h-14 px-3 sm:px-5 gap-2 sm:gap-3'>

        {/* Mobile hamburger */}
        <button
          onClick={onMenuToggle}
          className='lg:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-xl text-[#6B7280] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          aria-label='Toggle sidebar menu'
        >
          <Menu className='w-5 h-5' />
        </button>

        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 shrink-0 mr-2 group'>
          <div className='w-8 h-8 bg-gradient-to-br from-[#3B8EFF] to-[#1254CC] rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(40,125,250,0.32)] group-hover:shadow-[0_4px_16px_rgba(40,125,250,0.42)] transition-shadow duration-200'>
            <Plane className='w-[15px] h-[15px] text-white -rotate-45' />
          </div>
          <span className='text-[16px] font-extrabold tracking-tight hidden sm:inline'>
            <span className='text-[#111827]'>Adora</span>
            <span className='text-[#287DFA]'>Trip</span>
          </span>
        </Link>

        {/* Global search bar */}
        <div className='flex-1 max-w-[460px] hidden md:block'>
          <div className='relative group'>
            <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200 pointer-events-none' />
            <input
              type='search'
              placeholder='Search destinations, hotels, tours…'
              className='w-full pl-10 pr-4 py-2 text-[13px] bg-[#F3F5FA] border border-transparent rounded-full
                focus:outline-none focus:ring-2 focus:ring-[#287DFA]/20 focus:border-[#287DFA]/50 focus:bg-white
                hover:bg-[#ECEEF4]
                transition-all duration-200 placeholder-[#9CA3AF] text-[#111827]'
            />
          </div>
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Desktop utility links */}
        <nav className='hidden lg:flex items-center gap-0.5 text-[11.5px] font-medium text-[#52596B]'>
          <Link
            href='/app'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          >
            <Smartphone className='w-3.5 h-3.5' />
            App
          </Link>
          <Link
            href='/list-property'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          >
            <Building2 className='w-3.5 h-3.5' />
            List property
          </Link>
          <button className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'>
            <Globe className='w-3.5 h-3.5' />
            USD
          </button>
          <Link
            href='/support'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          >
            <Headphones className='w-3.5 h-3.5' />
            Support
          </Link>
          <Link
            href='/bookings'
            className='flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          >
            <ClipboardList className='w-3.5 h-3.5' />
            Bookings
          </Link>
        </nav>

        {/* Right action cluster */}
        <div className='flex items-center gap-1'>
          {/* Mobile search */}
          <button className='md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#6B7280] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'>
            <Search className='w-5 h-5' />
          </button>

          {/* Notification bell — desktop */}
          <button className='hidden lg:flex items-center justify-center w-9 h-9 rounded-xl text-[#6B7280] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 relative'>
            <Bell className='w-[18px] h-[18px]' />
            <span className='absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-[#EF4444] rounded-full border-[1.5px] border-white' />
          </button>

          {/* Divider */}
          <div className='hidden lg:block w-px h-5 bg-[#E5E7EB] mx-1' />

          {/* Sign In */}
          <Link
            href='/login'
            className='flex items-center gap-1.5 bg-[#287DFA] hover:bg-[#1a6ae0] active:bg-[#155cc7] text-white text-[12.5px] font-semibold px-4 py-[7px] rounded-xl transition-all duration-200 shadow-[0_2px_10px_rgba(40,125,250,0.32)] hover:shadow-[0_4px_16px_rgba(40,125,250,0.42)] shrink-0'
          >
            <User className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
