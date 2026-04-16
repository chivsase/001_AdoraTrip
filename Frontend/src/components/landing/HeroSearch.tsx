'use client'

import { useState, useRef, useEffect } from 'react'
import type { ComponentType } from 'react'
import {
  Hotel,
  Compass,
  Car,
  MapPin,
  CalendarDays,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react'

/* ── Cambodia provinces / cities ────────────────────────── */
export const cambodiaLocations = [
  { province: 'Siem Reap', cities: ['Siem Reap City', 'Angkor Area', 'Banteay Srei'] },
  { province: 'Phnom Penh', cities: ['Phnom Penh City', 'Chbar Ampov', 'Mean Chey'] },
  { province: 'Preah Sihanouk', cities: ['Sihanoukville', 'Koh Rong', 'Koh Rong Sanloem'] },
  { province: 'Kampot', cities: ['Kampot Town', 'Kep', 'Bokor Mountain'] },
  { province: 'Battambang', cities: ['Battambang City', 'Kamping Puoy', 'Phnom Banan'] },
  { province: 'Mondulkiri', cities: ['Sen Monorom', 'Bou Sra Waterfall', 'Elephant Valley'] },
  { province: 'Ratanakiri', cities: ['Banlung', 'Yeak Lom Lake', 'Virachey NP'] },
  { province: 'Kampong Cham', cities: ['Kampong Cham Town', 'Koh Paen', 'Wat Hanchey'] },
  { province: 'Kratie', cities: ['Kratie Town', 'Kampi Pool', 'Koh Trong'] },
  { province: 'Kampong Thom', cities: ['Kampong Thom Town', 'Sambor Prei Kuk'] }
]

const searchTabs = [
  { id: 'hotels', label: 'Hotels & Stays', icon: Hotel },
  { id: 'tours', label: 'Tours & Activities', icon: Compass },
  { id: 'transfers', label: 'Transfers', icon: Car }
]

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState('hotels')

  return (
    <section className='relative overflow-hidden'>
      {/* ── Background ── */}
      <div className='absolute inset-0'>
        {/* Rich deep gradient — warm Cambodia tones */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#0D2F6E] via-[#1A5FBF] to-[#287DFA]' />
        {/* Warm golden overlay on right */}
        <div className='absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-[#FFB400]/10' />
        {/* Decorative circles */}
        <div className='absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-white/[0.04] blur-3xl' />
        <div className='absolute -bottom-40 -left-20 w-[560px] h-[560px] rounded-full bg-white/[0.03] blur-3xl' />
        {/* Subtle grid pattern */}
        <div
          className='absolute inset-0 opacity-[0.06]'
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className='relative z-10 max-w-[1080px] mx-auto px-4 pt-10 pb-16 sm:pt-14 sm:pb-20'>

        {/* Headline */}
        <div className='text-center mb-8 md:mb-10'>
          {/* Cambodia badge */}
          <div className='inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-4 py-1.5 rounded-full mb-4'>
            <span className='text-base leading-none'>🇰🇭</span>
            Discover the Kingdom of Wonder
          </div>

          <h1 className='text-3xl sm:text-4xl md:text-[46px] font-extrabold text-white leading-[1.15] tracking-tight'>
            Your Perfect Stay in<br />
            <span className='text-[#FFD166]'>Cambodia</span> Awaits
          </h1>
          <p className='mt-3 text-[15px] sm:text-lg text-white/75 max-w-lg mx-auto leading-relaxed'>
            Explore ancient temples, pristine beaches, and vibrant cities across all provinces.
          </p>

          {/* Quick province pills */}
          <div className='flex items-center justify-center flex-wrap gap-2 mt-5'>
            {['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Kampot', 'Mondulkiri'].map(place => (
              <button
                key={place}
                className='flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200'
              >
                <MapPin className='w-3 h-3' />
                {place}
              </button>
            ))}
            <button className='flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200'>
              <ArrowRight className='w-3 h-3' />
              More
            </button>
          </div>
        </div>

        {/* ── Search card ── */}
        <div className='max-w-[860px] mx-auto'>
          {/* Tabs */}
          <div className='flex bg-white/10 backdrop-blur-sm rounded-t-2xl p-1 gap-1'>
            {searchTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 px-3 sm:px-5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-[#287DFA] shadow-md'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className='w-4 h-4 shrink-0' />
                <span className='hidden sm:inline'>{tab.label}</span>
                <span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className='bg-white rounded-b-2xl rounded-tr-2xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-4 sm:p-6'>
            {activeTab === 'hotels' && <HotelSearchForm />}
            {activeTab === 'tours' && <ToursSearchForm />}
            {activeTab === 'transfers' && <TransfersForm />}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Hotel Search ──────────────────────────────────────── */
function HotelSearchForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <div className='sm:col-span-2'>
        <CambodiaLocationField label='Province / City' placeholder='Where in Cambodia?' />
      </div>
      <SearchField icon={CalendarDays} label='Check-in' placeholder='Select date' defaultValue='Apr 25, 2026' />
      <SearchField icon={CalendarDays} label='Check-out' placeholder='Select date' defaultValue='Apr 28, 2026' />
      <GuestPicker label='Guests & Rooms' />
      <SearchButton />
    </div>
  )
}

/* ── Tours Search ──────────────────────────────────────── */
function ToursSearchForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <div className='sm:col-span-2'>
        <CambodiaLocationField label='Province / City' placeholder='Choose a destination' />
      </div>
      <SearchField icon={CalendarDays} label='Date' placeholder='Select date' defaultValue='Apr 25, 2026' />
      <GuestPicker label='Participants' />
      <div className='sm:col-span-2'>
        {/* Category chips */}
        <div className='flex flex-wrap gap-2 mb-3'>
          {['Angkor Wat', 'Tuk-tuk Tour', 'Cooking Class', 'Boat Trip', 'Zip-line', 'Cycling'].map(c => (
            <button
              key={c}
              className='text-xs px-3 py-1.5 rounded-full bg-[#F0F5FF] text-[#287DFA] font-medium hover:bg-[#DDEAFF] transition-colors duration-200'
            >
              {c}
            </button>
          ))}
        </div>
        <SearchButton fullWidth />
      </div>
    </div>
  )
}

/* ── Transfers ─────────────────────────────────────────── */
function TransfersForm() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <CambodiaLocationField label='From' placeholder='Pickup location' />
      <CambodiaLocationField label='To' placeholder='Drop-off location' />
      <SearchField icon={CalendarDays} label='Date' placeholder='Select date' defaultValue='Apr 25, 2026' />
      <GuestPicker label='Passengers' />
      <div className='sm:col-span-2'>
        <SearchButton fullWidth />
      </div>
    </div>
  )
}

