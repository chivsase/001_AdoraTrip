import Link from 'next/link'
import { Plane, Mail, ArrowRight } from 'lucide-react'

const footerLinks = {
  Company: [
    { label: 'About Us',           href: '/about' },
    { label: 'Careers',            href: '/careers' },
    { label: 'Press Center',       href: '/press' },
    { label: 'Investor Relations', href: '/investors' },
    { label: 'Sustainability',     href: '/sustainability' }
  ],
  Support: [
    { label: 'Help Center',        href: '/help' },
    { label: 'Contact Us',         href: '/contact' },
    { label: 'Safety Information', href: '/safety' },
    { label: 'Cancellation Policy',href: '/cancellation' },
    { label: 'Report an Issue',    href: '/report' }
  ],
  'More Info': [
    { label: 'Cheap Flights',      href: '/flights/cheap' },
    { label: 'Hotel Deals',        href: '/hotels/deals' },
    { label: 'Travel Guides',      href: '/guides' },
    { label: 'Blog',               href: '/blog' },
    { label: 'Affiliate Program',  href: '/affiliates' }
  ],
  'Partner With Us': [
    { label: 'List Your Property', href: '/list-property' },
    { label: 'Advertise',          href: '/advertise' },
    { label: 'API & Partners',     href: '/partners' },
    { label: 'Travel Agent Portal',href: '/agents' }
  ]
}

interface SocialLink {
  href: string
  label: string
  svg: React.ReactNode
}

const socialLinks: SocialLink[] = [
  {
    href: '#', label: 'Facebook',
    svg: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' />
      </svg>
    )
  },
  {
    href: '#', label: 'X (Twitter)',
    svg: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    )
  },
  {
    href: '#', label: 'Instagram',
    svg: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' />
      </svg>
    )
  },
  {
    href: '#', label: 'YouTube',
    svg: (
      <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
      </svg>
    )
  }
]

export default function Footer() {
  return (
    <footer className='bg-[#0F1C3F] text-white'>

      {/* Newsletter section */}
      <div className='border-b border-white/[0.07]'>
        <div className='max-w-[1200px] mx-auto px-4 sm:px-6 py-10 md:py-12'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div className='text-center md:text-left'>
              <h3 className='text-lg font-bold text-white'>Stay in the loop</h3>
              <p className='text-sm text-white/50 mt-1'>
                Exclusive deals and Cambodia travel inspiration, weekly.
              </p>
            </div>
            <div className='flex w-full md:w-auto'>
              <div className='relative flex-1 md:w-[320px]'>
                <Mail className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none' />
                <input
                  type='email'
                  placeholder='Enter your email'
                  className='w-full pl-10 pr-4 py-3 bg-white/[0.07] border border-white/12 rounded-l-xl text-sm text-white placeholder-white/35 focus:outline-none focus:ring-2 focus:ring-[#287DFA]/40 focus:border-[#287DFA]/50 transition-all duration-200'
                />
              </div>
              <button className='flex items-center gap-1.5 bg-[#287DFA] hover:bg-[#1a6ae0] text-white font-semibold text-sm px-5 py-3 rounded-r-xl transition-colors duration-200 shrink-0'>
                Subscribe
                <ArrowRight className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer links */}
      <div className='max-w-[1200px] mx-auto px-4 sm:px-6 py-12 md:py-14'>
        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10'>

          {/* Brand column */}
          <div className='col-span-2 md:col-span-4 lg:col-span-1 mb-2 lg:mb-0'>
            <Link href='/' className='flex items-center gap-2.5 mb-5 group'>
              <div className='w-9 h-9 bg-gradient-to-br from-[#3B8EFF] to-[#1254CC] rounded-xl flex items-center justify-center shadow-[0_2px_10px_rgba(40,125,250,0.30)]'>
                <Plane className='w-4 h-4 text-white -rotate-45' />
              </div>
              <span className='text-[17px] font-extrabold tracking-tight'>
                <span className='text-white'>Adora</span>
                <span className='text-[#287DFA]'>Trip</span>
              </span>
            </Link>
            <p className='text-xs text-white/40 leading-relaxed mb-5 max-w-[200px]'>
              Making travel accessible, affordable, and unforgettable for everyone.
            </p>

            {/* Social icons */}
            <div className='flex gap-2'>
              {socialLinks.map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className='w-8 h-8 rounded-xl bg-white/[0.07] hover:bg-[#287DFA] flex items-center justify-center text-white/55 hover:text-white transition-all duration-200'
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className='text-[12px] font-bold text-white/80 uppercase tracking-[0.08em] mb-4'>{heading}</h4>
              <ul className='space-y-2.5'>
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className='text-[12.5px] text-white/40 hover:text-white/80 transition-colors duration-200'
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className='border-t border-white/[0.07]'>
        <div className='max-w-[1200px] mx-auto px-4 sm:px-6 py-5'>
          <div className='flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30'>
            <p>&copy; {new Date().getFullYear()} AdoraTrip. All rights reserved.</p>
            <div className='flex items-center gap-5'>
              {[
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookies', href: '/cookies' },
                { label: 'Sitemap', href: '/sitemap' }
              ].map(l => (
                <Link key={l.label} href={l.href} className='hover:text-white/70 transition-colors duration-200'>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
