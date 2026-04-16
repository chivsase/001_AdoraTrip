// Next Imports
import type { Metadata } from 'next'
import { Suspense } from 'react'

// Component Imports
import OAuthCallback from '@views/OAuthCallback'

export const metadata: Metadata = {
  title: 'Signing In...',
  description: 'Completing OAuth sign-in'
}

const OAuthCallbackPage = () => {
  return (
    <Suspense>
      <OAuthCallback />
    </Suspense>
  )
}

export default OAuthCallbackPage
