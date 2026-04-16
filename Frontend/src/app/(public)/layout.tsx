import type { ReactNode } from 'react'
import PublicShell from '@/components/landing/PublicShell'

export const metadata = {
  title: 'AdoraTrip — Flights, Hotels & Travel Deals',
  description:
    'Book flights, hotels, trains, and travel packages at the best prices. Trusted by millions of travelers worldwide.'
}

/**
 * Public layout — wraps all unauthenticated pages with the
 * TopBar + left Sidebar shell.  PublicShell is a Client Component
 * so it can own the sidebar open/collapse state; this layout stays
 * a Server Component so metadata export works correctly.
 */
const PublicLayout = ({ children }: { children: ReactNode }) => {
  return <PublicShell>{children}</PublicShell>
}

export default PublicLayout
