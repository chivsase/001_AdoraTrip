'use client'

import { useEffect, useState } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'

import { adminApi } from '@/utils/api'
import type { User } from '@/types/authTypes'

const ROLE_COLORS: Record<string, 'default' | 'error' | 'warning' | 'success' | 'info' | 'primary' | 'secondary'> = {
  SUPER_ADMIN: 'error', PLATFORM_STAFF: 'warning',
  PARTNER_OWNER: 'primary', PARTNER_MANAGER: 'primary',
  PARTNER_STAFF: 'info', PARTNER_FINANCE: 'success',
  LOCAL_GUIDE: 'secondary', TRANSPORT_PROVIDER: 'secondary',
  TRAVELER: 'info',
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin', PLATFORM_STAFF: 'Platform Staff',
  PARTNER_OWNER: 'Vendor Owner', PARTNER_MANAGER: 'Vendor Manager',
  PARTNER_STAFF: 'Vendor Staff', PARTNER_FINANCE: 'Finance',
  LOCAL_GUIDE: 'Local Guide', TRANSPORT_PROVIDER: 'Transport',
  TRAVELER: 'Traveler',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    adminApi.users(debouncedSearch ? { search: debouncedSearch } : undefined)
      .then(setUsers)
      .catch(e => setError(e?.message ?? 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Users</Typography>
          <Typography variant='body2' color='text.secondary'>
            {users.length} registered user{users.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <TextField
          size='small'
          placeholder='Search by name or email…'
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position='start'><i className='ri-search-line text-slate-400' /></InputAdornment>,
          }}
          sx={{ width: 280 }}
        />
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Verified</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((__, j) => <TableCell key={j}><Skeleton height={24} /></TableCell>)}</TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    <Box className='py-12 text-center'>
                      <i className='ri-team-line text-5xl text-slate-200 block mb-3' />
                      <Typography color='text.secondary'>No users found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.map((u: any) => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Box className='flex items-center gap-3'>
                      <Avatar src={u.avatar ?? undefined} sx={{ width: 36, height: 36 }}>
                        {u.full_name?.[0]?.toUpperCase() ?? '?'}
                      </Avatar>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>{u.full_name || 'Unknown'}</Typography>
                        <Typography variant='caption' color='text.secondary'>{u.email}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ROLE_LABELS[u.platform_role] ?? u.platform_role}
                      color={ROLE_COLORS[u.platform_role] ?? 'default'}
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    {u.is_email_verified ? (
                      <Chip label='Verified' color='success' size='small' icon={<i className='ri-shield-check-line' />} />
                    ) : (
                      <Chip label='Unverified' color='warning' size='small' />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {new Date(u.date_joined).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? 'success' : 'error'} size='small' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
