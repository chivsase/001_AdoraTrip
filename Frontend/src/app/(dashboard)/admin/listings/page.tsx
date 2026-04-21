'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Alert from '@mui/material/Alert'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'

import { inventoryApi } from '@/utils/api'

const TABS = [
  { value: 'hotels', label: 'Hotels', icon: 'ri-building-2-line' },
  { value: 'tours', label: 'Tours', icon: 'ri-compass-3-line' },
  { value: 'attractions', label: 'Attractions', icon: 'ri-ticket-2-line' },
]

const STATUS_COLORS: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  active: 'success', pending_review: 'warning', draft: 'default', suspended: 'error', archived: 'default',
}

function ListingTable({ type }: { type: string }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const fetcher = type === 'hotels' ? inventoryApi.hotels : type === 'tours' ? inventoryApi.tours : inventoryApi.attractions
    fetcher()
      .then(res => setItems(Array.isArray(res) ? res : (res as any).results ?? []))
      .catch(e => setError(e?.message ?? 'Failed to load'))
      .finally(() => setLoading(false))
  }, [type])

  const filtered = items.filter(item =>
    !search || item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.destination_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box>
      <Box className='mb-6'>
        <TextField
          size='small'
          placeholder='Search Kingdom-wide listings…'
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position='start'><i className='ri-search-line text-primary' /></InputAdornment>,
          }}
          sx={{ 
            width: 320,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              backgroundColor: 'white',
              '&:hover fieldset': { borderColor: 'primary.main' },
              '&.Mui-focused fieldset': { borderWidth: '2px', boxShadow: '0 0 10px rgba(40, 125, 250, 0.2)' }
            }
          }}
        />
      </Box>

      {error && <Alert severity='error' className='mb-4'>{error}</Alert>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Listing</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Rating</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton height={24} /></TableCell>)}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  <Box className='py-12 text-center'>
                    <i className='ri-building-2-line text-5xl text-slate-200 block mb-3' />
                    <Typography color='text.secondary'>{search ? 'No listings match your search' : 'No listings found'}</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : filtered.map((item: any) => (
              <TableRow key={item.id} hover>
                <TableCell>
                  <Box className='flex items-center gap-3'>
                    <Avatar
                      src={item.cover_image ?? undefined}
                      variant='rounded'
                      sx={{ width: 40, height: 40 }}
                    >
                      <i className='ri-building-2-line' />
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight={600}>{item.name}</Typography>
                      <Typography variant='caption' color='text.secondary'>{item.org_name ?? '—'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{item.destination_name ?? item.location ?? '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' fontWeight={500}>${item.base_price}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status?.replace('_', ' ')}
                    size='small'
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '10px',
                      letterSpacing: '0.5px',
                      borderRadius: '6px',
                      height: '24px',
                      backgroundColor: `var(--mui-palette-${STATUS_COLORS[item.status] ?? 'default'}-lightOpacity)`,
                      color: `var(--mui-palette-${STATUS_COLORS[item.status] ?? 'default'}-main)`,
                      border: `1px solid var(--mui-palette-${STATUS_COLORS[item.status] ?? 'default'}-mainOpacity)`
                    }}
                  />
                </TableCell>
                <TableCell>
                  {item.rating_avg ? (
                    <Box className='flex items-center gap-1'>
                      <i className='ri-star-fill text-amber-400 text-sm' />
                      <Typography variant='body2'>{Number(item.rating_avg).toFixed(1)}</Typography>
                    </Box>
                  ) : (
                    <Typography variant='caption' color='text.secondary'>No ratings</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default function AdminListingsPage() {
  const [tab, setTab] = useState('hotels')

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>All Listings</Typography>
          <Typography variant='body2' color='text.secondary'>Review and manage all vendor listings on the platform</Typography>
        </Box>
      </Box>

      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
        overflow: 'hidden'
      }}>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 6, py: 1, background: 'rgba(255,255,255,0.4)' }}>
            <TabList 
              onChange={(_, v) => setTab(v)}
              sx={{
                '& .MuiTab-root': { fontWeight: 700, p: 4, textTransform: 'none', fontSize: '0.9rem' },
                '& .Mui-selected': { color: 'primary.main' },
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' }
              }}
            >
              {TABS.map(t => (
                <Tab key={t.value} value={t.value} label={t.label} icon={<i className={t.icon} />} iconPosition='start' />
              ))}
            </TabList>
          </Box>
          {TABS.map(t => (
            <TabPanel key={t.value} value={t.value} sx={{ p: 4 }}>
              <ListingTable type={t.value} />
            </TabPanel>
          ))}
        </TabContext>
      </Card>
    </Box>
  )
}
