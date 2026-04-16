'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useSearchParams, useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
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

// Util Imports
import { authApi, ApiError } from '@/utils/api'

const ResetPasswordV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [isConfirmShown, setIsConfirmShown] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-reset-password-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-reset-password-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-reset-password-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-reset-password-light-border.png'

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Missing reset token. Please use the link from your email.')

      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')

      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')

      return
    }

    setIsSubmitting(true)

    try {
      await authApi.confirmPasswordReset({ token, new_password: password })
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
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
            <Typography variant='h4'>Reset Password 🔒</Typography>
            <Typography className='mbs-1'>Your new password must be different from previously used passwords</Typography>
          </div>
          {error && <Alert severity='error'>{error}</Alert>}
          {success && <Alert severity='success'>{success}</Alert>}
          {!token ? (
            <Alert severity='warning'>
              Invalid or missing reset token. Please request a new password reset link from the{' '}
              <Typography component={Link} href='/forgot-password' color='primary.main'>
                forgot password page
              </Typography>
              .
            </Alert>
          ) : (
            <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
              <TextField
                autoFocus
                fullWidth
                label='New Password'
                type={isPasswordShown ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setIsPasswordShown(show => !show)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                fullWidth
                label='Confirm Password'
                type={isConfirmShown ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          size='small'
                          edge='end'
                          onClick={() => setIsConfirmShown(show => !show)}
                          onMouseDown={e => e.preventDefault()}
                        >
                          <i className={isConfirmShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Set New Password'}
              </Button>
              <Typography
                className='flex justify-center items-center'
                color='primary.main'
                component={Link}
                href='/login'
              >
                <i className='ri-arrow-left-s-line mie-1' />
                <span>Back to Login</span>
              </Typography>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordV2
