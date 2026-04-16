import { ShieldCheck, Headphones, CreditCard, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Booking',
    description: 'Your data is encrypted & protected with SSL'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer care in your language'
  },
  {
    icon: CreditCard,
    title: 'Best Price Guarantee',
    description: "Found lower? We'll match it, no questions asked"
  },
  {
    icon: RefreshCw,
    title: 'Free Cancellation',
    description: 'Flexible plans on most bookings up to 24h before'
  }
]

export default function TrustBar() {
  return (
    <section className='py-10 md:py-12 bg-[#F9FAFB] border-y border-[#EBEEF3]'>
      <div className='max-w-[1200px] mx-auto px-4 sm:px-6'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-[#E5E7EB]'>
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex items-start gap-3.5 ${i > 0 ? 'md:pl-8 lg:pl-10' : ''}`}
            >
              {/* Icon with gradient bg */}
              <div className='w-11 h-11 rounded-2xl bg-gradient-to-br from-[#EBF3FF] to-[#D6E8FF] flex items-center justify-center shrink-0'>
                <f.icon className='w-5 h-5 text-[#287DFA]' />
              </div>
              <div>
                <p className='text-[13.5px] font-bold text-[#111827] leading-tight'>{f.title}</p>
                <p className='text-xs text-[#6B7280] mt-1 leading-relaxed'>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
