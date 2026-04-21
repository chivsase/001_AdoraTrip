'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'

import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

const mockArticles = [
  { id: '1', title: 'Top 10 Places in Siem Reap', author: 'Admin User', status: 'published', date: '2025-01-15' },
  { id: '2', title: 'Cambodia Travel Guide 2025', author: 'Editor 1', status: 'draft', date: '2025-02-20' },
]

export default function AdminArticlesPage() {
  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Article Title', flex: 1, minWidth: 300 },
    { field: 'author', headerName: 'Author', width: 150 },
    { field: 'date', headerName: 'Created Date', width: 130 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string
        const color = status === 'published' ? 'success' : 'warning'
        return <Chip label={status.toUpperCase()} color={color as any} size='small' />
      }
    },
    {
      field: 'actions',
      headerName: '',
      width: 100,
      sortable: false,
      renderCell: () => (
        <Button size='small'>Edit</Button>
      )
    }
  ]

  return (
    <Box className='p-6 max-w-7xl mx-auto'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Travel Guide CMS</Typography>
          <Typography variant='body2' color='text.secondary'>Manage articles and editorial content.</Typography>
        </Box>
        <Button
          variant='contained'
          color='primary'
          startIcon={<i className='ri-add-line' />}
        >
          New Article
        </Button>
      </Box>

      <Card>
        <DataGrid
          rows={mockArticles}
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
