'use client'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import Cookies from 'js-cookie'

export default function ReminderAlert() {
  const [open, setOpen] = useState(false)
  const [reminder, setReminder] = useState(null)
  const [audio] = useState(
    typeof Audio !== 'undefined' ? new Audio('/sounds/reminder.mp3') : null
  )

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const orgId = Cookies.get("organization_id")  // client side la js-cookie use panna ok
        const res = await fetch(`/api/cron/reminder?organization_id=${orgId}`)

        const data = await res.json()

        console.log(data,"<<< fetchReminders")

        if (data?.dueReminders?.length > 0) {
          setReminder(data.dueReminders[0])
          setOpen(true)

          if (audio) {
            audio.loop = true
            audio.play().catch(() => console.log('🔇 Autoplay blocked'))
          }
        }
      } catch (err) {
        console.error('Error fetching reminders', err)
      }
    }

    const interval = setInterval(fetchReminders, 60000) // poll every 1 min
    fetchReminders()

    return () => clearInterval(interval)
  }, [audio])

  const handleClose = () => {
    if (audio) audio.pause()
    setOpen(false)
  }

  const handleSnooze = minutes => {
    if (audio) audio.pause()
    setOpen(false)
    console.log(`⏰ Snoozed for ${minutes} min: ${reminder?.subject}`)
    setTimeout(() => setOpen(true), minutes * 60000)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='xs' fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reminder Alert
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant='h6'>{reminder?.subject}</Typography>
        <Typography variant='body2' color='text.secondary'>
          Assigned To: {reminder?.owner}
        </Typography>
        <Typography variant='body2'>Priority: {reminder?.priority}</Typography>
        <Typography variant='caption' color='error'>
          📅 {new Date(reminder?.reminderDate).toLocaleDateString()} ⏰{' '}
          {reminder?.reminderTime}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleSnooze(5)} color='warning'>
          Snooze 5m
        </Button>
        <Button onClick={handleClose} variant='contained' color='success'>
          Dismiss
        </Button>
      </DialogActions>
    </Dialog>
  )
}
