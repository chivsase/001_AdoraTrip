'use client'

import { useState, useEffect } from 'react'
import { MapPin, X, Compass } from 'lucide-react'

export default function LocationPermissionBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null)

  useEffect(() => {
    // Check if we've already asked, or if permission is already granted/denied
    const hasAsked = localStorage.getItem('hasAskedLocation')
    
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state)
        // Show if not granted/denied previously and we haven't asked yet in localStorage
        if (result.state === 'prompt' && !hasAsked) {
          setIsVisible(true)
        }
      })
    } else {
      // Fallback for browsers that don't support permissions API properly
      if (!hasAsked) setIsVisible(true)
    }
  }, [])

  const handleAllow = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Successfully got location - store in local storage to use for recommendations later
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          localStorage.setItem('userLocation', JSON.stringify(location))
          localStorage.setItem('hasAskedLocation', 'true')
          setPermissionStatus('granted')
          setIsVisible(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          localStorage.setItem('hasAskedLocation', 'true')
          setPermissionStatus('denied')
          setIsVisible(false)
        }
      )
    } else {
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    localStorage.setItem('hasAskedLocation', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className='fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-700 max-w-sm w-[calc(100%-3rem)]'>
      <div className='relative bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.2)] border border-slate-100 p-5 overflow-hidden group'>
        {/* Decorative background glow */}
        <div className='absolute -top-10 -right-10 w-24 h-24 bg-[#287DFA]/10 rounded-full blur-2xl group-hover:bg-[#287DFA]/20 transition-all duration-700' />
        <div className='absolute -bottom-10 -left-10 w-24 h-24 bg-amber-400/10 rounded-full blur-2xl group-hover:bg-amber-400/20 transition-all duration-700' />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className='absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors z-10'
          aria-label='Dismiss'
        >
          <X className='w-4 h-4' />
        </button>

        <div className='flex items-start gap-4 relative z-10'>
          {/* Icon Badge */}
          <div className='w-12 h-12 bg-gradient-to-br from-[#287DFA] to-[#1E62CA] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 transform group-hover:scale-105 transition-transform duration-500'>
            <MapPin className='w-6 h-6 text-white' />
          </div>

          <div className='flex-1 pt-0.5'>
            <h4 className='text-slate-900 font-bold text-[15px] leading-snug tracking-tight mb-1 flex items-center gap-2'>
              Enable Location
              <Compass className='w-3.5 h-3.5 text-slate-400' />
            </h4>
            <p className='text-slate-500 text-[13px] leading-relaxed mb-4 font-medium'>
              Allow us to use your location to recommend the best hotels and tours near you.
            </p>

            <div className='flex items-center gap-2.5'>
              <button
                onClick={handleAllow}
                className='flex-1 bg-[#287DFA] hover:bg-[#1a6ae0] text-white text-[13px] font-bold py-2.5 px-4 rounded-xl transition-all shadow-[0_4px_12px_rgba(40,125,250,0.3)] hover:shadow-[0_6px_16px_rgba(40,125,250,0.4)] hover:-translate-y-0.5 active:scale-95'
              >
                Allow Location
              </button>
              <button
                onClick={handleDismiss}
                className='flex-1 bg-[#F5F7FA] hover:bg-[#E5E7EB] text-slate-600 font-semibold text-[13px] py-2.5 px-4 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95'
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
