'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { dealsApi, type ApiDealFull } from '@/utils/api'

const BADGE_COLORS: Record<string, 'default' | 'error' | 'warning' | 'secondary' | 'primary'> = {
  flash: 'error', hot: 'warning', member: 'secondary', bestseller: 'primary',
}

const TYPE_COLORS: Record<string, 'default' | 'success' | 'info' | 'warning'> = {
  hotel: 'info', tour: 'success', package: 'warning', attraction: 'info',
}

function DealCard({ deal }: { deal: ApiDealFull }) {
  const isExpired = new Date(deal.expires_at) < new Date()

  return (
    <Card className={isExpired ? 'opacity-60' : ''}>
      {deal.image && (
        <Box className='relative h-40 overflow-hidden'>
          <Image src={deal.image} alt={deal.title} fill sizes='33vw' className='object-cover' />
          <Box className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
          <Box className='absolute top-2 left-2 flex gap-1'>
            {deal.badge && (
              <Chip label={deal.badge_display} color={BADGE_COLORS[deal.badge] ?? 'default'} size='small' />
            )}
          </Box>
          <Box className='absolute bottom-2 right-2'>
            <Chip label={`-${deal.discount_pct}%`} color='error' size='small' />
          </Box>
        </Box>
      )}
      <CardContent>
        <Box className='flex items-start justify-between gap-2 mb-2'>
          <Typography variant='subtitle2' fontWeight={600} className='leading-tight line-clamp-2'>
            {deal.title}
          </Typography>
          <Chip label={deal.listing_type} color={TYPE_COLORS[deal.listing_type] ?? 'default'} size='small' variant='outlined' />
        </Box>
        <Typography variant='caption' color='text.secondary' className='line-clamp-1 block mb-2'>
          📍 {deal.location}
        </Typography>
        <Box className='flex items-center justify-between mb-2'>
          <Box>
            <Typography variant='caption' color='text.secondary' sx={{ textDecoration: 'line-through' }}>
              ${deal.original_price}
            </Typography>
            <Typography variant='body1' fontWeight={700} color='error.main'>
              ${deal.sale_price}
            </Typography>
          </Box>
          <Box className='text-right'>
            <Typography variant='caption' color='text.secondary'>Expires</Typography>
            <Typography variant='caption' display='block' color={isExpired ? 'error.main' : 'text.primary'}>
              {new Date(deal.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>
        <Box className='flex items-center gap-1'>
          <Chip
            label={isExpired ? 'Expired' : deal.is_live ? 'Live' : 'Scheduled'}
            color={isExpired ? 'error' : deal.is_live ? 'success' : 'info'}
            size='small'
          />
          {!deal.is_active && <Chip label='Inactive' size='small' color='default' />}
        </Box>
      </CardContent>
    </Card>
  )
}

function DealGridSkeleton() {
  return (
    <Grid container spacing={4}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card>
            <Skeleton variant='rectangular' height={160} />
            <CardContent>
              <Skeleton height={20} className='mb-1' />
              <Skeleton height={16} width='60%' className='mb-2' />
              <Skeleton height={24} width='40%' />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<ApiDealFull[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('active')

  const load = (active?: boolean) => {
    setLoading(true)
    dealsApi.list(active !== undefined ? { active, limit: 20 } : { limit: 20 })
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(e => setError(e?.message ?? 'Failed to load deals'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab === 'active' ? true : tab === 'expired' ? false : undefined) }, [tab])

  const liveDealCount = deals.filter(d => d.is_live).length

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Deals Management</Typography>
          <Typography variant='body2' color='text.secondary'>
            {liveDealCount} deal{liveDealCount !== 1 ? 's' : ''} currently live on the homepage
          </Typography>
        </Box>
        <Button variant='outlined' startIcon={<i className='ri-refresh-line' />} onClick={() => load(tab === 'active' ? true : undefined)}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              <Tab label='Active' value='active' />
              <Tab label='All' value='all' />
            </TabList>
          </Box>
          <TabPanel value={tab} sx={{ p: 4 }}>
            {loading ? (
              <DealGridSkeleton />
            ) : deals.length === 0 ? (
              <Box className='flex flex-col items-center py-20 text-center'>
                <i className='ri-fire-line text-6xl text-slate-200 mb-4' />
                <Typography variant='h6' color='text.secondary' gutterBottom>No deals found</Typography>
                <Typography variant='body2' color='text.secondary' className='mb-6 max-w-xs'>
                  Run the seed command to create sample deals:
                  <code className='block mt-2 bg-slate-100 rounded p-2 text-xs'>
                    python manage.py seed_deals
                  </code>
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {deals.map(deal => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={deal.id}>
                    <DealCard deal={deal} />
                  </Grid>
                ))}
              </Grid>
            )}
          </TabPanel>
        </TabContext>
      </Card>
    </Box>
  )
}
