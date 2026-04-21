'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { bookingsApi, type BookingListItem } from '@/utils/api'

const STATUS_CHIP: Record<string, { color: 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary'; label: string }> = {
  pending:   { color: 'warning', label: 'Pending' },
  confirmed: { color: 'success', label: 'Confirmed' },
  cancelled: { color: 'error',   label: 'Cancelled' },
  completed: { color: 'primary', label: 'Completed' },
}

function BookingRow({ booking, onCancel }: { booking: BookingListItem; onCancel: (id: string) => void }) {
  const chip = STATUS_CHIP[booking.status] ?? { color: 'default', label: booking.status }

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant='body2' fontWeight={600}>
          {booking.tour?.title ?? 'N/A'}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          {booking.guest_name}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant='body2'>
          {new Date(booking.booking_date).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
          })}
        </Typography>
      </TableCell>
      <TableCell>{booking.participants}</TableCell>
      <TableCell>
        <Chip label={chip.label} color={chip.color} size='small' />
      </TableCell>
      <TableCell>
        <Typography variant='body2' fontWeight={600}>
          ${booking.total ?? '—'}
        </Typography>
      </TableCell>
      <TableCell>
        <Box className='flex items-center gap-2'>
          <Button component={Link} href={`/bookings/${booking.id}`} size='small' variant='outlined'>
            View
          </Button>
          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <Button
              size='small'
              color='error'
              variant='outlined'
              onClick={() => onCancel(booking.id)}
            >
              Cancel
            </Button>
          )}
        </Box>
      </TableCell>
    </TableRow>
  )
}

function EmptyState() {
  return (
    <Box className='flex flex-col items-center py-16 text-center'>
      <i className='ri-calendar-2-line text-6xl text-slate-200 mb-4' />
      <Typography variant='h6' color='text.secondary' gutterBottom>
        No bookings yet
      </Typography>
      <Typography variant='body2' color='text.secondary' className='mb-6 max-w-xs'>
        Your bookings will appear here once you book a tour, hotel, or experience.
      </Typography>
      <Button component={Link} href='/deals' variant='contained' startIcon={<i className='ri-fire-line' />}>
        Browse Deals
      </Button>
    </Box>
  )
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((__, j) => (
            <TableCell key={j}><Skeleton height={24} /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('all')
  const [cancelling, setCancelling] = useState<string | null>(null)

  const loadBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await bookingsApi.list()
      setBookings(Array.isArray(res) ? res : res.results ?? [])
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadBookings() }, [])

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      await bookingsApi.cancel(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>My Bookings</Typography>
          <Typography variant='body2' color='text.secondary' className='mt-1'>
            Track and manage all your bookings
          </Typography>
        </Box>
        <Button component={Link} href='/deals' variant='contained' startIcon={<i className='ri-add-line' />}>
          Book Now
        </Button>
      </Box>

      {error && (
        <Alert severity='error' className='mb-4' onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              <Tab label={`All (${bookings.length})`} value='all' />
              <Tab label='Pending' value='pending' />
              <Tab label='Confirmed' value='confirmed' />
              <Tab label='Completed' value='completed' />
              <Tab label='Cancelled' value='cancelled' />
            </TabList>
          </Box>

          <TabPanel value={tab} sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Pax</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(b => (
                      <BookingRow
                        key={b.id}
                        booking={b}
                        onCancel={handleCancel}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      </Card>
    </Box>
  )
}
