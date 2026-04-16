'use client'

import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useRouter } from 'next/navigation'

import CircularProgress from '@mui/material/CircularProgress'

import { useAuth } from '@/hooks/useAuth'

/**
 * Wraps protected pages. Shows a loading spinner while auth state is resolving.
 * Redirects to /login if the user is not authenticated.
 */
const AuthGuard = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-bs-[100dvh]'>
        <CircularProgress />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

export default AuthGuard
