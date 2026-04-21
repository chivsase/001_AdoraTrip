'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Stepper from '@mui/material/Stepper'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

import { organizationsApi } from '@/utils/api'

const ORG_TYPES = [
  { value: 'HOTEL', label: 'Hotel / Accommodation' },
  { value: 'TOUR_OPERATOR', label: 'Tour Operator' },
  { value: 'ATTRACTION', label: 'Attraction / Activity' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'TRANSPORT', label: 'Transport Provider' },
]

const STEPS = ['Business Info', 'Contact Details', 'Review & Submit']

export default function VendorOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    org_type: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: 'Cambodia',
    registration_number: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const canProceed = () => {
    if (step === 0) return form.name && form.org_type
    if (step === 1) return form.phone && form.email && form.city
    return true
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await organizationsApi.create(form)
      router.push('/vendor/dashboard?registered=1')
    } catch (e: any) {
      setError(e?.message ?? 'Registration failed. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <Box className='p-6 max-w-2xl mx-auto'>
      <Box className='mb-8 text-center'>
        <Typography variant='h4' fontWeight={700} gutterBottom>Register as a Vendor</Typography>
        <Typography variant='body2' color='text.secondary'>
          Join AdoraTrip and start reaching thousands of travellers across Cambodia
        </Typography>
      </Box>

      <Stepper activeStep={step} className='mb-8'>
        {STEPS.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity='error' className='mb-4' onClose={() => setError(null)}>{error}</Alert>}

      <Card>
        <CardContent className='p-6'>
          {step === 0 && (
            <Box className='flex flex-col gap-4'>
              <Typography variant='h6' fontWeight={600} gutterBottom>Business Information</Typography>
              <TextField label='Business Name' value={form.name} onChange={set('name')} required fullWidth />
              <TextField
                select label='Business Type' value={form.org_type} onChange={set('org_type')} required fullWidth
              >
                {ORG_TYPES.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
              </TextField>
              <TextField
                label='Description' value={form.description} onChange={set('description')}
                multiline rows={3} fullWidth
                helperText='Describe your business, services, and what makes you unique'
              />
              <TextField label='Website (optional)' value={form.website} onChange={set('website')} fullWidth />
              <TextField label='Business Registration Number' value={form.registration_number} onChange={set('registration_number')} fullWidth />
            </Box>
          )}

          {step === 1 && (
            <Box className='flex flex-col gap-4'>
              <Typography variant='h6' fontWeight={600} gutterBottom>Contact Details</Typography>
              <TextField label='Contact Email' value={form.email} onChange={set('email')} required fullWidth type='email' />
              <TextField label='Phone Number' value={form.phone} onChange={set('phone')} required fullWidth />
              <TextField label='Address' value={form.address} onChange={set('address')} fullWidth />
              <TextField label='City' value={form.city} onChange={set('city')} required fullWidth />
              <TextField label='Country' value={form.country} onChange={set('country')} fullWidth />
            </Box>
          )}

          {step === 2 && (
            <Box className='flex flex-col gap-3'>
              <Typography variant='h6' fontWeight={600} gutterBottom>Review Your Application</Typography>
              {[
                { label: 'Business Name', value: form.name },
                { label: 'Type', value: ORG_TYPES.find(o => o.value === form.org_type)?.label },
                { label: 'Email', value: form.email },
                { label: 'Phone', value: form.phone },
                { label: 'City', value: form.city },
                { label: 'Country', value: form.country },
              ].map(row => (
                <Box key={row.label} className='flex justify-between py-2 border-b last:border-b-0'>
                  <Typography variant='body2' color='text.secondary'>{row.label}</Typography>
                  <Typography variant='body2' fontWeight={500}>{row.value || '—'}</Typography>
                </Box>
              ))}
              <Alert severity='info' className='mt-3'>
                Your application will be reviewed by our team within 1-2 business days.
                You will receive an email once approved.
              </Alert>
            </Box>
          )}

          <Box className='flex justify-between mt-6'>
            <Button
              variant='outlined'
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
            >
              Back
            </Button>
            {step < 2 ? (
              <Button
                variant='contained'
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                endIcon={<i className='ri-arrow-right-line' />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant='contained'
                color='success'
                disabled={submitting}
                onClick={handleSubmit}
                startIcon={submitting ? <CircularProgress size={16} color='inherit' /> : <i className='ri-send-plane-line' />}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
