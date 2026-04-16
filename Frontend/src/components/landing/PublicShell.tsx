'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

/**
 * PublicShell
 * ─────────────────────────────────────────────────────────
 * Client-side layout wrapper for all public (unauthenticated) pages.
 * Holds the shared sidebar open/collapse state so TopBar's hamburger
 * and Sidebar can communicate without prop-drilling through Server Components.
 *
 * Structure:
 *   ┌──────────────────────────────────────────────┐
 *   │  TopBar  (sticky, full-width, h-[52px])      │
 *   ├────────────┬─────────────────────────────────┤
 *   │  Sidebar   │  <main>                         │
 *   │  (sticky)  │  {children}  (page content)     │
 *   └────────────┴─────────────────────────────────┘
 */
export default function PublicShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className='flex flex-col min-h-screen font-sans antialiased text-[#1A1A2E]'>
      {/* ── Top bar ── */}
      <TopBar onMenuToggle={() => setSidebarOpen(v => !v)} />

      {/* ── Body row (sidebar + main) ── */}
      <div className='flex flex-1'>
        <Sidebar
          open={sidebarOpen}
          collapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed(v => !v)}
        />

        {/* Main content — grows to fill remaining width */}
        <main className='flex-1 min-w-0'>
          {children}
        </main>
      </div>
    </div>
  )
}
