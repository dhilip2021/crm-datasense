'use client'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Box
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import Cookies from 'js-cookie'

export default function ReminderAlert() {
  const [open, setOpen] = useState(false)
  const [reminders, setReminders] = useState([])
  const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('/sounds/reminder.mp3') : null)

  // snooze dropdown
  const [anchorEl, setAnchorEl] = useState(null)
  const snoozeOpen = Boolean(anchorEl)

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const orgId = Cookies.get('organization_id')
        const userId = Cookies.get('user_id')

        if (orgId && userId) {
          const res = await fetch(`/api/cron/reminder?organization_id=${orgId}&user_id=${userId}`)
          const data = await res.json()
          console.log(data, '<<< fetchReminders')
          if (data?.dueReminders?.length > 0) {
            setReminders(data.dueReminders)
            setOpen(true)
            if (audio) {
              audio.loop = true
              audio.play().catch(() => console.log('🔇 Autoplay blocked'))
            }
          }
        } else {
          console.error('organization id or user id missing')
        }
      } catch (err) {
        console.error('Error fetching reminders', err)
      }
    }

    const interval = setInterval(fetchReminders, 60000)
    fetchReminders()

    return () => clearInterval(interval)
  }, [audio])

  const stopAudio = () => {
    if (audio) audio.pause()
  }

  // dismiss only one reminder
  const handleDismiss = idx => {
    stopAudio()
    const updated = reminders.filter((_, i) => i !== idx)
    setReminders(updated)
    if (updated.length === 0) {
      setOpen(false)
    }
  }

  const handleSnooze = minutes => {
    stopAudio()
    setOpen(false)
    console.log(`⏰ Snoozed for ${minutes} min`)
    setTimeout(() => setOpen(true), minutes * 60000)
  }

  // snooze dropdown
  const handleSnoozeClick = event => {
    setAnchorEl(event.currentTarget)
  }
  const handleSnoozeClose = () => {
    setAnchorEl(null)
  }
  const handleSnoozeSelect = minutes => {
    handleSnooze(minutes)
    handleSnoozeClose()
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reminder Alerts
      </DialogTitle>
      <DialogContent dividers>
        {reminders.map((rem, idx) => (
          <Box key={idx} mb={2}>
            <Typography variant='h6'>{rem.subject}</Typography>
            <Typography variant='body2' color='text.secondary'>
              Assigned To: {rem.owner}
            </Typography>
            <Typography variant='body2'>Priority: {rem.priority}</Typography>
            <Typography variant='caption' color='error'>
              📅 {new Date(rem.reminderDate).toLocaleDateString()} ⏰ {rem.reminderTime}
            </Typography>

            <DialogActions sx={{ mt: 1 }}>
              {/* Snooze Dropdown */}
              <Button
                aria-controls={snoozeOpen ? 'snooze-menu' : undefined}
                aria-haspopup='true'
                onClick={handleSnoozeClick}
                color='warning'
                variant='outlined'
              >
                Snooze
              </Button>
              <Menu
                id='snooze-menu'
                anchorEl={anchorEl}
                open={snoozeOpen}
                onClose={handleSnoozeClose}
              >
                <MenuItem onClick={() => handleSnoozeSelect(5)}>5 minutes</MenuItem>
                <MenuItem onClick={() => handleSnoozeSelect(10)}>10 minutes</MenuItem>
                <MenuItem onClick={() => handleSnoozeSelect(15)}>15 minutes</MenuItem>
              </Menu>

              {/* Dismiss only this reminder */}
              <Button
                onClick={() => handleDismiss(idx)}
                variant='contained'
                color='success'
              >
                Dismiss
              </Button>
            </DialogActions>

            {idx < reminders.length - 1 && <Divider sx={{ my: 2 }} />}
          </Box>
        ))}
      </DialogContent>
    </Dialog>
  )
}
