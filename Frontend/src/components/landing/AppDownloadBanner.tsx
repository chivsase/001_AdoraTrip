'use client'

import { Smartphone, QrCode, Star } from 'lucide-react'

export default function AppDownloadBanner() {
  return (
    <section className='py-10 md:py-14 bg-gradient-to-r from-[#0B3D91] to-[#287DFA] overflow-hidden'>
      <div className='max-w-[1200px] mx-auto px-4'>
        <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12'>
          {/* Text content */}
          <div className='flex-1 text-center md:text-left'>
            <div className='inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4'>
              <Star className='w-3.5 h-3.5 fill-[#FFB400] text-[#FFB400]' />
              4.8 rating · 2M+ downloads
            </div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-extrabold text-white leading-tight'>
              Get exclusive deals on <br className='hidden sm:block' />
              the <span className='text-[#FFB400]'>AdoraTrip App</span>
            </h2>
            <p className='text-sm sm:text-base text-white/75 mt-3 max-w-md mx-auto md:mx-0'>
              Download now and enjoy app-only prices, instant notifications on flash sales, and
              seamless trip management on the go.
            </p>

            {/* Store buttons */}
            <div className='flex items-center gap-3 mt-6 justify-center md:justify-start'>
              <button className='flex items-center gap-2 bg-white hover:bg-white/90 text-[#1A1A2E] text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-200 shadow-md'>
                <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
                </svg>
                App Store
              </button>
              <button className='flex items-center gap-2 bg-white hover:bg-white/90 text-[#1A1A2E] text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-200 shadow-md'>
                <svg className='w-5 h-5' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z' />
                </svg>
                Google Play
              </button>
            </div>
          </div>

          {/* QR / Phone mockup area */}
          <div className='flex items-center gap-6 shrink-0'>
            <div className='hidden md:flex flex-col items-center gap-2 bg-white/10 backdrop-blur-sm p-4 rounded-2xl'>
              <QrCode className='w-24 h-24 text-white' />
              <span className='text-xs text-white/70 font-medium'>Scan to download</span>
            </div>
            <div className='relative w-[160px] h-[280px] md:w-[180px] md:h-[320px]'>
              <div className='absolute inset-0 bg-white/10 backdrop-blur-sm rounded-[28px] border border-white/20 flex items-center justify-center'>
                <Smartphone className='w-16 h-16 text-white/40' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
