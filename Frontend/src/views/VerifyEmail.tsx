'use client'

// React Imports
import { useEffect, useState } from 'react'

// Next Imports
import { useSearchParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'

// Util Imports
import { authApi, ApiError } from '@/utils/api'

const VerifyEmailV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'no-token'>('verifying')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-verify-email-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-verify-email-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-verify-email-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-verify-email-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser, isAuthenticated } = useAuth()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('no-token')
      setMessage('No verification token found. Check your email for the verification link.')

      return
    }

    const verify = async () => {
      try {
        const response = await authApi.verifyEmail(token)

        // Store the new access token if returned
        if (response.access) {
          localStorage.setItem('access_token', response.access)
        }

        setStatus('success')
        setMessage(response.detail || 'Email verified successfully!')

        // Refresh user data to update is_email_verified
        await refreshUser()

        // Redirect to home after 2 seconds
        setTimeout(() => router.push('/home'), 2000)
      } catch (err) {
        setStatus('error')

        if (err instanceof ApiError) {
          setMessage(err.message)
        } else {
          setMessage('An unexpected error occurred. Please try again.')
        }
      }
    }

    verify()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const handleResend = async () => {
    setIsResending(true)

    try {
      await authApi.resendVerification()
      setMessage('Verification email sent! Check your inbox.')
      setStatus('no-token')
    } catch (err) {
      if (err instanceof ApiError) {
        setMessage(err.message)
      } else {
        setMessage('Failed to resend. Please try again later.')
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='plb-12 pis-12'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[500px] max-is-full bs-auto'
          />
        </div>
        <Illustrations
          image1={{ src: '/images/illustrations/objects/tree-2.png' }}
          image2={null}
          maskImg={{ src: authBackground }}
        />
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>
        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset]'>
          <div>
            <Typography variant='h4'>Verify Email 📧</Typography>
          </div>

          {status === 'verifying' && (
            <div className='flex flex-col items-center gap-4'>
              <CircularProgress />
              <Typography>Verifying your email address...</Typography>
            </div>
          )}

          {status === 'success' && (
            <>
              <Alert severity='success'>{message}</Alert>
              <Typography className='text-center'>Redirecting to your dashboard...</Typography>
            </>
          )}

          {status === 'error' && (
            <>
              <Alert severity='error'>{message}</Alert>
              {isAuthenticated && (
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? <CircularProgress size={24} color='inherit' /> : 'Resend Verification Email'}
                </Button>
              )}
              <Typography
                className='flex justify-center items-center'
                color='primary.main'
                component={Link}
                href='/login'
              >
                <i className='ri-arrow-left-s-line mie-1' />
                <span>Back to Login</span>
              </Typography>
            </>
          )}

          {status === 'no-token' && (
            <>
              <Alert severity='info'>{message}</Alert>
              {isAuthenticated && (
                <Button
                  fullWidth
                  variant='contained'
                  onClick={handleResend}
                  disabled={isResending}
                >
                  {isResending ? <CircularProgress size={24} color='inherit' /> : 'Resend Verification Email'}
                </Button>
              )}
              <Typography
                className='flex justify-center items-center'
                color='primary.main'
                component={Link}
                href='/login'
              >
                <i className='ri-arrow-left-s-line mie-1' />
                <span>Back to Login</span>
              </Typography>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyEmailV2
