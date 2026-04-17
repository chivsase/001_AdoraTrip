'use client'

import { useState, useRef, useEffect, forwardRef } from 'react'
import {
  Hotel,
  Compass,
  Car,
  MapPin,
  Users,
  Search,
  ChevronDown,
  Plus,
  Minus,
  ArrowRight
} from 'lucide-react'

import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField'
import { formatDate } from 'date-fns/format'

import AppReactDatepicker from '@/libs/styles/AppReactDatepicker'

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

const createOffsetDate = (offset: number) => {
  const date = new Date()

  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offset)

  return date
}

type CustomInputProps = TextFieldProps & {
  label?: string
  end: Date | number | null
  start: Date | number | null
}

const CustomInput = forwardRef(({ start, end, label, ...props }: CustomInputProps, ref) => {
  const startDate = start ? formatDate(start, 'MM/dd/yyyy') : ''
  const endDate = end ? ` - ${formatDate(end, 'MM/dd/yyyy')}` : null
  const value = `${startDate}${endDate !== null ? endDate : ''}`

  return <TextField fullWidth inputRef={ref} label={label || ''} {...props} value={value} />
})

type SingleCustomInputProps = TextFieldProps & {
  label?: string
  date: Date | null
}

const SingleCustomInput = forwardRef(({ date, label, ...props }: SingleCustomInputProps, ref) => {
  const value = date ? formatDate(date, 'MM/dd/yyyy') : ''

  return <TextField fullWidth inputRef={ref} label={label || ''} {...props} value={value} />
})

