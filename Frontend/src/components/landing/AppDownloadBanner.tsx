'use client'

import { Smartphone, QrCode, Star, ArrowRight } from 'lucide-react'

export default function AppDownloadBanner() {
  return (
    <section className='relative py-14 md:py-20 overflow-hidden'>
      {/* Deep gradient background */}
      <div className='absolute inset-0 bg-gradient-to-br from-[#071C47] via-[#0D3172] to-[#1760F5]' />
      {/* Warm radial accent */}
      <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_75%_50%,rgba(255,180,0,0.10),transparent_55%)]' />
      {/* Subtle dot mesh */}
      <div
        className='absolute inset-0 opacity-[0.06]'
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px'
        }}
      />

      <div className='relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6'>
        <div className='flex flex-col md:flex-row items-center gap-10 md:gap-14'>

          {/* Text content */}
          <div className='flex-1 text-center md:text-left'>
            {/* Rating badge */}
            <div className='inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/15 text-white/85 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-5'>
              <Star className='w-3.5 h-3.5 fill-[#FFD166] text-[#FFD166]' />
              4.8 rating &nbsp;·&nbsp; 2M+ downloads
            </div>

            <h2 className='text-[1.85rem] sm:text-4xl md:text-[2.75rem] font-extrabold text-white leading-[1.1] tracking-tight'>
              Get exclusive deals on <br className='hidden sm:block' />
              the{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] to-[#FFA500]'>
                AdoraTrip App
              </span>
            </h2>

            <p className='text-sm sm:text-base text-white/60 mt-4 max-w-md mx-auto md:mx-0 leading-relaxed font-light'>
              App-only prices, instant flash-sale alerts, and seamless trip management — all in your pocket.
            </p>

            {/* Store buttons */}
            <div className='flex items-center gap-3 mt-7 justify-center md:justify-start'>
              <button className='flex items-center gap-2.5 bg-white hover:bg-white/90 text-[#111827] text-[13px] font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.24)]'>
                <svg className='w-5 h-5 shrink-0' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
                </svg>
                App Store
              </button>
              <button className='flex items-center gap-2.5 bg-white hover:bg-white/90 text-[#111827] text-[13px] font-semibold px-5 py-3 rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.24)]'>
                <svg className='w-5 h-5 shrink-0' viewBox='0 0 24 24' fill='currentColor'>
                  <path d='M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302-2.302 2.302L15.396 12l2.302-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z' />
                </svg>
                Google Play
              </button>
            </div>

            {/* Features micro-list */}
            <div className='flex items-center gap-5 mt-6 justify-center md:justify-start text-white/50 text-xs font-medium'>
              <span className='flex items-center gap-1.5'><span className='text-[#FFD166]'>✦</span> App-only prices</span>
              <span className='flex items-center gap-1.5'><span className='text-[#FFD166]'>✦</span> Flash-sale alerts</span>
              <span className='flex items-center gap-1.5'><span className='text-[#FFD166]'>✦</span> Offline access</span>
            </div>
          </div>

          {/* QR + Phone mockup */}
          <div className='flex items-center gap-6 shrink-0'>
            {/* QR code */}
            <div className='hidden md:flex flex-col items-center gap-2.5 bg-white/8 backdrop-blur-sm border border-white/12 p-5 rounded-2xl'>
              <QrCode className='w-24 h-24 text-white/80' />
              <span className='text-xs text-white/55 font-medium'>Scan to download</span>
            </div>

            {/* Phone mockup */}
            <div className='relative w-[152px] h-[296px] md:w-[172px] md:h-[332px]'>
              {/* Outer shell */}
              <div className='absolute inset-0 bg-white/8 backdrop-blur-sm rounded-[32px] border border-white/15 shadow-[0_24px_48px_rgba(0,0,0,0.30)] flex flex-col items-center justify-center gap-4 overflow-hidden'>
                {/* Screen area */}
                <div className='w-full h-full bg-gradient-to-br from-white/[0.05] to-white/[0.02] flex flex-col items-center justify-center gap-3 px-4'>
                  <div className='w-10 h-10 bg-gradient-to-br from-[#3B8EFF] to-[#1254CC] rounded-2xl flex items-center justify-center shadow-[0_4px_16px_rgba(40,125,250,0.4)]'>
                    <Smartphone className='w-5 h-5 text-white' />
                  </div>
                  <div className='text-center'>
                    <p className='text-white text-[11px] font-bold'>AdoraTrip</p>
                    <p className='text-white/40 text-[9px] mt-0.5'>Travel smarter</p>
                  </div>
                  <div className='flex items-center gap-1 mt-1'>
                    <ArrowRight className='w-3 h-3 text-[#FFD166]' />
                    <span className='text-[9px] text-white/50 font-medium'>Download now</span>
                  </div>
                </div>
              </div>
              {/* Notch */}
              <div className='absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-white/20 rounded-full' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
