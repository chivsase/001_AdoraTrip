'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  Hotel,
  Home,
  Waves,
  Compass,
  Landmark,
  UtensilsCrossed,
  Car,
  Tag,
  BookOpen,
  Map,
  MapPin,
  Gift,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  User
} from 'lucide-react'
import { useState } from 'react'

/* ── Types ───────────────────────────────────────────────── */
interface NavItem {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  badge?: string
}

interface NavSection {
  title: string
  items: NavItem[]
}

/* ── Nav data (Cambodia-focused) ────────────────────────── */
const navSections: NavSection[] = [
  {
    title: 'Stay',
    items: [
      { label: 'Hotels & Resorts', icon: Hotel, href: '/hotels' },
      { label: 'Guesthouses', icon: Home, href: '/guesthouses' },
      { label: 'Beach Resorts', icon: Waves, href: '/beach-resorts' }
    ]
  },
  {
    title: 'Explore',
    items: [
      { label: 'Tours & Activities', icon: Compass, href: '/tours' },
      { label: 'Attractions', icon: Landmark, href: '/attractions' },
      { label: 'Food & Dining', icon: UtensilsCrossed, href: '/dining' },
      { label: 'Local Transfers', icon: Car, href: '/transfers' }
    ]
  },
  {
    title: 'Provinces',
    items: [
      { label: 'Siem Reap', icon: MapPin, href: '/province/siem-reap' },
      { label: 'Phnom Penh', icon: MapPin, href: '/province/phnom-penh' },
      { label: 'Sihanoukville', icon: MapPin, href: '/province/sihanoukville' },
      { label: 'Kampot & Kep', icon: MapPin, href: '/province/kampot' },
      { label: 'Battambang', icon: MapPin, href: '/province/battambang' },
      { label: 'Mondulkiri', icon: MapPin, href: '/province/mondulkiri' }
    ]
  },
  {
    title: 'Discover',
    items: [
      { label: 'Deals', icon: Tag, href: '/deals', badge: 'HOT' },
      { label: 'Travel Guide', icon: BookOpen, href: '/guide' },
      { label: 'Map Explorer', icon: Map, href: '/map' },
      { label: 'Rewards', icon: Gift, href: '/rewards' },
      { label: 'Mobile App', icon: Smartphone, href: '/app' }
    ]
  }
]

/* ── Props ───────────────────────────────────────────────── */
interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  // Track which sections are expanded in collapsed mode (all open by default)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  function toggleSection(title: string) {
    setCollapsedSections(prev => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden='true'
      />

      {/* ── Sidebar panel ───────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky
          top-0 lg:top-[52px]
          left-0 z-50 lg:z-auto
          h-full lg:h-[calc(100vh-52px)]
          bg-white border-r border-[#EAEAF0]
          flex flex-col
          overflow-y-auto overflow-x-hidden
          shadow-[2px_0_16px_rgba(0,0,0,0.07)] lg:shadow-none
          transition-[width,transform] duration-300 ease-out
          shrink-0
          ${collapsed ? 'lg:w-[60px]' : 'lg:w-[210px]'}
          ${open ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ scrollbarWidth: 'none' }}
      >
        {/* ── Mobile drawer header ─── */}
        <div className='lg:hidden flex items-center gap-3 px-4 py-4 border-b border-[#F0F0F5] bg-gradient-to-br from-[#EBF3FF] to-white shrink-0'>
          <div className='w-10 h-10 rounded-full bg-[#287DFA]/10 border-2 border-[#287DFA]/20 flex items-center justify-center shrink-0'>
            <User className='w-5 h-5 text-[#287DFA]' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-bold text-[#1A1A2E]'>Welcome!</p>
            <Link href='/login' onClick={onClose} className='text-xs text-[#287DFA] hover:underline'>
              Sign in / Register →
            </Link>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-xl hover:bg-[#F0F0F5] text-[#9CA3AF] transition-colors duration-200'
            aria-label='Close menu'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* ── Cambodia branding strip (expanded only) ─── */}
        {!collapsed && (
          <div className='hidden lg:flex items-center gap-2 mx-3 mt-3 mb-1 px-3 py-2 bg-gradient-to-r from-[#FFF8E8] to-[#FFF3D6] rounded-xl border border-[#FFE599]/60'>
            <span className='text-xl leading-none'>🇰🇭</span>
            <div>
              <p className='text-[11px] font-bold text-[#92660A] leading-tight'>Cambodia Travel</p>
              <p className='text-[10px] text-[#B8850F]'>Explore all provinces</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className='hidden lg:flex justify-center py-3 shrink-0'>
            <span className='text-xl'>🇰🇭</span>
          </div>
        )}

        {/* ── Nav sections ─────────────────────────── */}
        <nav className='flex-1 px-2 py-1'>
          {navSections.map(section => {
            const isSectionCollapsed = collapsedSections[section.title]

            return (
              <div key={section.title} className='mb-1'>
                {/* Section header */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleSection(section.title)}
                    className='w-full flex items-center justify-between px-2.5 py-1.5 mb-0.5 group'
                  >
                    <span className='text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] group-hover:text-[#287DFA] transition-colors duration-200'>
                      {section.title}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 text-[#C8CCD8] transition-transform duration-200 ${isSectionCollapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                ) : (
                  <div className='flex justify-center py-1'>
                    <div className='w-5 h-px bg-[#E8E8ED]' />
                  </div>
                )}

                {/* Items */}
                {!isSectionCollapsed && (
                  <div className='space-y-0.5'>
                    {section.items.map(item => {
                      const isActive = pathname !== '/' && pathname.startsWith(item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          title={collapsed ? item.label : undefined}
                          className={`
                            relative flex items-center gap-2.5 px-2.5 py-[9px] rounded-xl
                            text-[13px] font-medium transition-all duration-200 group
                            ${isActive
                              ? 'bg-[#EBF3FF] text-[#287DFA]'
                              : 'text-[#444B5A] hover:bg-[#F5F7FF] hover:text-[#287DFA]'
                            }
                            ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                          `}
                        >
                          {/* Active indicator */}
                          {isActive && (
                            <span className='absolute left-0 inset-y-[5px] w-[3px] bg-[#287DFA] rounded-r-full' />
                          )}

                          <item.icon
                            className={`w-[17px] h-[17px] shrink-0 transition-colors duration-200 ${
                              isActive ? 'text-[#287DFA]' : 'text-[#8A92A6] group-hover:text-[#287DFA]'
                            }`}
                          />

                          {/* Label */}
                          <span className={`flex-1 truncate ${collapsed ? 'lg:hidden' : ''}`}>
                            {item.label}
                          </span>

                          {/* Badge */}
                          {item.badge && !collapsed && (
                            <span className='shrink-0 text-[9px] font-extrabold text-white bg-[#EF4444] px-1.5 py-0.5 rounded-full uppercase tracking-wide'>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* ── Collapse toggle (desktop only) ──────── */}
        <div className='hidden lg:flex items-center border-t border-[#F0F0F5] px-3 py-2.5 shrink-0'>
          <button
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 text-[11px] text-[#9CA3AF] hover:text-[#287DFA] hover:bg-[#F0F5FF] rounded-xl px-2 py-1.5 transition-all duration-200 w-full ${
              collapsed ? 'justify-center' : ''
            }`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className='w-4 h-4' />
            ) : (
              <>
                <ChevronLeft className='w-4 h-4' />
                <span className='font-medium'>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
