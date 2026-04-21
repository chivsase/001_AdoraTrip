'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

const mockBookings = [
  { id: 'ADR-2025-1049', customer: 'Alice Smith', vendor: 'Angkor Explore', type: 'Tour', date: '2025-06-15', total: 150, status: 'confirmed' },
  { id: 'ADR-2025-1050', customer: 'Bob Jones', vendor: 'Riverside Hotel', type: 'Hotel', date: '2025-06-16', total: 450, status: 'pending' },
  { id: 'ADR-2025-1051', customer: 'Charlie Davis', vendor: 'Mekong VIP', type: 'Transfer', date: '2025-06-18', total: 85, status: 'completed' },
  { id: 'ADR-2025-1052', customer: 'Diana Ross', vendor: 'Phare Circus', type: 'Attraction', date: '2025-06-20', total: 35, status: 'cancelled' },
]

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('')

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'Reference', width: 150 },
    { field: 'customer', headerName: 'Customer', flex: 1, minWidth: 150 },
    { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 150 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'date', headerName: 'Date', width: 130 },
    { 
      field: 'total', 
      headerName: 'Total', 
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' fontWeight={600}>${params.value}</Typography>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string
        const color = status === 'confirmed' ? 'success' 
                    : status === 'completed' ? 'primary'
                    : status === 'pending' ? 'warning'
                    : 'error'
        return <Chip label={status.toUpperCase()} color={color as any} size='small' />
      }
    }
  ]

  const filtered = mockBookings.filter(b => 
    b.id.toLowerCase().includes(search.toLowerCase()) || 
    b.customer.toLowerCase().includes(search.toLowerCase()) ||
    b.vendor.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box className='p-6 max-w-7xl mx-auto'>
      <Box className='mb-6'>
        <Typography variant='h4' fontWeight={700}>Platform Bookings</Typography>
        <Typography variant='body2' color='text.secondary'>Monitor and manage all system-wide bookings.</Typography>
      </Box>

      <Card>
        <Box className='p-4 border-b border-divider flex items-center justify-between bg-slate-50'>
          <TextField
            size='small'
            placeholder='Search bookings...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position='start'><i className='ri-search-line' /></InputAdornment>,
            }}
            sx={{ width: 300, bgcolor: 'white' }}
          />
        </Box>
        <DataGrid
          rows={filtered}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pageSizeOptions={[10, 25, 50]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ border: 0 }}
        />
      </Card>
    </Box>
  )
}
