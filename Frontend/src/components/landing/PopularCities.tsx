import { TrendingUp, Hotel } from 'lucide-react'
import Link from 'next/link'

const cities = [
  { name: 'Siem Reap',      region: 'NW Cambodia',    properties: '450+', emoji: '🛕' },
  { name: 'Phnom Penh',     region: 'Capital',        properties: '620+', emoji: '🏙️' },
  { name: 'Sihanoukville',  region: 'South Coast',    properties: '310+', emoji: '🏖️' },
  { name: 'Kampot',         region: 'South Cambodia', properties: '180+', emoji: '🌿' },
  { name: 'Kep',            region: 'Kampot Province',properties: '75+',  emoji: '🦀' },
  { name: 'Battambang',     region: 'NW Cambodia',    properties: '140+', emoji: '🎨' },
  { name: 'Sen Monorom',    region: 'Mondulkiri',     properties: '65+',  emoji: '🌲' },
  { name: 'Banlung',        region: 'Ratanakiri',     properties: '45+',  emoji: '🏞️' },
  { name: 'Kratie',         region: 'NE Cambodia',    properties: '38+',  emoji: '🐬' },
  { name: 'Kampong Cham',   region: 'Central',        properties: '55+',  emoji: '🌉' }
]

export default function PopularCities() {
  return (
    <section className='py-14 md:py-20 bg-white border-t border-[#F1F5F9]'>
      <div className='max-w-[1240px] mx-auto px-4 sm:px-6'>

        {/* Header */}
        <div className='flex items-center justify-between mb-8 animate-in fade-in slide-in-from-left-4 duration-1000 fill-mode-both'>
          <div className='flex items-center gap-4'>
            <div className='w-11 h-11 rounded-2xl bg-[#F0F7FF] flex items-center justify-center shrink-0 shadow-sm border border-[#E0EDFF]'>
              <TrendingUp className='w-5 h-5 text-[#287DFA]' />
            </div>
            <div>
              <h2 className='text-xl sm:text-2xl font-black text-[#0F172A] leading-tight tracking-tight'>Trending in Cambodia</h2>
              <p className='text-xs sm:text-[13px] text-[#64748B] mt-0.5 font-medium'>Most visited and sought-after destinations this season</p>
            </div>
          </div>
          <Link
            href='/destinations'
            className='hidden sm:block text-xs font-black text-[#287DFA] hover:text-[#1a6ae0] tracking-wider uppercase'
          >
            Explore Map View →
          </Link>
        </div>

        {/* Scrollable city chips */}
        <div className='flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0' style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {cities.map((city, idx) => (
            <Link
              key={city.name}
              href={`/search?city=${encodeURIComponent(city.name)}`}
              className='flex items-center gap-4 shrink-0 px-5 py-4 bg-[#F8FAFC] hover:bg-white border border-[#E2E8F0] hover:border-[#287DFA]/40 hover:shadow-[0_12px_30px_-8px_rgba(40,125,250,0.15)] rounded-[20px] transition-all duration-500 group animate-in fade-in slide-in-from-right-4 fill-mode-both'
              style={{ animationDelay: `${idx * 75}ms` }}
            >
              <div className='text-3xl filter grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110'>{city.emoji}</div>
              <div className='min-w-0'>
                <p className='text-[14px] font-black text-[#0F172A] group-hover:text-[#287DFA] transition-colors duration-300 whitespace-nowrap'>
                  {city.name}
                </p>
                <div className='flex items-center gap-1.5 mt-0.5'>
                  <Hotel className='w-3 h-3 text-[#94A3B8]' />
                  <p className='text-[11px] text-[#94A3B8] font-bold whitespace-nowrap uppercase tracking-tighter'>{city.properties} Premium stays</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
