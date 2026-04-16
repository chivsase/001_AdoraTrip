'use client'

import { useState, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import {
  Plane,
  Hotel,
  Train,
  Package,
  MapPin,
  CalendarDays,
  Users,
  Search,
  ArrowLeftRight,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react'

const searchTabs = [
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'hotels', label: 'Hotels', icon: Hotel },
  { id: 'packages', label: 'Flights + Hotels', icon: Package },
  { id: 'trains', label: 'Trains', icon: Train }
]

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState('flights')

  return (
    <section className='relative min-h-[520px] sm:min-h-[500px] md:min-h-[480px] overflow-hidden'>
      {/* Background gradient */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#0B3D91] via-[#287DFA] to-[#5BA3FF]'>
        <div className='absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full bg-white/5' />
        <div className='absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full bg-white/5' />
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.03]' />
      </div>

      {/* Hero content */}
      <div className='relative z-10 max-w-[1200px] mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20 md:pt-16'>
        {/* Headline */}
        <div className='text-center mb-8 md:mb-10'>
          <h1 className='text-3xl sm:text-4xl md:text-[44px] font-extrabold text-white leading-tight tracking-tight'>
            Explore the World with <span className='text-[#FFB400]'>AdoraTrip</span>
          </h1>
          <p className='mt-3 text-base sm:text-lg text-white/80 max-w-xl mx-auto'>
            Best prices on flights, hotels, and vacation packages — trusted by millions.
          </p>
        </div>

        {/* Search card */}
        <div className='max-w-[900px] mx-auto'>
          {/* Tabs */}
          <div className='flex gap-0.5 bg-white/10 backdrop-blur-sm rounded-t-2xl p-1'>
            {searchTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'bg-white text-[#287DFA] shadow-md'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <tab.icon className='w-4 h-4' />
                <span className='hidden sm:inline'>{tab.label}</span>
                <span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Search form card */}
          <div className='bg-white rounded-b-2xl rounded-tr-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] p-4 sm:p-6'>
            {activeTab === 'flights' && <FlightSearchForm />}
            {activeTab === 'hotels' && <HotelSearchForm />}
            {activeTab === 'packages' && <PackageSearchForm />}
            {activeTab === 'trains' && <TrainSearchForm />}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────── Flight form */
function FlightSearchForm() {
  const [tripType, setTripType] = useState<'round' | 'one' | 'multi'>('round')

  return (
    <div>
      {/* Trip type selector */}
      <div className='flex gap-4 mb-4 text-sm'>
        {(['round', 'one', 'multi'] as const).map(type => (
          <label key={type} className='flex items-center gap-1.5 cursor-pointer group'>
            <span
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors duration-200
                ${tripType === type ? 'border-[#287DFA]' : 'border-[#C8CCD8] group-hover:border-[#287DFA]/50'}`}
            >
              {tripType === type && <span className='w-2 h-2 rounded-full bg-[#287DFA]' />}
            </span>
            <span className={`${tripType === type ? 'text-[#287DFA] font-semibold' : 'text-[#4A4A5A]'}`}>
              {type === 'round' ? 'Round Trip' : type === 'one' ? 'One Way' : 'Multi-City'}
            </span>
            <input
              type='radio'
              name='trip-type'
              value={type}
              checked={tripType === type}
              onChange={() => setTripType(type)}
              className='sr-only'
            />
          </label>
        ))}
      </div>

      {/* Search fields — responsive grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {/* Row 1: From / Swap / To */}
        <div className='sm:col-span-2 grid grid-cols-[1fr_auto_1fr] items-end gap-2'>
          <SearchField icon={MapPin} label='From' placeholder='City or Airport' defaultValue='New York (JFK)' />
          <button className='flex items-center justify-center w-10 h-10 rounded-full border-2 border-[#E8E8ED] hover:border-[#287DFA] hover:bg-[#EBF3FF] text-[#9CA3AF] hover:text-[#287DFA] transition-all duration-200 self-end mb-0.5 shrink-0'>
            <ArrowLeftRight className='w-4 h-4' />
          </button>
          <SearchField icon={MapPin} label='To' placeholder='City or Airport' defaultValue='London (LHR)' />
        </div>

        {/* Row 2: Dates + Guests + Search */}
        <SearchField icon={CalendarDays} label='Depart' placeholder='Select date' defaultValue='Apr 25, 2026' />
        {tripType === 'round' ? (
          <SearchField icon={CalendarDays} label='Return' placeholder='Select date' defaultValue='May 02, 2026' />
        ) : (
          <GuestPicker />
        )}

        {tripType === 'round' && (
          <>
            <GuestPicker />
            <SearchButton />
          </>
        )}
        {tripType !== 'round' && <SearchButton />}
      </div>

      {/* Quick filter chips */}
      <div className='flex flex-wrap gap-2 mt-4'>
        {['Direct Flights', 'Economy', 'Business Class', 'First Class'].map(chip => (
          <span
            key={chip}
            className='text-xs px-3 py-1.5 rounded-full bg-[#F0F5FF] text-[#287DFA] font-medium cursor-pointer hover:bg-[#DDEAFF] transition-colors duration-200'
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── Hotel form */
function HotelSearchForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <div className='sm:col-span-2'>
        <SearchField icon={MapPin} label='Destination' placeholder='City, hotel, or area' defaultValue='Paris, France' />
      </div>
      <SearchField icon={CalendarDays} label='Check-in' placeholder='Select date' defaultValue='Apr 25, 2026' />
      <SearchField icon={CalendarDays} label='Check-out' placeholder='Select date' defaultValue='Apr 30, 2026' />
      <GuestPicker label='Guests & Rooms' />
      <SearchButton />
    </div>
  )
}

/* ──────────────────────────────────────────── Package form */
function PackageSearchForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <SearchField icon={MapPin} label='From' placeholder='Departure city' defaultValue='Los Angeles (LAX)' />
      <SearchField icon={MapPin} label='To' placeholder='Destination city' defaultValue='Tokyo (NRT)' />
      <SearchField icon={CalendarDays} label='Depart' placeholder='Select date' defaultValue='May 10, 2026' />
      <GuestPicker />
      <div className='sm:col-span-2'>
        <SearchButton fullWidth />
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────── Train form */
function TrainSearchForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <SearchField icon={MapPin} label='From' placeholder='Departure station' defaultValue='Berlin Hbf' />
      <SearchField icon={MapPin} label='To' placeholder='Arrival station' defaultValue='Munich Hbf' />
      <SearchField icon={CalendarDays} label='Date' placeholder='Select date' defaultValue='Apr 28, 2026' />
      <SearchButton />
    </div>
  )
}

/* ──────────────────────────────────────────── Guest Picker */
interface GuestState {
  adults: number
  children: number
  rooms: number
}

function GuestPicker({ label = 'Travelers & Cabin' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [guests, setGuests] = useState<GuestState>({ adults: 2, children: 0, rooms: 1 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  const summary = `${guests.adults + guests.children} Traveler${guests.adults + guests.children !== 1 ? 's' : ''}, ${guests.rooms} Room${guests.rooms !== 1 ? 's' : ''}`

  function adjust(key: keyof GuestState, delta: number) {
    setGuests(prev => {
      const min = key === 'adults' || key === 'rooms' ? 1 : 0
      return { ...prev, [key]: Math.max(min, Math.min(prev[key] + delta, key === 'rooms' ? 9 : 12)) }
    })
  }

  return (
    <div ref={ref} className='relative'>
      <label className='block text-xs font-semibold text-[#666B7A] mb-1.5 uppercase tracking-wide'>{label}</label>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between pl-9 pr-3 py-3 text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-xl text-[#1A1A2E]
          focus:outline-none focus:ring-2 focus:ring-[#287DFA]/30 focus:border-[#287DFA] hover:border-[#287DFA]/40 transition-all duration-200'
      >
        <div className='absolute left-3 top-[calc(50%+10px)] -translate-y-1/2'>
          <Users className='w-4 h-4 text-[#9CA3AF]' />
        </div>
        <span className='pl-0'>{summary}</span>
        <ChevronDown className={`w-4 h-4 text-[#9CA3AF] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8E8ED] p-4 z-50'>
          {(['adults', 'children', 'rooms'] as const).map(key => (
            <div key={key} className='flex items-center justify-between py-3 border-b border-[#F0F0F5] last:border-0'>
              <div>
                <p className='text-sm font-semibold text-[#1A1A2E] capitalize'>{key}</p>
                <p className='text-xs text-[#9CA3AF]'>
                  {key === 'adults' ? '18+ years' : key === 'children' ? '0–17 years' : 'Per booking'}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => adjust(key, -1)}
                  className='w-8 h-8 rounded-full border-2 border-[#E8E8ED] hover:border-[#287DFA] flex items-center justify-center text-[#666B7A] hover:text-[#287DFA] transition-all duration-200 disabled:opacity-30'
                  disabled={(key === 'adults' || key === 'rooms') ? guests[key] <= 1 : guests[key] <= 0}
                >
                  <Minus className='w-3.5 h-3.5' />
                </button>
                <span className='w-5 text-center text-sm font-bold text-[#1A1A2E]'>{guests[key]}</span>
                <button
                  type='button'
                  onClick={() => adjust(key, 1)}
                  className='w-8 h-8 rounded-full border-2 border-[#E8E8ED] hover:border-[#287DFA] flex items-center justify-center text-[#666B7A] hover:text-[#287DFA] transition-all duration-200'
                >
                  <Plus className='w-3.5 h-3.5' />
                </button>
              </div>
            </div>
          ))}
          <button
            type='button'
            onClick={() => setOpen(false)}
            className='mt-3 w-full bg-[#287DFA] hover:bg-[#1a6ae0] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors duration-200'
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────── Search Button */
function SearchButton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 bg-[#287DFA] hover:bg-[#1a6ae0] active:bg-[#1560c7] text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_12px_rgba(40,125,250,0.35)] hover:shadow-[0_6px_20px_rgba(40,125,250,0.45)] self-end ${fullWidth ? 'w-full' : 'w-full'}`}
    >
      <Search className='w-4 h-4' />
      Search
    </button>
  )
}

/* ──────────────────────────────────────────── Shared field */
function SearchField({
  icon: Icon,
  label,
  placeholder,
  defaultValue
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  placeholder: string
  defaultValue?: string
}) {
  return (
    <div>
      <label className='block text-xs font-semibold text-[#666B7A] mb-1.5 uppercase tracking-wide'>
        {label}
      </label>
      <div className='relative group'>
        <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200' />
        <input
          type='text'
          placeholder={placeholder}
          defaultValue={defaultValue}
          className='w-full pl-9 pr-3 py-3 text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#287DFA]/30 focus:border-[#287DFA] focus:bg-white
            hover:border-[#287DFA]/40
            transition-all duration-200'
        />
      </div>
    </div>
  )
}
