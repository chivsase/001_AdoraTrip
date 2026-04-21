'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

const mockPayouts = [
  { id: '1', vendor: 'Angkor Explore', amount: 1250.00, commission: 15.0, status: 'pending', scheduled: '2025-06-25' },
  { id: '2', vendor: 'Riverside Hotel', amount: 4300.50, commission: 12.5, status: 'processing', scheduled: '2025-06-18' },
  { id: '3', vendor: 'Mekong VIP Transfer', amount: 840.00, commission: 10.0, status: 'paid', scheduled: '2025-06-11' },
]

export default function AdminPayoutsPage() {
  const [processing, setProcessing] = useState(false)

  const handleBatchRun = async () => {
    setProcessing(true)
    // mock api call
    await new Promise(res => setTimeout(res, 1500))
    setProcessing(false)
  }

  const columns: GridColDef[] = [
    { field: 'vendor', headerName: 'Vendor', flex: 1, minWidth: 200 },
    { 
      field: 'amount', 
      headerName: 'Net Payout', 
      width: 140,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant='body2' fontWeight={600}>${params.value}</Typography>
      )
    },
    { 
      field: 'commission', 
      headerName: 'Com Rate Setting', 
      width: 150,
      renderCell: (params: GridRenderCellParams) => `${params.value}%`
    },
    { field: 'scheduled', headerName: 'Scheduled Date', width: 140 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string
        const color = status === 'paid' ? 'success' 
                    : status === 'processing' ? 'primary'
                    : 'warning'
        return <Chip label={status.toUpperCase()} color={color as any} size='small' />
      }
    }
  ]

  return (
    <Box className='p-6 max-w-7xl mx-auto'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Vendor Payouts</Typography>
          <Typography variant='body2' color='text.secondary'>Manage settlements and transfer funds using ABA PayWay API.</Typography>
        </Box>
        <Button 
          variant='contained' 
          color='primary' 
          startIcon={<i className='ri-bank-card-line' />}
          onClick={handleBatchRun}
          disabled={processing}
        >
          {processing ? 'Processing...' : 'Run ABA PayWay Batch'}
        </Button>
      </Box>

      <Card>
        <DataGrid
          rows={mockPayouts}
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
