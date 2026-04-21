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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'

import { dealsApi, organizationsApi, type ApiDealFull } from '@/utils/api'

const LISTING_TYPES = ['hotel', 'tour', 'attraction', 'restaurant', 'package', 'transfer']
const BADGE_OPTIONS = [
  { value: '', label: 'No Badge' },
  { value: 'flash', label: 'Flash Sale' },
  { value: 'hot', label: 'Hot Deal' },
  { value: 'member', label: 'Member Exclusive' },
  { value: 'bestseller', label: 'Best Seller' },
]

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
          <Box className='absolute bottom-2 right-2'>
            <Chip label={`-${deal.discount_pct}%`} color='error' size='small' />
          </Box>
        </Box>
      )}
      <CardContent>
        <Box className='flex items-start justify-between gap-2 mb-1'>
          <Typography variant='subtitle2' fontWeight={600} className='line-clamp-2 leading-tight'>
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
            <Typography variant='body1' fontWeight={700} color='error.main'>${deal.sale_price}</Typography>
          </Box>
          <Typography variant='caption' color={isExpired ? 'error.main' : 'text.secondary'}>
            {isExpired ? 'Expired' : `Exp. ${new Date(deal.expires_at).toLocaleDateString()}`}
          </Typography>
        </Box>
        <Chip
          label={isExpired ? 'Expired' : deal.is_live ? 'Live' : 'Scheduled'}
          color={isExpired ? 'error' : deal.is_live ? 'success' : 'info'}
          size='small'
        />
      </CardContent>
    </Card>
  )
}

function CreateDealDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    title: '', listing_type: 'hotel', original_price: '', sale_price: '',
    location: '', badge: '', expires_at: '', image: '', description: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const orig = parseFloat(form.original_price)
      const sale = parseFloat(form.sale_price)
      const discount_pct = orig > 0 ? Math.round(((orig - sale) / orig) * 100) : 0
      await (dealsApi as any).create?.({ ...form, discount_pct })
      onCreated()
      onClose()
    } catch (e: any) {
      setError(e?.message ?? 'Failed to create deal')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Create New Deal</DialogTitle>
      <DialogContent className='flex flex-col gap-4 pt-4'>
        {error && <Alert severity='error'>{error}</Alert>}
        <TextField label='Deal Title' value={form.title} onChange={set('title')} required fullWidth />
        <TextField select label='Listing Type' value={form.listing_type} onChange={set('listing_type')} fullWidth>
          {LISTING_TYPES.map(t => <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
        </TextField>
        <Box className='flex gap-3'>
          <TextField label='Original Price ($)' value={form.original_price} onChange={set('original_price')} type='number' fullWidth />
          <TextField label='Sale Price ($)' value={form.sale_price} onChange={set('sale_price')} type='number' fullWidth />
        </Box>
        <TextField label='Location' value={form.location} onChange={set('location')} fullWidth />
        <TextField select label='Badge' value={form.badge} onChange={set('badge')} fullWidth>
          {BADGE_OPTIONS.map(b => <MenuItem key={b.value} value={b.value}>{b.label}</MenuItem>)}
        </TextField>
        <TextField
          label='Expires At' value={form.expires_at} onChange={set('expires_at')}
          type='datetime-local' fullWidth InputLabelProps={{ shrink: true }}
        />
        <TextField label='Image URL (optional)' value={form.image} onChange={set('image')} fullWidth />
        <TextField label='Description' value={form.description} onChange={set('description')} multiline rows={2} fullWidth />
      </DialogContent>
      <DialogActions className='px-6 pb-4'>
        <Button onClick={onClose} disabled={submitting}>Cancel</Button>
        <Button variant='contained' onClick={handleSubmit} disabled={submitting || !form.title || !form.original_price || !form.sale_price}>
          {submitting ? 'Creating…' : 'Create Deal'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function VendorDealsPage() {
  const [deals, setDeals] = useState<ApiDealFull[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const load = () => {
    setLoading(true)
    dealsApi.list({ limit: 50 })
      .then(data => setDeals(Array.isArray(data) ? data : []))
      .catch(e => setError(e?.message ?? 'Failed to load deals'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>My Deals</Typography>
          <Typography variant='body2' color='text.secondary'>Create and manage promotional deals for your listings</Typography>
        </Box>
        <Button
          variant='contained'
          color='error'
          startIcon={<i className='ri-fire-line' />}
          onClick={() => setCreateOpen(true)}
        >
          Create Deal
        </Button>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      {loading ? (
        <Grid container spacing={4}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card><Skeleton variant='rectangular' height={160} /><CardContent><Skeleton height={20} /><Skeleton height={16} width='60%' /></CardContent></Card>
            </Grid>
          ))}
        </Grid>
      ) : deals.length === 0 ? (
        <Box className='flex flex-col items-center py-20 text-center'>
          <i className='ri-fire-line text-6xl text-slate-200 mb-4' />
          <Typography variant='h6' color='text.secondary' gutterBottom>No deals yet</Typography>
          <Typography variant='body2' color='text.secondary' className='mb-6 max-w-xs'>
            Create your first deal to attract more customers with special discounts.
          </Typography>
          <Button variant='contained' color='error' onClick={() => setCreateOpen(true)} startIcon={<i className='ri-add-line' />}>
            Create First Deal
          </Button>
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

      <CreateDealDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={load} />
    </Box>
  )
}
