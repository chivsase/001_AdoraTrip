import { ShieldCheck, Headphones, CreditCard, RefreshCw } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure Booking',
    description: 'Your data is encrypted & protected'
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Round-the-clock customer care'
  },
  {
    icon: CreditCard,
    title: 'Best Price Guarantee',
    description: "Found lower? We'll match it"
  },
  {
    icon: RefreshCw,
    title: 'Free Cancellation',
    description: 'Flexible plans on most bookings'
  }
]

export default function TrustBar() {
  return (
    <section className='py-8 md:py-10 bg-[#F8F9FA] border-y border-[#E8E8ED]'>
      <div className='max-w-[1200px] mx-auto px-4'>
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8'>
          {features.map(f => (
            <div key={f.title} className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-xl bg-[#EBF3FF] flex items-center justify-center shrink-0'>
                <f.icon className='w-5 h-5 text-[#287DFA]' />
              </div>
              <div>
                <p className='text-sm font-bold text-[#1A1A2E]'>{f.title}</p>
                <p className='text-xs text-[#666B7A] mt-0.5'>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
