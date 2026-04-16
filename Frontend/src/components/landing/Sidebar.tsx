'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import type { ComponentType } from 'react'
import {
  Hotel,
  Plane,
  Train,
  Car,
  Compass,
  Package,
  Map,
  Users,
  CalendarDays,
  BookOpen,
  MapPin,
  Tag,
  Gift,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  X,
  User
} from 'lucide-react'

/* ── Nav data ───────────────────────────────────────────── */
interface NavItem {
  label: string
  icon: ComponentType<{ className?: string }>
  href: string
  badge?: string
  dividerBefore?: boolean
}

const navItems: NavItem[] = [
  { label: 'Hotels & Homes', icon: Hotel, href: '/hotels' },
  { label: 'Flights', icon: Plane, href: '/flights' },
  { label: 'Trains', icon: Train, href: '/trains' },
  { label: 'Cars', icon: Car, href: '/car-rental' },
  { label: 'Attractions & Tours', icon: Compass, href: '/attractions' },
  { label: 'Flight + Hotel', icon: Package, href: '/packages' },
  { label: 'Private Tours', icon: Map, href: '/private-tours' },
  { label: 'Group Tours', icon: Users, href: '/group-tours' },
  // ── secondary ──
  { label: 'Trip Planner', icon: CalendarDays, href: '/planner', badge: 'NEW', dividerBefore: true },
  { label: 'Travel Inspiration', icon: BookOpen, href: '/inspiration' },
  { label: 'Map Explorer', icon: MapPin, href: '/map' },
  { label: 'Deals', icon: Tag, href: '/deals' },
  // ── utility ──
  { label: 'Rewards', icon: Gift, href: '/rewards', dividerBefore: true },
  { label: 'App', icon: Smartphone, href: '/app' }
]

/* ── Props ──────────────────────────────────────────────── */
interface SidebarProps {
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────── */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-all duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden='true'
      />

      {/* ── Sidebar panel ───────────────────────────────── */}
      <aside
        className={`
          fixed lg:sticky
          top-0 lg:top-[52px]
          left-0
          z-50 lg:z-auto
          h-full lg:h-[calc(100vh-52px)]
          bg-white border-r border-[#EAEAF0]
          flex flex-col
          overflow-y-auto overflow-x-hidden
          shadow-[2px_0_12px_rgba(0,0,0,0.06)] lg:shadow-none
          transition-[width,transform] duration-300 ease-out
          shrink-0
          ${collapsed ? 'lg:w-[60px]' : 'lg:w-[196px]'}
          ${open ? 'translate-x-0 w-[220px]' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* ── Mobile drawer header ─── */}
        <div className='lg:hidden flex items-center gap-3 px-4 py-4 border-b border-[#F0F0F5] bg-gradient-to-r from-[#EBF3FF] to-white'>
          <div className='w-10 h-10 rounded-full bg-[#287DFA]/10 border-2 border-[#287DFA]/20 flex items-center justify-center shrink-0'>
            <User className='w-5 h-5 text-[#287DFA]' />
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-sm font-bold text-[#1A1A2E]'>Welcome!</p>
            <Link
              href='/login'
              onClick={onClose}
              className='text-xs text-[#287DFA] hover:underline'
            >
              Sign in / Register →
            </Link>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-xl hover:bg-[#F0F0F5] text-[#9CA3AF] hover:text-[#4A4A5A] transition-colors duration-200'
            aria-label='Close menu'
          >
            <X className='w-4.5 h-4.5' />
          </button>
        </div>

        {/* ── Nav items ─────────────────────────────────── */}
        <nav className='flex-1 py-2 px-2'>
          {navItems.map(item => {
            const isActive = pathname !== '/' && pathname.startsWith(item.href)

            return (
              <div key={item.href}>
                {/* Divider */}
                {item.dividerBefore && (
                  <div className='my-1.5 border-t border-[#F0F0F5]' />
                )}

                <Link
                  href={item.href}
                  onClick={onClose}
                  title={collapsed ? item.label : undefined}
                  className={`
                    relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-0.5
                    text-sm font-medium transition-all duration-200 group
                    ${isActive
                      ? 'bg-[#EBF3FF] text-[#287DFA]'
                      : 'text-[#444B5A] hover:bg-[#F5F7FF] hover:text-[#287DFA]'
                    }
                    ${collapsed ? 'lg:justify-center lg:px-2' : ''}
                  `}
                >
                  {/* Active left-edge bar */}
                  {isActive && (
                    <span className='absolute left-0 inset-y-[4px] w-[3px] bg-[#287DFA] rounded-r-full' />
                  )}

                  {/* Icon */}
                  <item.icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-[#287DFA]' : 'text-[#7C8497] group-hover:text-[#287DFA]'
                    }`}
                  />

                  {/* Label */}
                  <span className={`flex-1 truncate transition-all duration-200 ${collapsed ? 'lg:hidden' : ''}`}>
                    {item.label}
                  </span>

                  {/* NEW badge */}
                  {item.badge && !collapsed && (
                    <span className='hidden lg:inline-flex items-center text-[9px] font-extrabold text-white bg-[#EF4444] px-1.5 py-0.5 rounded-full tracking-wide uppercase shrink-0'>
                      {item.badge}
                    </span>
                  )}
                  {item.badge && (
                    <span className='lg:hidden inline-flex items-center text-[9px] font-extrabold text-white bg-[#EF4444] px-1.5 py-0.5 rounded-full tracking-wide uppercase shrink-0'>
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* ── Collapse toggle (desktop only) ────────────── */}
        <div className='hidden lg:flex items-center border-t border-[#F0F0F5] px-3 py-3'>
          <button
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 text-xs text-[#9CA3AF] hover:text-[#287DFA] hover:bg-[#F0F5FF] rounded-xl px-2 py-1.5 transition-all duration-200 w-full ${collapsed ? 'justify-center' : ''}`}
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
