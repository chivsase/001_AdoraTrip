'use client'

import { useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import type { PayWayPayload } from '@/utils/api'

interface PayWayCheckoutFormProps {
  payload: PayWayPayload
}

/**
 * A specialized component that renders a hidden HTML form 
 * and automatically submits it to the ABA PayWay checkout gateway.
 */
export default function PayWayCheckoutForm({ payload }: PayWayCheckoutFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Auto-submit the form after a short delay to allow UI to render
    const timer = setTimeout(() => {
      if (formRef.current) {
        formRef.current.submit()
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [payload])

  return (
    <Box className='flex flex-col items-center justify-center p-12 text-center'>
      <CircularProgress size={60} thickness={4} className='mb-6' />
      <Typography variant='h5' fontWeight={700} gutterBottom>
        Redirecting to ABA PayWay...
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        Please do not refresh the page or close the window.
      </Typography>

      {/* Hidden form required by ABA PayWay POST flow */}
      <form ref={formRef} action={payload.aba_url} method='POST' style={{ display: 'none' }}>
        <input type='hidden' name='req_time' value={payload.req_time} />
        <input type='hidden' name='merchant_id' value={payload.merchant_id} />
        <input type='hidden' name='tran_id' value={payload.tran_id} />
        <input type='hidden' name='amount' value={payload.amount} />
        <input type='hidden' name='items' value={payload.items} />
        <input type='hidden' name='currency' value={payload.currency} />
        <input type='hidden' name='return_url' value={payload.return_url} />
        <input type='hidden' name='hash' value={payload.hash} />
      </form>
    </Box>
  )
}
