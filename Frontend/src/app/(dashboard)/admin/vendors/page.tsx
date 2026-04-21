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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'

import { adminApi, type OrgData } from '@/utils/api'

const STATUS_CHIP: Record<string, { color: 'default' | 'warning' | 'success' | 'error' | 'info'; label: string }> = {
  PENDING:   { color: 'warning', label: 'Pending Review' },
  ACTIVE:    { color: 'success', label: 'Active' },
  SUSPENDED: { color: 'error',   label: 'Suspended' },
  REJECTED:  { color: 'error',   label: 'Rejected' },
}

const ORG_TYPE_LABELS: Record<string, string> = {
  HOTEL: 'Hotel', HOMESTAY: 'Homestay', TOUR_OPERATOR: 'Tour Operator',
  TRANSPORT: 'Transport', ATTRACTION: 'Attraction', RESTAURANT: 'Restaurant', TRAVEL_AGENCY: 'Agency',
}

function RejectDialog({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Reject Vendor</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label='Rejection Reason'
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder='Please explain why this vendor application is rejected...'
          className='mt-2'
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color='error' variant='contained' disabled={!reason.trim()} onClick={() => { onConfirm(reason); setReason('') }}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<OrgData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('PENDING')
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const load = (status?: string) => {
    setLoading(true)
    adminApi.organizations(status ? { status } : undefined)
      .then(setVendors)
      .catch(e => setError(e?.message ?? 'Failed to load vendors'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(tab === 'ALL' ? undefined : tab) }, [tab])

  const handleApprove = async (id: string) => {
    setActionLoading(id)
    try {
      await adminApi.approveOrg(id)
      setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'ACTIVE' } : v))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to approve')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSuspend = async (id: string) => {
    if (!confirm('Suspend this vendor?')) return
    setActionLoading(id)
    try {
      await adminApi.suspendOrg(id)
      setVendors(prev => prev.map(v => v.id === id ? { ...v, status: 'SUSPENDED' } : v))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to suspend')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return
    setActionLoading(rejectTarget)
    setRejectTarget(null)
    try {
      await adminApi.rejectOrg(rejectTarget, reason)
      setVendors(prev => prev.map(v => v.id === rejectTarget ? { ...v, status: 'REJECTED' } : v))
    } catch (e: any) {
      alert(e?.message ?? 'Failed to reject')
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = tab === 'ALL' ? vendors : vendors.filter(v => v.status === tab)

  return (
    <Box className='p-6'>
      <Box className='flex items-center justify-between mb-6'>
        <Box>
          <Typography variant='h4' fontWeight={700}>Vendor Management</Typography>
          <Typography variant='body2' color='text.secondary'>Approve, suspend, and manage vendor organizations</Typography>
        </Box>
        <Button variant='outlined' startIcon={<i className='ri-refresh-line' />} onClick={() => load(tab === 'ALL' ? undefined : tab)}>
          Refresh
        </Button>
      </Box>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <TabContext value={tab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 4 }}>
            <TabList onChange={(_, v) => setTab(v)}>
              <Tab label='Pending' value='PENDING' />
              <Tab label='Active' value='ACTIVE' />
              <Tab label='Suspended' value='SUSPENDED' />
              <Tab label='Rejected' value='REJECTED' />
              <Tab label='All' value='ALL' />
            </TabList>
          </Box>
          <TabPanel value={tab} sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => <TableCell key={j}><Skeleton height={24} /></TableCell>)}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align='center'>
                        <Box className='py-12 text-center'>
                          <i className='ri-store-2-line text-5xl text-slate-200 block mb-3' />
                          <Typography color='text.secondary'>No vendors in this category</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : filtered.map(vendor => {
                    const chip = STATUS_CHIP[vendor.status] ?? { color: 'default' as const, label: vendor.status }
                    const isActing = actionLoading === vendor.id
                    return (
                      <TableRow key={vendor.id} hover>
                        <TableCell>
                          <Typography variant='body2' fontWeight={600}>{vendor.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>{vendor.slug}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={ORG_TYPE_LABELS[vendor.org_type] ?? vendor.org_type} size='small' variant='outlined' />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2'>{vendor.business_email}</Typography>
                        </TableCell>
                        <TableCell>{vendor.city || '—'}</TableCell>
                        <TableCell>
                          <Chip label={chip.label} color={chip.color} size='small' />
                        </TableCell>
                        <TableCell>
                          {new Date(vendor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Box className='flex gap-1'>
                            {vendor.status === 'PENDING' && (
                              <>
                                <Button size='small' color='success' variant='contained' disabled={isActing} onClick={() => handleApprove(vendor.id)}>
                                  Approve
                                </Button>
                                <Button size='small' color='error' variant='outlined' disabled={isActing} onClick={() => setRejectTarget(vendor.id)}>
                                  Reject
                                </Button>
                              </>
                            )}
                            {vendor.status === 'ACTIVE' && (
                              <Button size='small' color='warning' variant='outlined' disabled={isActing} onClick={() => handleSuspend(vendor.id)}>
                                Suspend
                              </Button>
                            )}
                            {vendor.status === 'SUSPENDED' && (
                              <Button size='small' color='success' variant='outlined' disabled={isActing} onClick={() => handleApprove(vendor.id)}>
                                Reactivate
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </TabContext>
      </Card>

      <RejectDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
    </Box>
  )
}
