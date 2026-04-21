'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { bookingsApi, type BookingListItem } from '@/utils/api'

function EarningStatCard({ label, value, icon, color = 'primary', loading }: {
  label: string; value: string; icon: string; color?: string; loading?: boolean
}) {
  return (
    <Card>
      <CardContent className='flex items-center gap-4'>
        <Box
          className='w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0'
          sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}
        >
          <i className={`${icon} text-2xl`} />
        </Box>
        <Box>
          {loading ? (
            <><Skeleton width={80} height={32} /><Skeleton width={100} height={16} /></>
          ) : (
            <>
              <Typography variant='h5' fontWeight={700}>{value}</Typography>
              <Typography variant='body2' color='text.secondary'>{label}</Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default function VendorEarningsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    bookingsApi.list({ page: 1 })
      .then(res => setBookings(Array.isArray(res) ? res : res.results ?? []))
      .catch(e => setError(e?.message ?? 'Failed to load earnings data'))
      .finally(() => setLoading(false))
  }, [])

  const confirmed = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed')
  const pending = bookings.filter(b => b.status === 'pending')

  const totalEarned = confirmed.reduce((sum, b) => sum + parseFloat(String(b.total ?? 0)), 0)
  const pendingAmount = pending.reduce((sum, b) => sum + parseFloat(String(b.total ?? 0)), 0)

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  return (
    <Box className='p-6'>
      <Box className='mb-6'>
        <Typography variant='h4' fontWeight={700}>Earnings</Typography>
        <Typography variant='body2' color='text.secondary'>Your revenue overview and payout history</Typography>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={6} className='mb-6'>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <EarningStatCard label='Total Earned' value={fmt(totalEarned)} icon='ri-money-dollar-circle-line' color='success' loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <EarningStatCard label='Pending Payout' value={fmt(pendingAmount)} icon='ri-time-line' color='warning' loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <EarningStatCard label='Confirmed Bookings' value={String(confirmed.length)} icon='ri-checkbox-circle-line' color='info' loading={loading} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <EarningStatCard label='Total Bookings' value={String(bookings.length)} icon='ri-calendar-2-line' color='primary' loading={loading} />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant='h6' fontWeight={600} className='mb-4'>Booking Revenue</Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>Guest</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <TableCell key={j}><Skeleton height={20} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align='center'>
                      <Box className='py-10 text-center'>
                        <i className='ri-money-dollar-circle-line text-5xl text-slate-200 block mb-3' />
                        <Typography color='text.secondary'>No earnings data yet</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : bookings.map(b => (
                  <TableRow key={b.id} hover>
                    <TableCell>{b.guest_name}</TableCell>
                    <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography variant='body2' fontWeight={600} color='success.main'>
                        {b.total ? fmt(parseFloat(String(b.total))) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        size='small'
                        color={
                          b.status === 'confirmed' ? 'success'
                          : b.status === 'completed' ? 'info'
                          : b.status === 'pending' ? 'warning'
                          : 'default'
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card className='mt-6'>
        <CardContent>
          <Box className='flex items-center gap-3 mb-2'>
            <i className='ri-bank-line text-2xl text-slate-400' />
            <Typography variant='h6' fontWeight={600}>Payout Account</Typography>
          </Box>
          <Alert severity='info'>
            Payouts are processed monthly. Contact <strong>finance@adoratrip.com</strong> to set up your bank account details.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  )
}
