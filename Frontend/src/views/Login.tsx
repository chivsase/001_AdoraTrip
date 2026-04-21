'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import Illustrations from '@components/Illustrations'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'
import { useAuth } from '@/hooks/useAuth'

// Util Imports
import { ApiError } from '@/utils/api'

const LoginV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const { login } = useAuth()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await login({ email, password })
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
    <div className='flex bs-full bg-slate-900 relative overflow-hidden'>
      {/* Cinematic Background */}
      <div className='absolute inset-0 z-0'>
        <img
          src='/images/landing/hero.png'
          alt='Angkor Wat'
          className='w-full h-full object-cover opacity-60'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent' />
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,183,0,0.1),transparent_50%)]' />
      </div>

      <div className='flex justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden z-10'>
        <div className='flex flex-col justify-center items-start pl-12 max-w-2xl'>
          <div className='inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-bold px-4 py-2 rounded-full mb-8 tracking-widest uppercase'>
            <span className='text-base leading-none'>🇰🇭</span>
            Secure Marketplace Access
          </div>
          <Typography variant='h1' className='text-white font-black text-6xl leading-[1.05] tracking-tight mb-6'>
            The Kingdom <br />
            of <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#FFD166] to-[#FFA500]'>Adoration</span>
          </Typography>
          <Typography className='text-white/70 text-lg font-medium max-w-lg leading-relaxed'>
            Experience the next generation of travel management. 
            Connect with millions of travelers and manage your inventory with ease.
          </Typography>
        </div>
      </div>
      <Box 
        className='flex justify-center items-center bs-full !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[540px] relative z-20'
        sx={{
          backgroundColor: 'transparent'
        }}
      >
        <Box 
          className='flex flex-col gap-6 is-full sm:is-auto md:is-full p-8 rounded-[32px] border border-white/10'
          sx={{
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 32px 64px -16px rgba(0,0,0,0.3)',
            maxWidth: '460px'
          }}
        >
          <div>
            <Logo className='mb-8' />
            <Typography variant='h4' fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>Welcome back</Typography>
            <Typography className='mbs-1' color='text.secondary' fontWeight={500}>Sign in to manage your AdoraTrip workspace</Typography>
          </div>
          {error && <Alert severity='error'>{error}</Alert>}
          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-5'>
            <TextField
              autoFocus
              fullWidth
              label='Email'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <TextField
              fullWidth
              label='Password'
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
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />
            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel control={<Checkbox />} label='Remember me' />
              <Typography className='text-end' color='primary.main' component={Link} href='/forgot-password'>
                Forgot password?
              </Typography>
            </div>
            <Button fullWidth variant='contained' type='submit' disabled={isSubmitting}>
              {isSubmitting ? <CircularProgress size={24} color='inherit' /> : 'Log In'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>New on our platform?</Typography>
              <Typography component={Link} href='/register' color='primary.main'>
                Create an account
              </Typography>
            </div>
            <Divider className='gap-3'>or</Divider>
            <div className='flex justify-center items-center gap-2'>
              <IconButton
                size='small'
                className='text-googlePlus'
                onClick={() => {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
                  const baseUrl = new URL(apiUrl).origin

                  window.location.href = `${baseUrl}/accounts/google/login/?process=login`
                }}
              >
                <i className='ri-google-fill' />
              </IconButton>
            </div>
          </form>
        </Box>
      </Box>
    </div>
  )
}

export default LoginV2
