'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import Alert from '@mui/material/Alert'
import InputAdornment from '@mui/material/InputAdornment'
import Skeleton from '@mui/material/Skeleton'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    base_price: '',
    address: '',
    status: 'active'
  })

  useEffect(() => {
    // Mock load listing data
    const fetchListing = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 600))
        setFormData({
          name: 'Sample Listing ' + id.substring(0, 4),
          slug: 'sample-listing',
          short_description: 'A great place to stay or visit.',
          description: 'Detailed description goes here. It is very beautiful and amazing.',
          base_price: '199',
          address: '123 Main St, Riverside',
          status: 'active'
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load listing')
      } finally {
        setLoading(false)
      }
    }
    fetchListing()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      // Mock save
      await new Promise(resolve => setTimeout(resolve, 500))
      router.push('/vendor/listings')
    } catch (err: any) {
      setError(err.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box className='p-6 max-w-4xl mx-auto'>
        <Skeleton width='40%' height={60} className='mb-6' />
        <Card><CardContent><Skeleton height={400} /></CardContent></Card>
      </Box>
    )
  }

  return (
    <Box className='p-6 max-w-4xl mx-auto'>
      <Box className='flex items-center justify-between mb-6'>
        <Box className='flex items-center gap-4'>
          <Button component={Link} href='/vendor/listings' color='inherit' sx={{ minWidth: 0, p: 1 }}>
            <i className='ri-arrow-left-line text-xl' />
          </Button>
          <Box>
            <Typography variant='h4' fontWeight={700}>Edit Listing</Typography>
            <Typography variant='body2' color='text.secondary'>Update details for {formData.name}</Typography>
          </Box>
        </Box>
        <Chip
          label={formData.status.toUpperCase()}
          color={formData.status === 'active' ? 'success' : 'default'}
        />
      </Box>

      {error && <Alert severity='error' className='mb-6'>{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card className='mb-6'>
          <CardContent sx={{ p: 4 }}>
            <Typography variant='h6' fontWeight={600} className='mb-4'>Basic Details</Typography>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label='Listing Name'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
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
                  label='URL Slug'
                  name='slug'
                  value={formData.slug}
                  onChange={handleChange}
                  disabled
                  helperText='Contact support to change URL slug'
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label='Status'
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                >
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='hidden'>Hidden</MenuItem>
                  <MenuItem value='maintenance'>Maintenance</MenuItem>
                </TextField>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  label='Short Description'
                  name='short_description'
                  value={formData.short_description}
                  onChange={handleChange}
                  required
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
          <Button color='error' variant='text' className='mr-auto'>
            Delete Listing
          </Button>
          <Button variant='outlined' component={Link} href='/vendor/listings' disabled={saving}>
            Cancel
          </Button>
          <Button variant='contained' type='submit' disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Box>
  )
}
