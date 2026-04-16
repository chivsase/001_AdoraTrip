'use client'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'

// Hook Imports
import { useAuth } from '@/hooks/useAuth'

const ProfileView = () => {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12, md: 5 }}>
        <Card>
          <CardContent className='flex flex-col items-center text-center gap-4 pbs-10'>
            <Avatar src={user.avatar || ''} alt={user.full_name} sx={{ width: 120, height: 120 }} />
            <div>
              <Typography variant='h5'>{user.full_name || 'No Name'}</Typography>
              <Typography color='text.secondary'>{user.email}</Typography>
            </div>
            <Chip
              label={user.platform_role.replace(/_/g, ' ')}
              color='primary'
              variant='tonal'
              size='small'
            />
          </CardContent>
          <Divider />
          <CardContent>
            <div className='flex flex-col gap-4'>
              <div className='flex justify-between'>
                <Typography color='text.secondary'>Phone</Typography>
                <Typography>{user.phone || 'Not set'}</Typography>
              </div>
              <div className='flex justify-between'>
                <Typography color='text.secondary'>Email Verified</Typography>
                <Chip
                  label={user.is_email_verified ? 'Verified' : 'Unverified'}
                  color={user.is_email_verified ? 'success' : 'warning'}
                  size='small'
                  variant='tonal'
                />
              </div>
              <div className='flex justify-between'>
                <Typography color='text.secondary'>Google Linked</Typography>
                <Chip
                  label={user.google_linked ? 'Linked' : 'Not Linked'}
                  color={user.google_linked ? 'success' : 'default'}
                  size='small'
                  variant='tonal'
                />
              </div>
              <div className='flex justify-between'>
                <Typography color='text.secondary'>Member Since</Typography>
                <Typography>{new Date(user.date_joined).toLocaleDateString()}</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 7 }}>
        <Card>
          <CardContent>
            <Typography variant='h6' className='mbe-4'>
              Organizations
            </Typography>
            {user.org_memberships.length === 0 ? (
              <Typography color='text.secondary'>You are not a member of any organization.</Typography>
            ) : (
              <div className='flex flex-col gap-3'>
                {user.org_memberships.map(org => (
                  <Card key={org.org_id} variant='outlined'>
                    <CardContent className='flex justify-between items-center'>
                      <div>
                        <Typography variant='subtitle1'>{org.org_name}</Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {org.org_type}
                        </Typography>
                      </div>
                      <Chip label={org.role.replace(/_/g, ' ')} size='small' variant='tonal' />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default ProfileView
