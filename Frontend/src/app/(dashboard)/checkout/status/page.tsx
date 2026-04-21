'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Link from 'next/link'

import { paymentsApi } from '@/utils/api'

function StatusChecker() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'completed' | 'failed' | 'error'>('pending')
  const [bookingRef, setBookingRef] = useState<string | null>(null)

  const tranId = searchParams.get('tran_id')

  useEffect(() => {
    if (!tranId) {
      setStatus('error')
      setLoading(false)
      return
    }

    // Polling logic to check the backend for the updated status (from Webhook)
    let attempts = 0
    const maxAttempts = 5

    const check = async () => {
      try {
        const res = await paymentsApi.checkStatus(tranId)
        setBookingRef(res.reference)
        
        if (res.status === 'completed') {
          setStatus('completed')
          setLoading(false)
        } else if (res.status === 'failed') {
          setStatus('failed')
          setLoading(false)
        } else {
          // Still pending, try again in 3 seconds
          if (attempts < maxAttempts) {
            attempts++
            setTimeout(check, 3000)
          } else {
            setStatus('pending') // Timeout
            setLoading(false)
          }
        }
      } catch (err) {
        setStatus('error')
        setLoading(false)
      }
    }

    check()
  }, [tranId])

  if (loading) {
    return (
      <Box className='flex flex-col items-center justify-center p-12 py-24 text-center'>
        <CircularProgress size={60} className='mb-6' />
        <Typography variant='h5' fontWeight={700} gutterBottom>Verifying Your Payment...</Typography>
        <Typography variant='body2' color='text.secondary'>
          We are confirming your transaction with ABA PayWay.
        </Typography>
      </Box>
    )
  }

  return (
    <Box className='flex flex-col items-center justify-center p-12 py-24'>
      <Card className='max-w-md w-full'>
        <CardContent className='text-center p-8'>
          {status === 'completed' && (
            <>
              <Box className='w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-6'>
                <i className='ri-checkbox-circle-fill text-5xl' />
              </Box>
              <Typography variant='h4' fontWeight={700} gutterBottom>Payment Successful!</Typography>
              <Typography variant='body1' color='text.secondary' className='mb-6'>
                Your booking <strong>{bookingRef}</strong> has been confirmed. A confirmation email has been sent to you.
              </Typography>
              <Button variant='contained' fullWidth component={Link} href='/my-bookings' size='large'>
                View My Bookings
              </Button>
            </>
          )}

          {(status === 'failed' || status === 'error') && (
            <>
              <Box className='w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-6'>
                <i className='ri-error-warning-fill text-5xl' />
              </Box>
              <Typography variant='h4' fontWeight={700} gutterBottom>Payment Failed</Typography>
              <Typography variant='body1' color='text.secondary' className='mb-6'>
                We couldn't verify your payment. If you've been charged, please contact support with reference: <strong>{tranId}</strong>.
              </Typography>
              <Button variant='contained' fullWidth component={Link} href='/' size='large'>
                Back to Home
              </Button>
            </>
          )}

          {status === 'pending' && (
            <>
              <Box className='w-20 h-20 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-6'>
                <i className='ri-time-fill text-5xl' />
              </Box>
              <Typography variant='h4' fontWeight={700} gutterBottom>Verification Pending</Typography>
              <Typography variant='body1' color='text.secondary' className='mb-6'>
                Your payment is still being processed. It may take a few minutes to confirm.
              </Typography>
              <Button variant='contained' fullWidth component={Link} href='/my-bookings' size='large'>
                Check Bookings Later
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default function CheckoutStatusPage() {
  return (
    <Suspense>
      <StatusChecker />
    </Suspense>
  )
}
