'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'

// Hook Imports
import { useAuth } from '@/hooks/useAuth'

// Util Imports
import { authApi, ApiError } from '@/utils/api'

const SettingsView = () => {
  const { user, refreshUser } = useAuth()

  // Profile form
  const [fullName, setFullName] = useState(user?.full_name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  if (!user) return null

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileMsg(null)
    setIsSavingProfile(true)

    try {
      await authApi.updateProfile({ full_name: fullName, phone })
      await refreshUser()
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' })
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to update profile.' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMsg(null)

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' })

      return
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 8 characters.' })

      return
    }

    setIsSavingPassword(true)

    try {
      await authApi.changePassword({ current_password: currentPassword, new_password: newPassword })
      setPasswordMsg({ type: 'success', text: 'Password changed. Please log in again.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed to change password.' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Profile Information' />
          <Divider />
          <CardContent>
            {profileMsg && (
              <Alert severity={profileMsg.type} className='mbe-4'>
                {profileMsg.text}
              </Alert>
            )}
            <form onSubmit={handleSaveProfile} className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Full Name'
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={isSavingProfile}
              />
              <TextField
                fullWidth
                label='Email'
                value={user.email}
                disabled
                helperText='Email cannot be changed.'
              />
              <TextField
                fullWidth
                label='Phone'
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={isSavingProfile}
              />
              <div>
                <Button type='submit' variant='contained' disabled={isSavingProfile}>
                  {isSavingProfile ? <CircularProgress size={24} color='inherit' /> : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardHeader title='Change Password' />
          <Divider />
          <CardContent>
            {passwordMsg && (
              <Alert severity={passwordMsg.type} className='mbe-4'>
                {passwordMsg.text}
              </Alert>
            )}
            <form onSubmit={handleChangePassword} className='flex flex-col gap-4'>
              <TextField
                fullWidth
                label='Current Password'
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={isSavingPassword}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton size='small' edge='end' onClick={() => setShowCurrentPw(s => !s)}>
                          <i className={showCurrentPw ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                fullWidth
                label='New Password'
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={isSavingPassword}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton size='small' edge='end' onClick={() => setShowNewPw(s => !s)}>
                          <i className={showNewPw ? 'ri-eye-off-line' : 'ri-eye-line'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
              <TextField
                fullWidth
                label='Confirm New Password'
                type='password'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={isSavingPassword}
              />
              <div>
                <Button type='submit' variant='contained' color='warning' disabled={isSavingPassword}>
                  {isSavingPassword ? <CircularProgress size={24} color='inherit' /> : 'Change Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default SettingsView
