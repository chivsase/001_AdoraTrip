'use client'

import { useEffect } from 'react'

import { useSearchParams, useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

import { useAuth } from '@/hooks/useAuth'

const OAuthCallback = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('access_token')
    const error = searchParams.get('error')

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`)

      return
    }

    if (accessToken) {
      localStorage.setItem('access_token', accessToken)
      refreshUser().then(() => {
        router.replace('/home')
      })
    } else {
      router.replace('/login?error=missing_token')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex flex-col items-center justify-center min-bs-[100dvh] gap-4'>
      <CircularProgress />
      <Typography>Completing sign in...</Typography>
    </div>
  )
}

export default OAuthCallback
