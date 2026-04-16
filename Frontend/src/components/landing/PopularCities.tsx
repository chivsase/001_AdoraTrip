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
    <section className='py-12 md:py-16 bg-white border-t border-[#F3F4F6]'>
      <div className='max-w-[1200px] mx-auto px-4 sm:px-6'>

        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 rounded-xl bg-[#EBF3FF] flex items-center justify-center shrink-0'>
              <TrendingUp className='w-[17px] h-[17px] text-[#287DFA]' />
            </div>
            <div>
              <h2 className='text-xl sm:text-2xl font-bold text-[#111827] leading-tight'>Trending in Cambodia</h2>
              <p className='text-xs text-[#9CA3AF] mt-0.5'>Most searched destinations this week</p>
            </div>
          </div>
          <Link
            href='/destinations'
            className='hidden sm:block text-xs font-semibold text-[#287DFA] hover:text-[#1a6ae0] transition-colors duration-200'
          >
            View all →
          </Link>
        </div>

        {/* Scrollable city chips */}
        <div className='flex gap-3 overflow-x-auto pb-1' style={{ scrollbarWidth: 'none' }}>
          {cities.map(city => (
            <Link
              key={city.name}
              href={`/search?city=${encodeURIComponent(city.name)}`}
              className='flex items-center gap-3 shrink-0 px-4 py-3 bg-[#F9FAFB] hover:bg-[#EBF3FF] border border-[#E5E7EB] hover:border-[#287DFA]/25 rounded-2xl transition-all duration-200 group'
            >
              <span className='text-2xl leading-none'>{city.emoji}</span>
              <div className='min-w-0'>
                <p className='text-[13px] font-bold text-[#111827] group-hover:text-[#287DFA] transition-colors duration-200 whitespace-nowrap'>
                  {city.name}
                </p>
                <div className='flex items-center gap-1 mt-0.5'>
                  <Hotel className='w-3 h-3 text-[#9CA3AF]' />
                  <p className='text-[11px] text-[#9CA3AF] whitespace-nowrap'>{city.properties} stays</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