export default function HeroSearch() {
  const [activeTab, setActiveTab] = useState('hotels')

  return (
    <section className='relative'>
      {/* ── Background ── */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Deep rich gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-[#071C47] via-[#0D3172] to-[#1760F5]' />
        {/* Warm golden accent top-right */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_80%_0%,rgba(255,180,0,0.12),transparent_55%)]' />
        {/* Soft glow bottom-left */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(40,125,250,0.20),transparent_50%)]' />
        {/* Fine dot mesh */}
        <div
          className='absolute inset-0 opacity-[0.07]'
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* ── Content ── */}
      <div className='relative z-10 max-w-[1160px] mx-auto px-4 pt-12 pb-18 sm:pt-16 sm:pb-22 md:pb-24'>

        {/* Headline block - with entry animation */}
        <div className='text-center mb-10 md:mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both'>

          {/* Eyebrow badge */}
          <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-bold px-4 py-2 rounded-full mb-6 tracking-widest uppercase'>
            <span className='text-base leading-none filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'>🇰🇭</span>
            Discover the Kingdom of Wonder
          </div>

          <h1 className='text-[2.6rem] sm:text-5xl md:text-[3.8rem] font-black text-white leading-[1.05] tracking-tight'>
            Your Perfect Stay in
            <br />
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] via-[#FFB700] to-[#FFA500] drop-shadow-[0_2px_10px_rgba(255,165,0,0.2)]'>
              Cambodia
            </span>{' '}
            Awaits
          </h1>

          <p className='mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed font-medium'>
            Journey through ancient temples, pristine islands, and vibrant cities. 
            Experience world-class hospitality in every province.
          </p>

          {/* Quick destination pills */}
          <div className='flex items-center justify-center flex-wrap gap-2.5 mt-8'>
            {['Siem Reap', 'Phnom Penh', 'Sihanoukville', 'Kampot', 'Mondulkiri'].map((place, idx) => (
              <button
                key={place}
                className={`flex items-center gap-1.5 bg-white/10 hover:bg-white/25 border border-white/10 text-white/80 hover:text-white text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both`}
                style={{ animationDelay: `${400 + (idx * 100)}ms` }}
              >
                <MapPin className='w-3 h-3' />
                {place}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search card ── */}
        <div className='max-w-[940px] mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both'>
          {/* Tabs */}
          <div className='flex bg-white/10 backdrop-blur-xl border border-white/10 rounded-t-[24px] p-1.5 gap-1.5 mx-2 sm:mx-6 shadow-2xl'>
            {searchTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2.5 flex-1 py-3 px-4 sm:px-6 rounded-[18px] text-xs sm:text-[13px] font-bold transition-all duration-500 ${activeTab === tab.id
                  ? 'bg-white text-[#287DFA] shadow-[0_8px_30px_rgba(0,0,0,0.15)] scale-[1.02]'
                  : 'text-white/75 hover:bg-white/10 hover:text-white hover:scale-[1.01]'
                  }`}
              >
                <tab.icon className={`w-4 h-4 shrink-0 transition-transform duration-500 ${activeTab === tab.id ? 'scale-110' : ''}`} />
                <span className='hidden sm:inline'>{tab.label}</span>
                <span className='sm:hidden'>{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className='bg-white rounded-[24px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.3)] p-5 sm:p-8 relative z-20'>
            <div className='absolute -top-6 left-12 w-12 h-12 bg-white rotate-45 hidden sm:block -z-10' />
            {activeTab === 'hotels' && <HotelSearchForm />}
            {activeTab === 'tours' && <ToursSearchForm />}
            {activeTab === 'transfers' && <TransfersForm />}
          </div>
        </div>

        {/* Trust micro-bar */}
        <div className='flex items-center justify-center gap-6 mt-7 text-white/45 text-xs font-medium'>
          <span className='flex items-center gap-1.5'>
            <span className='text-[#FFD166]'>✦</span> No booking fees
          </span>
          <span className='w-px h-3 bg-white/20' />
          <span className='flex items-center gap-1.5'>
            <span className='text-[#FFD166]'>✦</span> Free cancellation
          </span>
          <span className='w-px h-3 bg-white/20' />
          <span className='flex items-center gap-1.5'>
            <span className='text-[#FFD166]'>✦</span> Best price guarantee
          </span>
        </div>
      </div>
    </section>
  )
}

/* ── Hotel Search ──────────────────────────────────────── */
function HotelSearchForm() {
  const [startDate, setStartDate] = useState<Date | null>(() => createOffsetDate(1))
  const [endDate, setEndDate] = useState<Date | null>(() => createOffsetDate(4))

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates

    setStartDate(start)
    setEndDate(end)
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4'>
      <div className='lg:col-span-5'>
        <CambodiaLocationField label='Province / City' placeholder='Where in Cambodia?' />
      </div>
      <div className='lg:col-span-4'>
        <DateRangeField
          label='Stay Dates'
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateChange}
        />
      </div>
      <div className='lg:col-span-3'>
        <GuestPicker label='Guests & Rooms' />
      </div>
      <div className='sm:col-span-2 lg:col-span-12 mt-2'>
        <SearchButton fullWidth />
      </div>
    </div>
  )
}

/* ── Tours Search ──────────────────────────────────────── */
function ToursSearchForm() {
  const [tourDate, setTourDate] = useState<Date | null>(() => createOffsetDate(1))

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <div className='sm:col-span-2'>
        <CambodiaLocationField label='Province / City' placeholder='Choose a destination' />
      </div>
      <SingleDateField label='Date' selectedDate={tourDate} onChange={setTourDate} />
      <GuestPicker label='Participants' />
      <div className='sm:col-span-2'>
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
  const [transferDate, setTransferDate] = useState<Date | null>(() => createOffsetDate(1))

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      <CambodiaLocationField label='From' placeholder='Pickup location' />
      <CambodiaLocationField label='To' placeholder='Drop-off location' />
      <SingleDateField
        label='Date'
        selectedDate={transferDate}
        onChange={setTransferDate}
      />
      <GuestPicker label='Passengers' />
      <div className='sm:col-span-2'>
        <SearchButton fullWidth />
      </div>
    </div>
  )
}

/* ── Date Picker Fields ────────────────────────────────── */
function DateRangeField({
  label,
  startDate,
  endDate,
  onChange
}: {
  label: string
  startDate: Date | null
  endDate: Date | null
  onChange: (dates: [Date | null, Date | null]) => void
}) {
  return (
    <AppReactDatepicker
      selectsRange
      monthsShown={2}
      shouldCloseOnSelect={false}
      minDate={createOffsetDate(0)}
      selected={startDate}
      startDate={startDate as Date}
      endDate={endDate as Date}
      dateFormat='MM/dd/yyyy'
      id='date-range-picker'
      onChange={dates => onChange(dates as [Date | null, Date | null])}
      customInput={<CustomInput label={label} start={startDate as Date | number} end={endDate as Date | number} />}
    />
  )
}

function SingleDateField({
  label,
  selectedDate,
  onChange
}: {
  label: string
  selectedDate: Date | null
  onChange: (date: Date | null) => void
}) {
  return (
    <AppReactDatepicker
      minDate={createOffsetDate(0)}
      selected={selectedDate}
      dateFormat='MM/dd/yyyy'
      onChange={date => onChange(date as Date | null)}
      customInput={<SingleCustomInput label={label} date={selectedDate} />}
    />
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
      <label className='block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-[0.08em]'>
        {label}
      </label>
      <div className='relative group'>
        <MapPin className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] group-focus-within:text-[#287DFA] transition-colors duration-200 pointer-events-none' />
        <input
          type='text'
          value={value}
          placeholder={placeholder}
          onChange={e => { setValue(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className='w-full pl-10 pr-8 py-3 text-sm bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-[#111827] placeholder-[#9CA3AF]
            focus:outline-none focus:ring-2 focus:ring-[#287DFA]/20 focus:border-[#287DFA] focus:bg-white
            hover:border-[#D1D5DB] transition-all duration-200'
        />
        <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#C8CCD8] pointer-events-none' />
      </div>

      {open && (
        <div className='absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] overflow-hidden z-50 max-h-56 overflow-y-auto'>
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
                  <span className='font-medium text-[#111827]'>{loc.name}</span>
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
      <label className='block text-[11px] font-bold text-[#6B7280] mb-1.5 uppercase tracking-[0.08em]'>
        {label}
      </label>
      <button
        type='button'
        onClick={() => setOpen(v => !v)}
        className='w-full flex items-center justify-between pl-10 pr-3 py-3 text-sm bg-[#F5F7FA] border border-[#E5E7EB] rounded-xl text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#287DFA]/20 focus:border-[#287DFA] hover:border-[#D1D5DB] transition-all duration-200 relative'
      >
        <Users className='absolute left-3.5 w-4 h-4 text-[#9CA3AF]' />
        <span>{summary}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#C8CCD8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className='absolute top-full left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E5E7EB] p-4 z-50'>
          {(['adults', 'children', 'rooms'] as const).map(key => (
            <div key={key} className='flex items-center justify-between py-3 border-b border-[#F3F4F6] last:border-0'>
              <div>
                <p className='text-sm font-semibold text-[#111827] capitalize'>{key}</p>
                <p className='text-xs text-[#9CA3AF]'>
                  {key === 'adults' ? '18+ years' : key === 'children' ? '0–17 years' : 'Per booking'}
                </p>
              </div>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => adjust(key, -1)}
                  disabled={(key === 'adults' || key === 'rooms') ? guests[key] <= 1 : guests[key] <= 0}
                  className='w-8 h-8 rounded-full border-2 border-[#E5E7EB] hover:border-[#287DFA] flex items-center justify-center text-[#6B7280] hover:text-[#287DFA] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed'
                >
                  <Minus className='w-3.5 h-3.5' />
                </button>
                <span className='w-5 text-center text-sm font-bold text-[#111827] tabular-nums'>{guests[key]}</span>
                <button
                  type='button'
                  onClick={() => adjust(key, 1)}
                  className='w-8 h-8 rounded-full border-2 border-[#E5E7EB] hover:border-[#287DFA] flex items-center justify-center text-[#6B7280] hover:text-[#287DFA] transition-all duration-200'
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
      className={`relative group flex items-center justify-center gap-3 bg-[#287DFA] hover:bg-[#1a6ae0] active:scale-95 text-white font-bold text-base py-4 px-10 rounded-2xl transition-all duration-500 shadow-[0_12px_24px_-8px_rgba(40,125,250,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(40,125,250,0.6)] overflow-hidden ${fullWidth ? 'w-full' : 'w-full sm:col-span-1'}`}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out' />
      <Search className='w-5 h-5 transition-transform duration-500 group-hover:rotate-12' />
      <span>Search Destinations</span>
    </button>
  )
}

