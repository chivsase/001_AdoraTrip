'use client'

import Link from 'next/link'
import { Plane, Search, Globe, User, Building2, Headphones, ClipboardList, Smartphone, Menu, Bell } from 'lucide-react'

interface TopBarProps {
  onMenuToggle: () => void
}

export default function TopBar({ onMenuToggle }: TopBarProps) {
  return (
    <header className='sticky top-0 z-50 bg-white border-b border-[#E8E8ED] shadow-[0_1px_3px_rgba(0,0,0,0.06)]'>
      <div className='flex items-center h-[52px] px-3 sm:px-4 gap-2 sm:gap-3'>

        {/* ── Mobile hamburger ── */}
        <button
          onClick={onMenuToggle}
          className='lg:hidden flex items-center justify-center w-9 h-9 -ml-1 rounded-xl text-[#4A4A5A] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'
          aria-label='Toggle sidebar menu'
        >
          <Menu className='w-5 h-5' />
        </button>

        {/* ── Logo ── */}
        <Link href='/' className='flex items-center gap-1.5 shrink-0 mr-1'>
          <div className='w-7 h-7 bg-[#287DFA] rounded-lg flex items-center justify-center'>
            <Plane className='w-3.5 h-3.5 text-white -rotate-45' />
          </div>
          <span className='text-[15px] font-extrabold tracking-tight hidden sm:inline'>
            <span className='text-[#1A1A2E]'>Adora</span>
            <span className='text-[#287DFA]'>Trip</span>
          </span>
        </Link>

        {/* ── Global search bar ── */}
        <div className='flex-1 max-w-[480px] hidden md:block'>
          <div className='relative group'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200' />
            <input
              type='search'
              placeholder='Search destinations, hotels, flights…'
              className='w-full pl-9 pr-4 py-[7px] text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-full
                focus:outline-none focus:ring-2 focus:ring-[#287DFA]/25 focus:border-[#287DFA] focus:bg-white
                hover:border-[#C8CCD8]
                transition-all duration-200 placeholder-[#9CA3AF]'
            />
          </div>
        </div>

        {/* ── Spacer ── */}
        <div className='flex-1' />

        {/* ── Utility links (desktop) ── */}
        <nav className='hidden lg:flex items-center gap-0.5 text-[11px] text-[#555B6E]'>
          <Link
            href='/app'
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 font-medium'
          >
            <Smartphone className='w-3.5 h-3.5' />
            App
          </Link>
          <Link
            href='/list-property'
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 font-medium'
          >
            <Building2 className='w-3.5 h-3.5' />
            List your property
          </Link>
          <button className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 font-medium'>
            <Globe className='w-3.5 h-3.5' />
            USD
          </button>
          <Link
            href='/support'
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 font-medium'
          >
            <Headphones className='w-3.5 h-3.5' />
            Support
          </Link>
          <Link
            href='/bookings'
            className='flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 font-medium'
          >
            <ClipboardList className='w-3.5 h-3.5' />
            Find bookings
          </Link>
        </nav>

        {/* ── Right icons cluster ── */}
        <div className='flex items-center gap-1'>
          {/* Mobile search */}
          <button className='md:hidden flex items-center justify-center w-9 h-9 rounded-xl text-[#4A4A5A] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200'>
            <Search className='w-5 h-5' />
          </button>

          {/* Notification bell — desktop */}
          <button className='hidden lg:flex items-center justify-center w-8 h-8 rounded-xl text-[#4A4A5A] hover:bg-[#F0F5FF] hover:text-[#287DFA] transition-all duration-200 relative'>
            <Bell className='w-4.5 h-4.5' />
            <span className='absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full border-2 border-white' />
          </button>

          {/* Sign In */}
          <Link
            href='/login'
            className='flex items-center gap-1.5 bg-[#287DFA] hover:bg-[#1a6ae0] active:bg-[#1560c7] text-white text-[11px] font-bold px-3.5 py-[7px] rounded-full transition-all duration-200 shadow-[0_2px_8px_rgba(40,125,250,0.30)] hover:shadow-[0_4px_12px_rgba(40,125,250,0.40)] shrink-0'
          >
            <User className='w-3.5 h-3.5' />
            <span className='hidden sm:inline'>Sign In</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
