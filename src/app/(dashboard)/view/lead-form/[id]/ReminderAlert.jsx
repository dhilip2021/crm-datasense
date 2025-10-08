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
  Box,
  Grid
} from '@mui/material'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'

export default function ReminderAlert() {
  const senderEmail = Cookies.get('email')
  const [open, setOpen] = useState(false)
  const [reminders, setReminders] = useState([])
  const [audio] = useState(typeof Audio !== 'undefined' ? new Audio('/sounds/reminder.mp3') : null)

  // snooze dropdown
  const [anchorEl, setAnchorEl] = useState(null)
  const snoozeOpen = Boolean(anchorEl)

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
    stopAudio()
    setOpen(false)
    handleSnoozeClose()

    // snooze timer
    setTimeout(() => {
      setOpen(true)
      if (audio) {
        audio.loop = true
        audio.play().catch(() => console.log('🔇 Autoplay blocked'))
      }
    }, minutes * 60000)
  }

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const orgId = Cookies.get('organization_id')
        const userId = Cookies.get('user_id')

        if (!orgId || !userId) return console.error('organization id or user id missing')

        const res = await fetch(`/api/cron/reminder?organization_id=${orgId}&user_id=${userId}`)
        const data = await res.json()

        if (!data?.dueReminders?.length) return

        data.dueReminders.forEach(async rem => {
          if (rem.alertType === 'Popup' || rem.alertType === 'Both') {
            setReminders(prev => [...prev, rem])
            setOpen(true)
            if (audio) {
              audio.loop = true
              audio.play().catch(() => console.log('🔇 Autoplay blocked'))
            }
          }

          if (rem.alertType === 'Email' || rem.alertType === 'Both') {
            // call your email API
            await fetch('/api/cron/sendReminderEmail', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: senderEmail,
                subject: `🔔 Reminder: ${rem.subject}`,
                html: `
      <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
        <table style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: #2563eb; color: white; padding: 16px 24px; font-size: 20px; font-weight: bold;">
              📅 CRM Datasense - Reminder Alert
            </td>
          </tr>
          <tr>
            <td style="padding: 24px; color: #111827;">
              <p style="font-size: 16px;">Hi <b>${rem['First Name']} ${rem['Last Name']}</b>,</p>
              <p style="font-size: 14px; color: #374151;">
                This is a friendly reminder about your upcoming task:
              </p>

              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">📌 Subject</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem.subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">🏢 Company</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem.Company}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">👤 Lead</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem['First Name']} ${rem['Last Name']}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">📞 Phone</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem.Phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">👨‍💼 Owner</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem.owner}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">⚡ Priority</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">${rem.priority}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">⏰ Reminder</td>
                  <td style="padding: 8px; border: 1px solid #e5e7eb;">
                    ${new Date(rem.reminderDate).toLocaleDateString()} at ${rem.reminderTime}
                  </td>
                </tr>
              </table>

              <p style="margin-top: 20px; font-size: 14px; color: #374151;">
                ✅ Please make sure to follow up on this task without delay.
              </p>
              <p style="font-size: 14px; color: #6b7280;">– CRM Datasense</p>
            </td>
          </tr>
          <tr>
            <td style="background: #f3f4f6; text-align: center; padding: 12px; font-size: 12px; color: #6b7280;">
              This is an automated reminder from CRM Datasense. Do not reply to this email.
            </td>
          </tr>
        </table>
      </div>
    `
              })
            })
          }
        })
      } catch (err) {
        console.error('Error fetching reminders', err)
      }
    }

    const interval = setInterval(fetchReminders, 60000)
    fetchReminders()

    return () => clearInterval(interval)
  }, [audio])

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <NotificationsActiveIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Reminder Alerts
      </DialogTitle>
      <DialogContent dividers>
        {reminders.map((rem, idx) => (
          <Box key={idx} mb={2}>
            <Typography variant='h6' color='primary.dark'>
              {rem.subject}
            </Typography>
            <Grid container spacing={1} mt={1}>
              <Grid item xs={4}>
                <Typography variant='body2'>
                  <span style={{ fontWeight: 600 }}>Name:</span> {rem['First Name'] || '-'} {rem['Last Name'] || '-'}
                </Typography>
              </Grid>

              <Grid item xs={4}>
                <Typography variant='body2'>
                  <span style={{ fontWeight: 600 }}>Company:</span> {rem['Company'] || '-'}{' '}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant='body2'>
                  <span style={{ fontWeight: 600 }}>Phone:</span> {rem['Phone'] || '-'}{' '}
                </Typography>
              </Grid>
            </Grid>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={1} mt={1}>
              <Grid item xs={6}>
                <Typography variant='body2'>Assigned To: {rem.owner}</Typography>
                <Typography variant='body2'>Priority: {rem.priority}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant='caption' color='error'>
                  📅 {new Date(rem.reminderDate).toLocaleDateString()} ⏰{' '}
                  {dayjs(`1970-01-01T${rem.reminderTime}`).format('hh:mm A')}
                </Typography>
              </Grid>
            </Grid>

            <DialogActions sx={{ mt: 1 }}>
              <Button
                aria-controls={snoozeOpen ? 'snooze-menu' : undefined}
                aria-haspopup='true'
                onClick={e => handleSnoozeClick(e, idx)}
                color='warning'
                variant='outlined'
              >
                Snooze
              </Button>
              <Menu id='snooze-menu' anchorEl={anchorEl} open={snoozeOpen} onClose={handleSnoozeClose}>
                {[5, 10, 15, 30].map(min => (
                  <MenuItem key={min} onClick={() => handleSnoozeSelect(min)}>
                    {min} minutes
                  </MenuItem>
                ))}
              </Menu>
              <Button onClick={() => handleDismiss(idx)} variant='contained' color='success'>
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