/* ── Cambodia Location Dropdown ────────────────────────── */
function CambodiaLocationField({ label, placeholder }: { label: string; placeholder: string }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = value.length > 0
    ? cambodiaLocations.flatMap(p =>
        [p.province, ...p.cities]
          .filter(n => n.toLowerCase().includes(value.toLowerCase()))
          .map(n => ({ name: n, province: p.province }))
      ).slice(0, 8)
    : cambodiaLocations.map(p => ({ name: p.province, province: p.province }))

  return (
    <div ref={ref} className='relative'>
      <label className='block text-[11px] font-bold text-[#666B7A] mb-1.5 uppercase tracking-widest'>
        {label}
      </label>
      <div className='relative group'>
        <MapPin className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200 pointer-events-none' />
        <input
          type='text'
          value={value}
          placeholder={placeholder}
          onChange={e => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className='w-full pl-9 pr-8 py-3 text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#287DFA]/25 focus:border-[#287DFA] focus:bg-white
            hover:border-[#C8CCD8] transition-all duration-200'
        />
        <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8CCD8] pointer-events-none' />
      </div>

      {open && (
        <div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8E8ED] overflow-hidden z-50 max-h-56 overflow-y-auto'>
          {filtered.length === 0 ? (
            <p className='px-4 py-3 text-sm text-[#9CA3AF]'>No results found</p>
          ) : (
            filtered.map((loc, i) => (
              <button
                key={i}
                type='button'
                onClick={() => { setValue(loc.name); setOpen(false) }}
                className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-[#F0F5FF] transition-colors duration-150'
              >
                <MapPin className='w-3.5 h-3.5 text-[#287DFA] shrink-0' />
                <div>
                  <span className='font-medium text-[#1A1A2E]'>{loc.name}</span>
                  {loc.name !== loc.province && (
                    <span className='text-xs text-[#9CA3AF] ml-1.5'>{loc.province}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ── Guest Picker ──────────────────────────────────────── */
interface GuestState { adults: number; children: number; rooms: number }

function GuestPicker({ label = 'Guests & Rooms' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [guests, setGuests] = useState<GuestState>({ adults: 2, children: 0, rooms: 1 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function adjust(key: keyof GuestState, delta: number) {
    setGuests(prev => {
      const min = key === 'adults' || key === 'rooms' ? 1 : 0
      return { ...prev, [key]: Math.max(min, Math.min(prev[key] + delta, key === 'rooms' ? 9 : 12)) }
    })
  }

  const total = guests.adults + guests.children
  const summary = `${total} Guest${total !== 1 ? 's' : ''}, ${guests.rooms} Room${guests.rooms !== 1 ? 's' : ''}`

  return (
    <div ref={ref} className='relative'>
      <label className='block text-[11px] font-bold text-[#666B7A] mb-1.5 uppercase tracking-widest'>
        {label}
      </label>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between pl-9 pr-3 py-3 text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-xl text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#287DFA]/25 focus:border-[#287DFA] hover:border-[#C8CCD8] transition-all duration-200 relative'
      >
        <Users className='absolute left-3 w-4 h-4 text-[#9CA3AF]' />
        <span>{summary}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#C8CCD8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E8E8ED] p-4 z-50'>
          {(['adults', 'children', 'rooms'] as const).map(key => (
            <div key={key} className='flex items-center justify-between py-3 border-b border-[#F5F5F8] last:border-0'>
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
                  disabled={(key === 'adults' || key === 'rooms') ? guests[key] <= 1 : guests[key] <= 0}
                  className='w-8 h-8 rounded-full border-2 border-[#E8E8ED] hover:border-[#287DFA] flex items-center justify-center text-[#666B7A] hover:text-[#287DFA] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
                >
                  <Minus className='w-3.5 h-3.5' />
                </button>
                <span className='w-5 text-center text-sm font-bold text-[#1A1A2E] tabular-nums'>{guests[key]}</span>
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

/* ── Search Button ─────────────────────────────────────── */
function SearchButton({ fullWidth = false }: { fullWidth?: boolean }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 bg-[#287DFA] hover:bg-[#1a6ae0] active:bg-[#1560c7] text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-[0_4px_14px_rgba(40,125,250,0.35)] hover:shadow-[0_6px_20px_rgba(40,125,250,0.45)] ${fullWidth ? 'w-full px-6' : 'w-full px-6 sm:col-span-1'}`}
    >
      <Search className='w-4 h-4' />
      Search
    </button>
  )
}

/* ── Shared text field ─────────────────────────────────── */
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
      <label className='block text-[11px] font-bold text-[#666B7A] mb-1.5 uppercase tracking-widest'>
        {label}
      </label>
      <div className='relative group'>
        <Icon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200' />
        <input
          type='text'
          placeholder={placeholder}
          defaultValue={defaultValue}
          className='w-full pl-9 pr-3 py-3 text-sm bg-[#F8F9FA] border border-[#E8E8ED] rounded-xl text-[#1A1A2E] placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#287DFA]/25 focus:border-[#287DFA] focus:bg-white
            hover:border-[#C8CCD8] transition-all duration-200'
        />
      </div>
    </div>
  )
}
