'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'

export default function AdminAnalyticsPage() {
  return (
    <Box className='p-6 max-w-7xl mx-auto'>
      <Box className='mb-6'>
        <Typography variant='h4' fontWeight={700}>Analytics Overview</Typography>
        <Typography variant='body2' color='text.secondary'>Monitor platform revenue and growth.</Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='subtitle2' color='text.secondary'>Gross Merchandise Value</Typography>
              <Typography variant='h4' fontWeight={700} className='my-2'>$124,500</Typography>
              <Typography variant='body2' color='success.main'>+15% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='subtitle2' color='text.secondary'>Platform Revenue</Typography>
              <Typography variant='h4' fontWeight={700} className='my-2'>$18,675</Typography>
              <Typography variant='body2' color='success.main'>+12% from last month</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className='h-full'>
            <CardContent>
              <Typography variant='subtitle2' color='text.secondary'>Total Bookings</Typography>
              <Typography variant='h4' fontWeight={700} className='my-2'>845</Typography>
              <Typography variant='body2' color='text.secondary'>This month</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography color='text.secondary'>Chart Placeholder (Install Recharts)</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
