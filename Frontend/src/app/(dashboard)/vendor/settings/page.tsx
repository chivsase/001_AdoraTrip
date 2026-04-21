'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

export default function VendorSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [abaConnected, setAbaConnected] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    // mock save
    await new Promise(res => setTimeout(res, 800))
    setSaving(false)
    setSuccess(true)
  }

  return (
    <Box className='p-6 max-w-5xl mx-auto'>
      <Box className='mb-6'>
        <Typography variant='h4' fontWeight={700}>Settings</Typography>
        <Typography variant='body2' color='text.secondary'>Manage your business profile and payouts.</Typography>
      </Box>

      {success && <Alert severity='success' className='mb-6'>Settings updated successfully.</Alert>}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <form onSubmit={handleSave}>
            <Card className='mb-6'>
              <CardContent sx={{ p: 4 }}>
                <Typography variant='h6' fontWeight={600} className='mb-4'>Business Profile</Typography>
                <Grid container spacing={4}>
                  <Grid size={12}>
                    <TextField fullWidth label='Business Name' defaultValue='Acme Tours Cambodia' />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label='Contact Email' defaultValue='contact@acmetours.com' />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label='Contact Phone' defaultValue='+855 12 345 678' />
                  </Grid>
                  <Grid size={12}>
                    <TextField fullWidth label='Business Address' defaultValue='No 123, Street 456, Phnom Penh' multiline rows={2} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Box className='flex justify-end'>
              <Button type='submit' variant='contained' disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </form>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant='h6' fontWeight={600} className='mb-2'>Payout Methods</Typography>
              <Typography variant='body2' color='text.secondary' className='mb-6'>
                Connect your local ABA bank account to receive automated payout batches.
              </Typography>

              <Box className='p-4 border rounded bg-slate-50 mb-4'>
                <Box className='flex items-center justify-between mb-4'>
                  <Typography fontWeight={600}>ABA PayWay</Typography>
                  {abaConnected ? (
                    <Chip size='small' label='Connected' color='success' />
                  ) : (
                    <Chip size='small' label='Not Connected' color='default' />
                  )}
                </Box>
                
                {abaConnected ? (
                  <>
                    <Typography variant='body2' className='mb-4'>Account: *** *** 999</Typography>
                    <Button variant='outlined' color='error' fullWidth onClick={() => setAbaConnected(false)}>
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button variant='contained' color='primary' fullWidth onClick={() => setAbaConnected(true)}>
                    Connect ABA Account
                  </Button>
                )}
              </Box>

              <Divider className='my-4' />
              
              <Typography variant='subtitle2' className='mb-2'>Payout Schedule</Typography>
              <Typography variant='body2' color='text.secondary'>
                Payouts are processed automatically every Monday for the previous week's completed bookings.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
