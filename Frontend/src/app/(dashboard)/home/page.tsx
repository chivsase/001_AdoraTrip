'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Skeleton from '@mui/material/Skeleton'
import Divider from '@mui/material/Divider'

import { useAuth } from '@/hooks/useAuth'
import { statsApi } from '@/utils/api'

/* ── role label ── */
const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  PLATFORM_STAFF: 'Platform Staff',
  PARTNER_OWNER: 'Vendor Owner',
  PARTNER_MANAGER: 'Vendor Manager',
  PARTNER_STAFF: 'Vendor Staff',
  PARTNER_FINANCE: 'Finance',
  LOCAL_GUIDE: 'Local Guide',
  TRANSPORT_PROVIDER: 'Transport Provider',
  TRAVELER: 'Traveler',
}

/* ── colour helpers ── */
const ROLE_COLORS: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error'> = {
  SUPER_ADMIN: 'error',
  PLATFORM_STAFF: 'warning',
  PARTNER_OWNER: 'primary',
  PARTNER_MANAGER: 'primary',
  PARTNER_STAFF: 'info',
  PARTNER_FINANCE: 'success',
  LOCAL_GUIDE: 'secondary',
  TRANSPORT_PROVIDER: 'secondary',
  TRAVELER: 'info',
}

/* ── Stat card ── */
function StatCard({
  label,
  value,
  icon,
  color = 'primary',
  loading,
}: {
  label: string
  value: number | string
  icon: string
  color?: string
  loading?: boolean
}) {
  return (
    <Card 
      className='overflow-hidden border-0'
      sx={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
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
            boxShadow: `0 4px 12px 0 rgba(var(--mui-palette-${color}-mainChannel), 0.15)`
          }}
        >
          <i className={`${icon} text-2xl`} />
        </Box>
        <Box>
          {loading ? (
            <>
              <Skeleton width={60} height={32} />
              <Skeleton width={80} height={16} />
            </>
          ) : (
            <>
              <Typography variant='h5' fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                {value}
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.8125rem' }}>
                {label}
              </Typography>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

/* ── Quick action button ── */
function QuickAction({ href, icon, label, color }: { href: string; icon: string; label: string; color?: string }) {
  return (
    <Button
      component={Link}
      href={href}
      variant='outlined'
      startIcon={<i className={icon} />}
      color={(color as any) || 'primary'}
      className='flex-1 justify-start normal-case py-3'
    >
      {label}
    </Button>
  )
}

/* ── TRAVELER DASHBOARD ── */
function TravelerDashboard({ stats, loading }: { stats: Record<string, any>; loading: boolean }) {
  return (
    <Grid container spacing={6}>
      {/* Welcome */}
      <Grid size={12}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Decorative blur */}
          <Box sx={{ position: 'absolute', top: -20, right: -20, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
          
          <CardContent className='p-8 relative z-10'>
            <Typography variant='h4' color='white' fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>
              Ready for your next adventure? ✈️
            </Typography>
            <Typography variant='body1' color='rgba(255,255,255,0.85)' sx={{ maxWidth: '600px', mb: 6, fontWeight: 500 }}>
              Browse Cambodia&apos;s best deals, tours, and stays — all in one place.
            </Typography>
            <Box className='flex gap-4 flex-wrap'>
              <Button component={Link} href='/deals' variant='contained' color='warning' sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
                View Deals
              </Button>
              <Button
                component={Link}
                href='/destinations'
                variant='outlined'
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.4)', 
                  borderRadius: '12px', 
                  px: 4, 
                  fontWeight: 600,
                  '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                }}
              >
                Explore Destinations
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Total Bookings' value={stats.total_bookings ?? 0} icon='ri-calendar-2-line' color='primary' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Confirmed' value={stats.confirmed_bookings ?? 0} icon='ri-checkbox-circle-line' color='success' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Pending' value={stats.pending_bookings ?? 0} icon='ri-time-line' color='warning' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Completed' value={stats.completed_bookings ?? 0} icon='ri-star-line' color='info' loading={loading} />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' fontWeight={600} className='mb-4'>Quick Actions</Typography>
            <Box className='flex flex-col gap-3'>
              <QuickAction href='/bookings' icon='ri-calendar-check-line' label='My Bookings' color='primary' />
              <QuickAction href='/deals' icon='ri-fire-line' label='Today&apos;s Deals' color='error' />
              <QuickAction href='/destinations' icon='ri-map-pin-2-line' label='Explore Destinations' color='secondary' />
              <QuickAction href='/profile' icon='ri-user-line' label='Edit Profile' />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Rewards placeholder */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6' fontWeight={600}>Rewards</Typography>
              <Chip label='Coming Soon' size='small' color='warning' />
            </Box>
            <Box className='flex items-center gap-3 mb-4'>
              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                <i className='ri-vip-crown-line text-xl' />
              </Avatar>
              <Box>
                <Typography fontWeight={700}>Bronze Member</Typography>
                <Typography variant='body2' color='text.secondary'>0 points</Typography>
              </Box>
            </Box>
            <LinearProgress variant='determinate' value={0} sx={{ height: 8, borderRadius: 4, mb: 1 }} />
            <Typography variant='caption' color='text.secondary'>
              Earn points on every booking. Redeem for discounts.
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

/* ── VENDOR DASHBOARD ── */
function VendorDashboard({ stats, loading }: { stats: Record<string, any>; loading: boolean }) {
  return (
    <Grid container spacing={6}>
      {/* Welcome */}
      <Grid size={12}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 250, height: 250, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', filter: 'blur(50px)' }} />
          
          <CardContent className='p-8 relative z-10'>
            <Typography variant='h4' color='white' fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>
              Portal Overview 🏨
            </Typography>
            <Typography variant='body1' color='rgba(255,255,255,0.9)' sx={{ maxWidth: '600px', mb: 6, fontWeight: 500 }}>
              Manage your listings, track bookings, and grow your revenue on AdoraTrip.
            </Typography>
            <Box className='flex gap-4 flex-wrap'>
              <Button component={Link} href='/vendor/listings/new' variant='contained' color='warning' sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
                + Add Listing
              </Button>
              <Button
                component={Link}
                href='/vendor/bookings'
                variant='outlined'
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.4)', 
                  borderRadius: '12px', 
                  px: 4, 
                  fontWeight: 600,
                  '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                }}
              >
                View Bookings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Organizations' value={stats.organizations ?? 0} icon='ri-building-2-line' color='primary' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Total Bookings' value={stats.total_bookings ?? 0} icon='ri-calendar-2-line' color='info' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Pending' value={stats.pending_bookings ?? 0} icon='ri-time-line' color='warning' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <StatCard label='Confirmed' value={stats.confirmed_bookings ?? 0} icon='ri-checkbox-circle-line' color='success' loading={loading} />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' fontWeight={600} className='mb-4'>Quick Actions</Typography>
            <Box className='flex flex-col gap-3'>
              <QuickAction href='/vendor/listings' icon='ri-list-check' label='My Listings' color='primary' />
              <QuickAction href='/vendor/listings/new' icon='ri-add-circle-line' label='Add New Listing' color='success' />
              <QuickAction href='/vendor/bookings' icon='ri-calendar-check-line' label='Manage Bookings' color='warning' />
              <QuickAction href='/vendor/earnings' icon='ri-money-dollar-circle-line' label='View Earnings' />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Revenue placeholder */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6' fontWeight={600}>Revenue Overview</Typography>
              <Chip label='This Month' size='small' color='primary' />
            </Box>
            <Typography variant='h3' fontWeight={700} color='success.main'>
              $0
            </Typography>
            <Typography variant='body2' color='text.secondary' className='mb-4'>
              Total revenue this month
            </Typography>
            <Divider className='mb-4' />
            <Box className='flex justify-between'>
              <Box>
                <Typography variant='caption' color='text.secondary'>Pending Payout</Typography>
                <Typography fontWeight={600}>$0</Typography>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>Commission (est.)</Typography>
                <Typography fontWeight={600}>$0</Typography>
              </Box>
              <Box>
                <Typography variant='caption' color='text.secondary'>Net Earnings</Typography>
                <Typography fontWeight={600} color='success.main'>$0</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

/* ── ADMIN DASHBOARD ── */
function AdminDashboard({ stats, loading }: { stats: Record<string, any>; loading: boolean }) {
  return (
    <Grid container spacing={6}>
      {/* Welcome */}
      <Grid size={12}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <Box sx={{ position: 'absolute', top: '50%', right: -40, width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(60px)', transform: 'translateY(-50%)' }} />
          
          <CardContent className='p-8 relative z-10'>
            <Typography variant='h4' color='white' fontWeight={800} sx={{ letterSpacing: '-1px', mb: 1 }}>
              Control Centre 🎛️
            </Typography>
            <Typography variant='body1' color='rgba(255,255,255,0.9)' sx={{ maxWidth: '600px', mb: 6, fontWeight: 500 }}>
              Manage vendors, deals, users, and platform analytics from one place.
            </Typography>
            <Box className='flex gap-4 flex-wrap'>
              <Button component={Link} href='/admin/vendors' variant='contained' color='warning' sx={{ borderRadius: '12px', px: 4, fontWeight: 700 }}>
                Review Vendors
              </Button>
              <Button
                component={Link}
                href='/admin/deals'
                variant='outlined'
                sx={{ 
                  color: 'white', 
                  borderColor: 'rgba(255,255,255,0.4)', 
                  borderRadius: '12px', 
                  px: 4, 
                  fontWeight: 600,
                  '&:hover': { background: 'rgba(255,255,255,0.1)', borderColor: 'white' }
                }}
              >
                Manage Deals
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Stats */}
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Total Users' value={stats.total_users ?? 0} icon='ri-team-line' color='primary' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Active Vendors' value={stats.active_organizations ?? 0} icon='ri-store-2-line' color='success' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Pending Approval' value={stats.pending_organizations ?? 0} icon='ri-time-line' color='warning' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Total Vendors' value={stats.total_organizations ?? 0} icon='ri-building-2-line' color='info' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Active Deals' value={stats.active_deals ?? 0} icon='ri-fire-line' color='error' loading={loading} />
      </Grid>
      <Grid size={{ xs: 6, sm: 4 }}>
        <StatCard label='Platform Revenue' value='$0' icon='ri-money-dollar-circle-line' color='secondary' loading={loading} />
      </Grid>

      {/* Quick Actions */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' fontWeight={600} className='mb-4'>Quick Actions</Typography>
            <Box className='flex flex-col gap-3'>
              <QuickAction href='/admin/vendors' icon='ri-store-2-line' label='Approve Vendors' color='warning' />
              <QuickAction href='/admin/users' icon='ri-team-line' label='Manage Users' color='primary' />
              <QuickAction href='/admin/deals' icon='ri-fire-line' label='Manage Deals' color='error' />
              <QuickAction href='/admin/destinations' icon='ri-map-pin-2-line' label='Edit Destinations' color='secondary' />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Pending vendors */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box className='flex items-center justify-between mb-4'>
              <Typography variant='h6' fontWeight={600}>Pending Vendors</Typography>
              <Button component={Link} href='/admin/vendors' size='small' variant='text'>
                View All
              </Button>
            </Box>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={40} className='mb-2' />)
            ) : (stats.pending_organizations ?? 0) === 0 ? (
              <Box className='flex flex-col items-center py-6 text-center'>
                <i className='ri-checkbox-circle-line text-4xl text-green-500 mb-2' />
                <Typography color='text.secondary' variant='body2'>
                  All vendors are processed. No pending approvals.
                </Typography>
              </Box>
            ) : (
              <Box className='flex flex-col items-center py-6 text-center'>
                <Chip
                  label={`${stats.pending_organizations} vendor(s) awaiting review`}
                  color='warning'
                  icon={<i className='ri-time-line' />}
                />
                <Button component={Link} href='/admin/vendors?status=PENDING' className='mt-4' size='small'>
                  Review Now →
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

/* ── Main Page ── */
export default function HomePage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    statsApi.me()
      .then(data => setStats(data as Record<string, any>))
      .catch(() => setStats({}))
      .finally(() => setLoading(false))
  }, [])

  const role = user?.platform_role ?? 'TRAVELER'
  const firstName = user?.full_name?.split(' ')[0] ?? 'there'

  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'PLATFORM_STAFF'
  const isPartner = new Set([
    'PARTNER_OWNER', 'PARTNER_MANAGER', 'PARTNER_STAFF',
    'PARTNER_FINANCE', 'LOCAL_GUIDE', 'TRANSPORT_PROVIDER',
  ]).has(role)

  return (
    <Box className='p-6'>
      {/* Page header */}
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>
            Welcome back, {firstName}! 👋
          </Typography>
          <Box className='flex items-center gap-2 mt-1'>
            <Chip
              label={ROLE_LABELS[role] ?? role}
              color={ROLE_COLORS[role] ?? 'default'}
              size='small'
            />
            {user?.is_email_verified ? (
              <Chip label='Verified' color='success' size='small' icon={<i className='ri-shield-check-line' />} />
            ) : (
              <Chip
                label='Email not verified'
                color='warning'
                size='small'
                component={Link as any}
                href='/verify-email'
                clickable
              />
            )}
          </Box>
        </Box>
        <Button component={Link} href='/profile' variant='outlined' startIcon={<i className='ri-user-line' />}>
          Profile
        </Button>
      </Box>

      {/* Role-specific dashboard */}
      {isSuperAdmin ? (
        <AdminDashboard stats={stats} loading={loading} />
      ) : isPartner ? (
        <VendorDashboard stats={stats} loading={loading} />
      ) : (
        <TravelerDashboard stats={stats} loading={loading} />
      )}
    </Box>
  )
}
