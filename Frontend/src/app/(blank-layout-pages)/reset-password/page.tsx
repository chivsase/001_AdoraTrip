// Next Imports
import type { Metadata } from 'next'
import { Suspense } from 'react'

// Component Imports
import ResetPassword from '@views/ResetPassword'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Set your new AdoraTrip password'
}

const ResetPasswordPage = async () => {
  const mode = await getServerMode()

  return (
    <Suspense>
      <ResetPassword mode={mode} />
    </Suspense>
  )
}

export default ResetPasswordPage
