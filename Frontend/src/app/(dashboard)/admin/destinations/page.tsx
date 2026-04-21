'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Grid from '@mui/material/Grid'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import { cmsApi } from '@/utils/api'

interface Destination {
  id: string
  name: string
  slug: string
  image?: string
  tag?: string
  rating_avg?: number
  review_count?: number
  listing_count?: number
  price_from?: number
  is_trending?: boolean
  sort_order?: number
}

function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Card>
      {dest.image && (
        <CardMedia component='img' height='140' image={dest.image} alt={dest.name} sx={{ objectFit: 'cover' }} />
      )}
      <CardContent>
        <Box className='flex items-start justify-between gap-2 mb-2'>
          <Typography variant='subtitle1' fontWeight={600}>{dest.name}</Typography>
          <Box className='flex flex-col items-end gap-1'>
            {dest.is_trending && <Chip label='Trending' color='warning' size='small' />}
            {dest.tag && <Chip label={dest.tag} size='small' variant='outlined' />}
          </Box>
        </Box>
        <Box className='flex flex-wrap gap-3 mt-2'>
          {dest.rating_avg !== undefined && (
            <Box className='flex items-center gap-1'>
              <i className='ri-star-fill text-amber-400 text-sm' />
              <Typography variant='caption'>{Number(dest.rating_avg).toFixed(1)}</Typography>
            </Box>
          )}
          {dest.listing_count !== undefined && (
            <Typography variant='caption' color='text.secondary'>
              {dest.listing_count} listing{dest.listing_count !== 1 ? 's' : ''}
            </Typography>
          )}
          {dest.price_from !== undefined && (
            <Typography variant='caption' color='primary.main' fontWeight={600}>
              From ${dest.price_from}
            </Typography>
          )}
        </Box>
        <Typography variant='caption' color='text.secondary' className='mt-1 block'>
          Slug: {dest.slug} · Sort: {dest.sort_order ?? 0}
        </Typography>
      </CardContent>
    </Card>
  )
}

function DestinationCardSkeleton() {
  return (
    <Card>
      <Skeleton variant='rectangular' height={140} />
      <CardContent>
        <Skeleton height={24} className='mb-2' />
        <Skeleton height={16} width='60%' />
        <Skeleton height={16} width='40%' className='mt-1' />
      </CardContent>
    </Card>
  )
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = () => {
    setLoading(true)
    cmsApi.destinations()
      .then(data => setDestinations(Array.isArray(data) ? (data as Destination[]) : []))
      .catch(e => setError(e?.message ?? 'Failed to load destinations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = destinations.filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.slug.includes(search.toLowerCase())
  )

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Destinations</Typography>
          <Typography variant='body2' color='text.secondary'>
            {destinations.length} destination{destinations.length !== 1 ? 's' : ''} on the platform
          </Typography>
        </Box>
        <Box className='flex gap-3'>
          <TextField
            size='small'
            placeholder='Search destinations…'
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position='start'><i className='ri-search-line text-slate-400' /></InputAdornment>,
            }}
            sx={{ width: 220 }}
          />
          <Button variant='outlined' startIcon={<i className='ri-refresh-line' />} onClick={load}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={4}>
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <DestinationCardSkeleton />
            </Grid>
          ))
        ) : filtered.length === 0 ? (
          <Grid size={12}>
            <Box className='flex flex-col items-center py-20 text-center'>
              <i className='ri-map-pin-line text-6xl text-slate-200 mb-4' />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                {search ? 'No destinations match your search' : 'No destinations found'}
              </Typography>
              {!search && (
                <Typography variant='body2' color='text.secondary' className='max-w-xs'>
                  Run the seed command to add Cambodian destinations:
                  <code className='block mt-2 bg-slate-100 rounded p-2 text-xs'>
                    python manage.py seed_deals
                  </code>
                </Typography>
              )}
            </Box>
          </Grid>
        ) : filtered.map(dest => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={dest.id}>
            <DestinationCard dest={dest} />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
