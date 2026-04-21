'use client'

import { useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'

export default function AdminCommissionsPage() {
  const [globalRates, setGlobalRates] = useState({
    hotel: 15.0,
    tour: 20.0,
    transfer: 10.0,
    attraction: 12.0
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
  }

  return (
    <Box className='p-6 max-w-5xl mx-auto'>
      <Box className='mb-6'>
        <Typography variant='h4' fontWeight={700}>Commission Rates</Typography>
        <Typography variant='body2' color='text.secondary'>Set global defaults or override rates for specific vendors.</Typography>
      </Box>

      <Card className='mb-8'>
        <CardContent sx={{ p: 4 }}>
          <Typography variant='h6' fontWeight={600} className='mb-2'>Global Default Rates</Typography>
          <Typography variant='body2' color='text.secondary' className='mb-6'>
            These rates apply to all vendors unless an override is set.
          </Typography>

          <Box className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            <TextField
              label='Hotel & Accommodation'
              type='number'
              value={globalRates.hotel}
              onChange={(e) => setGlobalRates(p => ({ ...p, hotel: Number(e.target.value) }))}
              InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
            />
            <TextField
              label='Tours & Experiences'
              type='number'
              value={globalRates.tour}
              onChange={(e) => setGlobalRates(p => ({ ...p, tour: Number(e.target.value) }))}
              InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
            />
            <TextField
              label='Transport & Transfers'
              type='number'
              value={globalRates.transfer}
              onChange={(e) => setGlobalRates(p => ({ ...p, transfer: Number(e.target.value) }))}
              InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
            />
            <TextField
              label='Attractions & Tickets'
              type='number'
              value={globalRates.attraction}
              onChange={(e) => setGlobalRates(p => ({ ...p, attraction: Number(e.target.value) }))}
              InputProps={{ endAdornment: <InputAdornment position='end'>%</InputAdornment> }}
            />
          </Box>

          <Button variant='contained' onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Global Rates'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant='h6' fontWeight={600} className='mb-2'>Vendor Specific Overrides</Typography>
          <Typography variant='body2' color='text.secondary' className='mb-4'>
            Coming Soon: Search for a vendor to set custom commission agreements.
          </Typography>
          <Box className='p-8 border-2 border-dashed rounded flex justify-center text-slate-400'>
             Feature under construction
          </Box>
        </CardContent>
      </Card>

    </Box>
  )
}
