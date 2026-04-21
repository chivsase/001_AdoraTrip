'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'

import { statsApi, bookingsApi, organizationsApi, type BookingListItem, type OrgData } from '@/utils/api'

function StatCard({ label, value, icon, color = 'primary', loading }: { label: string; value: number | string; icon: string; color?: string; loading?: boolean }) {
  return (
    <Card 
      className='overflow-hidden border-0'
      sx={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        transition: 'transform 0.3s ease-in-out',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      <CardContent className='flex items-center gap-4'>
        <Box 
          className='w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0' 
          sx={{ 
            bgcolor: `${color}.lightOpacity`, 
            color: `${color}.main`,
            boxShadow: `0 4px 12px 0 rgba(var(--mui-palette-${color}-mainChannel), 0.2)`
          }}
        >
          <i className={`${icon} text-2xl`} />
        </Box>
        <Box>
          {loading ? <><Skeleton width={60} height={32} /><Skeleton width={80} height={16} /></> : (
            <>
              <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>{value}</Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}>{label}</Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<Record<string, any>>({})
  const [statsLoading, setStatsLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState<BookingListItem[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(true)
  const [orgs, setOrgs] = useState<OrgData[]>([])

  useEffect(() => {
    statsApi.me()
      .then(d => setStats(d as any))
      .catch(() => {})
      .finally(() => setStatsLoading(false))

    bookingsApi.list({ page: 1 })
      .then(res => setRecentBookings((Array.isArray(res) ? res : res.results ?? []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setBookingsLoading(false))

    organizationsApi.mine()
      .then(setOrgs)
      .catch(() => {})
  }, [])

  return (
    <Box className='p-6 min-bs-full' sx={{ background: 'radial-gradient(circle at 0% 0%, rgba(40, 125, 250, 0.03) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(255, 183, 0, 0.02) 0%, transparent 50%)' }}>
      <Box className='flex items-center justify-between mb-8'>
        <Box>
          <Typography variant='h4' fontWeight={800} sx={{ letterSpacing: '-1px' }}>Vendor Dashboard</Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 1, fontWeight: 500 }}>Manage your Kingdom-wide listings and bookings</Typography>
        </Box>
        <Button 
          component={Link} 
          href='/vendor/listings/new' 
          variant='contained' 
          startIcon={<i className='ri-add-line' />}
          sx={{ 
            borderRadius: '14px', 
            px: 6, 
            py: 2.5,
            boxShadow: '0 8px 20px -6px rgba(40, 125, 250, 0.5)'
          }}
        >
          Add Listing
        </Button>
      </Box>

      <Grid container spacing={6}>
        {/* Stats */}
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label='Organizations' value={stats.organizations ?? orgs.length} icon='ri-building-2-line' color='primary' loading={statsLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label='Total Bookings' value={stats.total_bookings ?? 0} icon='ri-calendar-2-line' color='info' loading={statsLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label='Pending' value={stats.pending_bookings ?? 0} icon='ri-time-line' color='warning' loading={statsLoading} />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard label='Confirmed' value={stats.confirmed_bookings ?? 0} icon='ri-checkbox-circle-line' color='success' loading={statsLoading} />
        </Grid>

        {/* My Organizations */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-4'>
                <Typography variant='h6' fontWeight={600}>My Organizations</Typography>
                <Button size='small' component={Link} href='/profile'>View All</Button>
              </Box>
              {orgs.length === 0 ? (
                <Box className='text-center py-6'>
                  <i className='ri-building-2-line text-4xl text-slate-200 mb-2 block' />
                  <Typography variant='body2' color='text.secondary' className='mb-3'>
                    No organizations yet.
                  </Typography>
                  <Button variant='outlined' size='small' component={Link} href='/vendor/onboarding'>
                    Register Vendor
                  </Button>
                </Box>
              ) : (
                orgs.map(org => (
                  <Box key={org.id} className='flex items-center justify-between py-3 border-b last:border-b-0'>
                    <Box>
                      <Typography variant='body2' fontWeight={600}>{org.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>{org.org_type}</Typography>
                    </Box>
                    <Chip
                      label={org.status}
                      size='small'
                      color={org.status === 'ACTIVE' ? 'success' : org.status === 'PENDING' ? 'warning' : 'error'}
                    />
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Bookings */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box className='flex items-center justify-between mb-4'>
                <Typography variant='h6' fontWeight={600}>Recent Bookings</Typography>
                <Button size='small' component={Link} href='/vendor/bookings'>View All</Button>
              </Box>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Guest</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align='right'>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bookingsLoading ? (
                      Array.from({ length: 4 }).map((_, i) => (
                        <TableRow key={i}>{Array.from({ length: 4 }).map((__, j) => <TableCell key={j}><Skeleton height={20} /></TableCell>)}</TableRow>
                      ))
                    ) : recentBookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center'>
                          <Typography variant='body2' color='text.secondary' className='py-4'>No bookings yet</Typography>
                        </TableCell>
                      </TableRow>
                    ) : recentBookings.map(b => (
                      <TableRow key={b.id} hover>
                        <TableCell>{b.guest_name}</TableCell>
                        <TableCell>{new Date(b.booking_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={b.status}
                            size='small'
                            color={b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell align='right'>
                          {b.status === 'pending' && (
                            <Button size='small' color='success' variant='outlined' onClick={async () => {
                              try { await bookingsApi.confirm(b.id); setRecentBookings(prev => prev.map(x => x.id === b.id ? { ...x, status: 'confirmed' as const } : x)) } catch {}
                            }}>
                              Confirm
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant='h6' fontWeight={600} className='mb-4'>Quick Actions</Typography>
              <Box className='flex flex-wrap gap-3'>
                <Button component={Link} href='/vendor/listings' variant='outlined' startIcon={<i className='ri-list-check' />}>My Listings</Button>
                <Button component={Link} href='/vendor/listings/new' variant='outlined' color='success' startIcon={<i className='ri-add-circle-line' />}>Add New Listing</Button>
                <Button component={Link} href='/vendor/bookings' variant='outlined' color='warning' startIcon={<i className='ri-calendar-check-line' />}>Manage Bookings</Button>
                <Button component={Link} href='/vendor/deals' variant='outlined' color='error' startIcon={<i className='ri-fire-line' />}>Create Deal</Button>
                <Button component={Link} href='/vendor/earnings' variant='outlined' color='info' startIcon={<i className='ri-money-dollar-circle-line' />}>Earnings</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
