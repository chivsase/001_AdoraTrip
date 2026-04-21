'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Divider from '@mui/material/Divider'

import { inventoryApi } from '@/utils/api'

const LISTING_TYPES = [
  { value: 'hotel', label: 'Hotel & Resort', apiMethod: 'createHotel' },
  { value: 'guesthouse', label: 'Guesthouse', apiMethod: 'createHotel' },
  { value: 'beach_resort', label: 'Beach Resort', apiMethod: 'createHotel' },
  { value: 'tour', label: 'Tour & Activity', apiMethod: 'createTour' },
  { value: 'attraction', label: 'Attraction', apiMethod: 'createAttraction' },
  { value: 'restaurant', label: 'Food & Dining', apiMethod: 'createRestaurant' },
  { value: 'transfer', label: 'Local Transfer', apiMethod: 'createTransfer' }
]

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    listing_type: 'hotel',
    name: '',
    slug: '',
    short_description: '',
    description: '',
    base_price: '',
    address: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updates = { [name]: value }
      if (name === 'name' && !prev.slug) {
        updates['slug'] = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }
      return { ...prev, ...updates }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const typeConfig = LISTING_TYPES.find(t => t.value === formData.listing_type)
      const apiMethod = typeConfig?.apiMethod as keyof typeof inventoryApi
      
      if (!apiMethod || typeof inventoryApi[apiMethod] !== 'function') {
         throw new Error('Invalid listing type selection')
      }

      await (inventoryApi[apiMethod] as Function)({
        ...formData,
        base_price: parseFloat(formData.base_price)
      })

      router.push('/vendor/listings')
    } catch (err: any) {
      setError(err.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className='p-6 max-w-4xl mx-auto'>
      <Box className='flex items-center gap-4 mb-6'>
        <Button component={Link} href='/vendor/listings' color='inherit' sx={{ minWidth: 0, p: 1 }}>
          <i className='ri-arrow-left-line text-xl' />
        </Button>
        <Box>
          <Typography variant='h4' fontWeight={700}>Create New Listing</Typography>
          <Typography variant='body2' color='text.secondary'>Add a new property, tour, or service</Typography>
        </Box>
      </Box>

      {error && <Alert severity='error' className='mb-6'>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card className='mb-6'>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h6' fontWeight={600} className='mb-4'>Basic Details</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label='Listing Type'
                  name='listing_type'
                  value={formData.listing_type}
                  onChange={handleChange}
                  required
                >
                  {LISTING_TYPES.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Base Price'
                  name='base_price'
                  type='number'
                  value={formData.base_price}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position='start'>$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='Listing Name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label='URL Slug'
                  name='slug'
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  helperText='Used in the listing URL'
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Short Description'
                  name='short_description'
                  value={formData.short_description}
                  onChange={handleChange}
                  required
                  helperText='A brief summary for the search results card'
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label='Full Description'
                  name='description'
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Address / Location'
                  name='address'
                  value={formData.address}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position='start'><i className='ri-map-pin-line' /></InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box className='flex justify-end gap-3'>
          <Button variant='outlined' component={Link} href='/vendor/listings' disabled={loading}>
            Cancel
          </Button>
          <Button variant='contained' type='submit' disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
