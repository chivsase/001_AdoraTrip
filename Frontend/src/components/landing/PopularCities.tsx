import { TrendingUp } from 'lucide-react'
import Link from 'next/link'

const cities = [
  { name: 'Bangkok', emoji: '🇹🇭', flights: '150+' },
  { name: 'Singapore', emoji: '🇸🇬', flights: '120+' },
  { name: 'Seoul', emoji: '🇰🇷', flights: '95+' },
  { name: 'Tokyo', emoji: '🇯🇵', flights: '200+' },
  { name: 'Dubai', emoji: '🇦🇪', flights: '180+' },
  { name: 'London', emoji: '🇬🇧', flights: '250+' },
  { name: 'Paris', emoji: '🇫🇷', flights: '220+' },
  { name: 'Istanbul', emoji: '🇹🇷', flights: '130+' },
  { name: 'Sydney', emoji: '🇦🇺', flights: '80+' },
  { name: 'Rome', emoji: '🇮🇹', flights: '110+' }
]

export default function PopularCities() {
  return (
    <section className='py-10 md:py-14 bg-white border-t border-[#F0F0F5]'>
      <div className='max-w-[1200px] mx-auto px-4'>
        <div className='flex items-center gap-2 mb-6'>
          <TrendingUp className='w-5 h-5 text-[#287DFA]' />
          <h2 className='text-xl sm:text-2xl font-bold text-[#1A1A2E]'>Trending Cities</h2>
        </div>

        <div className='flex gap-3 overflow-x-auto pb-2 scrollbar-hide'>
          {cities.map(city => (
            <Link
              key={city.name}
              href={`/flights?to=${city.name}`}
              className='flex items-center gap-2.5 shrink-0 px-4 py-3 bg-[#F8F9FA] hover:bg-[#EBF3FF] border border-[#E8E8ED] hover:border-[#287DFA]/30 rounded-xl transition-all duration-200 group'
            >
              <span className='text-2xl'>{city.emoji}</span>
              <div>
                <p className='text-sm font-semibold text-[#1A1A2E] group-hover:text-[#287DFA] transition-colors duration-200'>
                  {city.name}
                </p>
                <p className='text-[10px] text-[#9CA3AF]'>{city.flights} flights/week</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
