'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { inventoryApi } from '@/utils/api'

const LISTING_TABS = [
  { value: 'hotels', label: 'Hotels', icon: 'ri-building-2-line' },
  { value: 'tours', label: 'Tours', icon: 'ri-compass-3-line' },
  { value: 'attractions', label: 'Attractions', icon: 'ri-ticket-2-line' },
]

function ListingCard({ item }: { item: any }) {
  return (
    <Card>
      {item.cover_image && (
        <CardMedia component='img' height='160' image={item.cover_image} alt={item.name} sx={{ objectFit: 'cover' }} />
      )}
      <CardContent>
        <Box className='flex items-start justify-between gap-2 mb-2'>
          <Typography variant='subtitle1' fontWeight={600} className='leading-tight'>
            {item.name}
          </Typography>
          <Chip
            label={item.status}
            size='small'
            color={item.status === 'active' ? 'success' : item.status === 'pending_review' ? 'warning' : 'default'}
          />
        </Box>
        <Typography variant='body2' color='text.secondary' className='line-clamp-2 mb-3'>
          {item.short_description || item.description}
        </Typography>
        <Box className='flex items-center justify-between'>
          <Typography variant='body2' fontWeight={600} color='primary.main'>
            From ${item.base_price}
          </Typography>
          <Box className='flex gap-1'>
            <Button size='small' variant='outlined' component={Link} href={`/vendor/listings/${item.id}/edit`}>
              Edit
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

function ListingGridSkeleton() {
  return (
    <Grid container spacing={4}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
          <Card>
            <Skeleton variant='rectangular' height={160} />
            <CardContent>
              <Skeleton height={24} className='mb-2' />
              <Skeleton height={16} />
              <Skeleton height={16} width='60%' className='mb-3' />
              <Box className='flex justify-between'>
                <Skeleton width={60} height={24} />
                <Skeleton width={80} height={36} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

function ListingGrid({ type }: { type: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const fetcher = type === 'hotels' ? inventoryApi.hotels
      : type === 'tours' ? inventoryApi.tours
      : inventoryApi.attractions
    fetcher()
      .then(res => setItems(Array.isArray(res) ? res : (res as any).results ?? []))
      .catch(e => setError(e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [type])

  if (loading) return <ListingGridSkeleton />
  if (error) return <Alert severity='error'>{error}</Alert>

  if (items.length === 0) {
    return (
      <Box className='flex flex-col items-center py-20 text-center'>
        <i className='ri-building-2-line text-6xl text-slate-200 mb-4' />
        <Typography variant='h6' color='text.secondary' gutterBottom>No listings yet</Typography>
        <Typography variant='body2' color='text.secondary' className='mb-6 max-w-xs'>
          Add your first listing to start receiving bookings.
        </Typography>
        <Button variant='contained' component={Link} href='/vendor/listings/new' startIcon={<i className='ri-add-line' />}>
          Add Listing
        </Button>
      </Box>
    )
  }

  return (
    <Grid container spacing={4}>
      {items.map((item: any) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
          <ListingCard item={item} />
        </Grid>
      ))}
    </Grid>
  )
}

export default function VendorListingsPage() {
  const [tab, setTab] = useState('hotels')

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>My Listings</Typography>
          <Typography variant='body2' color='text.secondary'>Manage your properties and services</Typography>
        </Box>
        <Button component={Link} href='/vendor/listings/new' variant='contained' startIcon={<i className='ri-add-line' />}>
          Add Listing
        </Button>
      </Box>

      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              {LISTING_TABS.map(t => (
                <Tab key={t.value} value={t.value} label={t.label} icon={<i className={t.icon} />} iconPosition='start' />
              ))}
            </TabList>
          </Box>
          {LISTING_TABS.map(t => (
            <TabPanel key={t.value} value={t.value} sx={{ p: 4 }}>
              <ListingGrid type={t.value} />
            </TabPanel>
          ))}
        </TabContext>
      </Card>
    </Box>
  )
}
