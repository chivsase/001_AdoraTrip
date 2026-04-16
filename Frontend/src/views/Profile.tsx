'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'

// Next Imports
import Link from 'next/link'

// Hook Imports
import { useAuth } from '@/hooks/useAuth'

const ProfileView = () => {
  const { user } = useAuth()

  if (!user) return null

  // Calculate profile completion
  const completionChecks = [
    !!user.full_name,
    !!user.phone,
    !!user.avatar,
    user.is_email_verified,
    user.google_linked || user.facebook_linked
  ]

  const completionPercent = Math.round((completionChecks.filter(Boolean).length / completionChecks.length) * 100)

  const roleLabel = user.platform_role
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())

  const roleColor: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'error' | 'secondary'> = {
    SUPER_ADMIN: 'error',
    PLATFORM_STAFF: 'warning',
    PARTNER_OWNER: 'primary',
    PARTNER_MANAGER: 'info',
    PARTNER_STAFF: 'info',
    PARTNER_FINANCE: 'info',
    LOCAL_GUIDE: 'success',
    TRANSPORT_PROVIDER: 'success',
    TRAVELER: 'secondary'
  }

  return (
    <Grid container spacing={6}>
      {/* Profile Header Card */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardMedia
            image='/images/pages/auth-v2-mask-dark.png'
            className='bs-[200px]'
            sx={{ backgroundColor: 'primary.main' }}
          />
          <CardContent className='flex gap-6 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
            <div className='flex rounded-bs-md mbs-[-45px] border-[5px] border-backgroundPaper bg-backgroundPaper'>
              <Avatar
                src={user.avatar || ''}
                alt={user.full_name}
                sx={{ width: 120, height: 120, fontSize: '2.5rem' }}
                variant='rounded'
              >
                {(user.full_name || user.email).charAt(0).toUpperCase()}
              </Avatar>
            </div>
            <div className='flex is-full flex-wrap justify-center flex-col items-center sm:flex-row sm:justify-between sm:items-end gap-5'>
              <div className='flex flex-col items-center sm:items-start gap-2'>
                <Typography variant='h4'>{user.full_name || 'No Name'}</Typography>
                <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-shield-user-line text-textSecondary' />
                    <Typography className='font-medium'>{roleLabel}</Typography>
                  </div>
                  {user.phone && (
                    <div className='flex items-center gap-2'>
                      <i className='ri-phone-line text-textSecondary' />
                      <Typography className='font-medium'>{user.phone}</Typography>
                    </div>
                  )}
                  <div className='flex items-center gap-2'>
                    <i className='ri-calendar-line text-textSecondary' />
                    <Typography className='font-medium'>
                      Joined {new Date(user.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </Typography>
                  </div>
                </div>
              </div>
              <Button variant='contained' component={Link} href='/settings' className='flex gap-2'>
                <i className='ri-edit-line text-base' />
                <span>Edit Profile</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Left Column */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Grid container spacing={6}>
          {/* About Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex flex-col gap-6'>
                <div className='flex flex-col gap-4'>
                  <Typography variant='caption' className='uppercase'>
                    About
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='ri-user-3-line text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Full Name:</Typography>
                      <Typography>{user.full_name || 'Not set'}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-shield-user-line text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Role:</Typography>
                      <Chip
                        label={roleLabel}
                        color={roleColor[user.platform_role] || 'default'}
                        size='small'
                        variant='tonal'
                      />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <Typography variant='caption' className='uppercase'>
                    Contacts
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='ri-mail-line text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Email:</Typography>
                      <Typography>{user.email}</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-phone-line text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Phone:</Typography>
                      <Typography>{user.phone || 'Not set'}</Typography>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col gap-4'>
                  <Typography variant='caption' className='uppercase'>
                    Linked Accounts
                  </Typography>
                  <div className='flex items-center gap-2'>
                    <i className='ri-google-fill text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Google:</Typography>
                      <Chip
                        label={user.google_linked ? 'Connected' : 'Not Connected'}
                        color={user.google_linked ? 'success' : 'default'}
                        size='small'
                        variant='tonal'
                      />
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <i className='ri-facebook-circle-fill text-textSecondary' />
                    <div className='flex items-center flex-wrap gap-2'>
                      <Typography className='font-medium'>Facebook:</Typography>
                      <Chip
                        label={user.facebook_linked ? 'Connected' : 'Not Connected'}
                        color={user.facebook_linked ? 'success' : 'default'}
                        size='small'
                        variant='tonal'
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Completion Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <div className='flex justify-between items-center'>
                  <Typography variant='h6'>Profile Completion</Typography>
                  <Typography variant='h6' color='primary'>
                    {completionPercent}%
                  </Typography>
                </div>
                <LinearProgress
                  variant='determinate'
                  value={completionPercent}
                  color={completionPercent === 100 ? 'success' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <div className='flex flex-col gap-2'>
                  {[
                    { done: !!user.full_name, label: 'Add your full name' },
                    { done: !!user.phone, label: 'Add a phone number' },
                    { done: !!user.avatar, label: 'Upload a profile photo' },
                    { done: user.is_email_verified, label: 'Verify your email' },
                    { done: user.google_linked || user.facebook_linked, label: 'Link a social account' }
                  ].map((item, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <i
                        className={item.done ? 'ri-checkbox-circle-line text-success' : 'ri-checkbox-blank-circle-line text-textDisabled'}
                      />
                      <Typography
                        variant='body2'
                        color={item.done ? 'text.primary' : 'text.disabled'}
                        sx={{ textDecoration: item.done ? 'line-through' : 'none' }}
                      >
                        {item.label}
                      </Typography>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Verification Status */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent className='flex flex-col gap-4'>
                <Typography variant='caption' className='uppercase'>
                  Verification Status
                </Typography>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-mail-check-line text-textSecondary' />
                    <Typography>Email</Typography>
                  </div>
                  <Chip
                    label={user.is_email_verified ? 'Verified' : 'Unverified'}
                    color={user.is_email_verified ? 'success' : 'warning'}
                    size='small'
                    variant='tonal'
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <i className='ri-phone-line text-textSecondary' />
                    <Typography>Phone</Typography>
                  </div>
                  <Chip
                    label={user.is_phone_verified ? 'Verified' : 'Unverified'}
                    color={user.is_phone_verified ? 'success' : 'warning'}
                    size='small'
                    variant='tonal'
                  />
                </div>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>

      {/* Right Column */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Grid container spacing={6}>
          {/* Overview Stats */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant='caption' className='uppercase mbe-4' component='div'>
                  Overview
                </Typography>
                <div className='flex flex-wrap gap-x-12 gap-y-6'>
                  <div className='flex items-center gap-3'>
                    <Avatar variant='rounded' sx={{ backgroundColor: 'primary.main', width: 44, height: 44 }}>
                      <i className='ri-building-line' />
                    </Avatar>
                    <div>
                      <Typography variant='h5'>{user.org_memberships.length}</Typography>
                      <Typography variant='body2'>Organizations</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Avatar variant='rounded' sx={{ backgroundColor: 'success.main', width: 44, height: 44 }}>
                      <i className='ri-link' />
                    </Avatar>
                    <div>
                      <Typography variant='h5'>
                        {[user.google_linked, user.facebook_linked].filter(Boolean).length}
                      </Typography>
                      <Typography variant='body2'>Connected Accounts</Typography>
                    </div>
                  </div>
                  <div className='flex items-center gap-3'>
                    <Avatar variant='rounded' sx={{ backgroundColor: 'info.main', width: 44, height: 44 }}>
                      <i className='ri-verified-badge-line' />
                    </Avatar>
                    <div>
                      <Typography variant='h5'>
                        {[user.is_email_verified, user.is_phone_verified].filter(Boolean).length}/2
                      </Typography>
                      <Typography variant='body2'>Verifications</Typography>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Grid>

          {/* Organizations Card */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant='h6' className='mbe-4'>
                  Organizations
                </Typography>
                {user.org_memberships.length === 0 ? (
                  <Box className='flex flex-col items-center justify-center gap-3 pbs-6 pbe-10'>
                    <Avatar sx={{ width: 60, height: 60, backgroundColor: 'action.hover' }}>
                      <i className='ri-building-line text-textSecondary text-[28px]' />
                    </Avatar>
                    <div className='text-center'>
                      <Typography variant='h6'>No Organizations Yet</Typography>
                      <Typography variant='body2' color='text.secondary'>
                        You are not a member of any organization.
                      </Typography>
                    </div>
                  </Box>
                ) : (
                  <div className='flex flex-col gap-4'>
                    {user.org_memberships.map(org => (
                      <Card key={org.org_id} variant='outlined'>
                        <CardContent className='flex items-center gap-4 !pbs-4 !pbe-4'>
                          <Avatar variant='rounded' sx={{ backgroundColor: 'primary.lighter', color: 'primary.main' }}>
                            <i className='ri-building-line' />
                          </Avatar>
                          <div className='flex-1 overflow-hidden'>
                            <Typography variant='subtitle1' noWrap>
                              {org.org_name}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' noWrap>
                              {org.org_type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                            </Typography>
                          </div>
                          <Chip
                            label={org.role.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}
                            size='small'
                            variant='tonal'
                            color='primary'
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default ProfileView
