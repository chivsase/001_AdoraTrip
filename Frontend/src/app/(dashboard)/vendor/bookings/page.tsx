'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
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

const STATUS_CHIP: Record<string, { color: 'default' | 'warning' | 'success' | 'error' | 'primary'; label: string }> = {
  pending:   { color: 'warning', label: 'Pending' },
  confirmed: { color: 'success', label: 'Confirmed' },
  cancelled: { color: 'error',   label: 'Cancelled' },
  completed: { color: 'primary', label: 'Completed' },
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('all')

  const load = () => {
    setLoading(true)
    bookingsApi.list()
      .then(res => setBookings(Array.isArray(res) ? res : res.results ?? []))
      .catch(e => setError(e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleConfirm = async (id: string) => {
    try {
      await bookingsApi.confirm(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'confirmed' as const } : b))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to confirm')
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return
    try {
      await bookingsApi.cancel(id)
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' as const } : b))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to cancel')
    }
  }

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Bookings</Typography>
          <Typography variant='body2' color='text.secondary'>Manage incoming reservations</Typography>
        </Box>
        <Button variant='outlined' startIcon={<i className='ri-refresh-line' />} onClick={load}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              <Tab label={`All (${bookings.length})`} value='all' />
              <Tab label={`Pending (${bookings.filter(b => b.status === 'pending').length})`} value='pending' />
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
                    <TableCell>Guest</TableCell>
                    <TableCell>Tour / Item</TableCell>
                    <TableCell>Booking Date</TableCell>
                    <TableCell>Participants</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => <TableCell key={j}><Skeleton height={24} /></TableCell>)}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align='center'>
                        <Box className='py-12 text-center'>
                          <i className='ri-calendar-2-line text-5xl text-slate-200 block mb-3' />
                          <Typography color='text.secondary'>No bookings in this category</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(b => {
                    const chip = STATUS_CHIP[b.status] ?? { color: 'default' as const, label: b.status }
                    return (
                      <TableRow key={b.id} hover>
                        <TableCell>
                          <Typography variant='body2' fontWeight={600}>{b.guest_name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{b.tour?.title ?? '—'}</Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(b.booking_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>{b.participants}</TableCell>
                        <TableCell>
                          <Chip label={chip.label} color={chip.color} size='small' />
                        </TableCell>
                        <TableCell>
                          <Box className='flex gap-2'>
                            {b.status === 'pending' && (
                              <Button size='small' color='success' variant='contained' onClick={() => handleConfirm(b.id)}>
                                Confirm
                              </Button>
                            )}
                            {(b.status === 'pending' || b.status === 'confirmed') && (
                              <Button size='small' color='error' variant='outlined' onClick={() => handleCancel(b.id)}>
                                Cancel
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      </Card>
    </Box>
  )
}
