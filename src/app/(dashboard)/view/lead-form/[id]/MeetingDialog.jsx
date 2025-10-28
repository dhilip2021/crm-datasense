'use client'

import React, { useEffect } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import CloseIcon from '@mui/icons-material/Close'
import dayjs from 'dayjs'

// ========================================================
// Meeting Dialog Component
// ========================================================
function MeetingDialog({
  handleMeetingChange,
  openMeetingDialog,
  handleMeetingClose,
  editingMeeting,
  setErrorMeetingData,
  errorMeetingData,
  loaderMeeting,
  meetingData,
  user_name,
  setReminderFromTimeMeetingError,
  setReminderToTimeMeetingError,
  reminderFromTimeMeetingError,
  reminderToTimeMeetingError,
  saveMeeting
}) {
  // ✅ Auto-set default dates & times when creating a meeting
//   useEffect(() => {
//     if (openMeetingDialog && !editingMeeting) {
//       const now = dayjs()
//       const fromDate = now.format('YYYY-MM-DD')
//       const fromTime = now.add(1, 'hour').format('HH:mm')
//       const toDate = now.format('YYYY-MM-DD')
//       const toTime = now.add(2, 'hour').format('HH:mm')

//       handleMeetingChange('fromDate', fromDate)
//       handleMeetingChange('fromTime', fromTime)
//       handleMeetingChange('toDate', toDate)
//       handleMeetingChange('toTime', toTime)
//     }
//   }, [openMeetingDialog, editingMeeting])

useEffect(() => {
  if (openMeetingDialog && !editingMeeting) {
    const now = dayjs()

    // Round up to the next full hour
    const roundedStart = now.minute() === 0 ? now : now.add(2, 'hour').startOf('hour')
    const roundedEnd = roundedStart.add(1, 'hour')

    const fromDate = roundedStart.format('YYYY-MM-DD')
    const fromTime = roundedStart.format('HH:mm')
    const toDate = roundedEnd.format('YYYY-MM-DD')
    const toTime = roundedEnd.format('HH:mm')

    handleMeetingChange('fromDate', fromDate)
    handleMeetingChange('fromTime', fromTime)
    handleMeetingChange('toDate', toDate)
    handleMeetingChange('toTime', toTime)
  }
}, [openMeetingDialog, editingMeeting])

  // ✅ Time Validation
  const validateReminderTime = () => {
    const now = dayjs()
    const from =
      meetingData.fromDate && meetingData.fromTime ? dayjs(`${meetingData.fromDate} ${meetingData.fromTime}`) : null
    const to = meetingData.toDate && meetingData.toTime ? dayjs(`${meetingData.toDate} ${meetingData.toTime}`) : null
    return (from && from.isBefore(now)) || (to && to.isBefore(now))
  }

  const handleCreateGoogleMeetLink = () => {
    console.log('Generate Google Meet link clicked')
  }

  return (
    <Dialog
      open={openMeetingDialog}
      onClose={handleMeetingClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      {/* 🔹 Title Bar */}
      <DialogTitle
        sx={{
          fontWeight: 'bold',
          fontSize: '1.3rem',
          textAlign: 'center',
          borderBottom: '1px solid #f0f0f0',
          pb: 1
        }}
      >
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          ✨ {editingMeeting ? 'Update Meeting' : 'Create Meeting'}
          <Tooltip title='Close' arrow>
            <IconButton onClick={handleMeetingClose}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* 🔹 Content */}
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Title */}
          <Grid item xs={12}>
            <TextField
              autoFocus
              autoComplete='off'
              fullWidth
              label={
                <span>
                  Title <span style={{ color: 'red' }}>*</span>
                </span>
              }
              value={meetingData.title || ''}
              onChange={e => {
                const value = e.target.value
                if (value.trim() === '' && value.length > 0) return
                handleMeetingChange('title', value)
                setErrorMeetingData(prev => ({ ...prev, title: false }))
              }}
              placeholder='Enter Meeting Title'
              error={errorMeetingData.title}
              helperText={errorMeetingData.title ? 'Title is required' : ''}
            />
          </Grid>

          {/* Venue */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Meeting Venue</InputLabel>
              <Select value={meetingData.venue || ''} onChange={e => handleMeetingChange('venue', e.target.value)}>
                <MenuItem value='In-Office'>In-Office</MenuItem>
                <MenuItem value='Client Location'>Client Location</MenuItem>
                <MenuItem value='Online'>Online</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <TextField
              autoComplete='off'
              fullWidth
              label={
                <span>
                  Meeting Location
                </span>
              }
              value={meetingData.location || ''}
              onChange={e => {
                const value = e.target.value
                if (value.trim() === '' && value.length > 0) return
                handleMeetingChange('location', value)
                setErrorMeetingData(prev => ({ ...prev, location: false }))
              }}
              placeholder='Enter Meeting Location'
              error={errorMeetingData.location}
              helperText={errorMeetingData.location ? 'Location is required' : ''}
            />
          </Grid>

          {/* Meeting Link */}
          <Grid item xs={12}>
            <TextField
              autoComplete='off'
              fullWidth
              label={
                <span>
                  Meeting Link <span style={{ color: 'red' }}>*</span>
                </span>
              }
              value={meetingData.link || ''}
              onChange={e => {
                const value = e.target.value
                if (value.trim() === '' && value.length > 0) return
                handleMeetingChange('link', value)
                setErrorMeetingData(prev => ({ ...prev, link: false }))
              }}
              placeholder='Paste Meeting Link or Create Link'
              error={errorMeetingData.link}
              helperText={errorMeetingData.link ? 'Meeting link is required' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <Button
                      onClick={handleCreateGoogleMeetLink}
                      variant='contained'
                      sx={{
                        textTransform: 'none',
                        background: 'linear-gradient(90deg, #009cde 0%, #00b8f4 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '8px',
                        px: 2,
                        py: 0.8,
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.15)',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #007fb3 0%, #00a6dc 100%)'
                        }
                      }}
                    >
                      <Box display='flex' alignItems='center' gap={1}>
                        <img
                          src='https://www.gstatic.com/images/branding/product/1x/meet_2020q4_48dp.png'
                          alt='Google Meet'
                          width={20}
                          height={20}
                        />
                        Create Link
                      </Box>
                    </Button>
                  </InputAdornment>
                )
              }}
            />
          </Grid>

          {/* From Date & Time */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label={
                <span>
                  From Date <span style={{ color: 'red' }}>*</span>
                </span>
              }
              disablePast
              value={meetingData.fromDate ? dayjs(meetingData.fromDate) : dayjs()}
              onChange={newValue => {
                handleMeetingChange('fromDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                setErrorMeetingData(prev => ({ ...prev, fromDate: false }))
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: errorMeetingData.fromDate,
                  helperText: errorMeetingData.fromDate ? 'Invalid from date' : ''
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label='From Time'
              value={meetingData.fromTime ? dayjs(meetingData.fromTime, 'HH:mm') : dayjs().add(1, 'hour')}
              onChange={newValue => {
                const time = newValue ? newValue.format('HH:mm') : ''
                handleMeetingChange('fromTime', time)
                const invalid = validateReminderTime()
                setReminderFromTimeMeetingError(invalid)
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: reminderFromTimeMeetingError,
                  helperText: reminderFromTimeMeetingError ? 'Cannot be in the past' : ''
                }
              }}
            />
          </Grid>

          {/* To Date & Time */}
          <Grid item xs={12} sm={6}>
            <DatePicker
              label={
                <span>
                  To Date <span style={{ color: 'red' }}>*</span>
                </span>
              }
              disablePast
              value={meetingData.toDate ? dayjs(meetingData.toDate) : dayjs()}
              onChange={newValue => {
                handleMeetingChange('toDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                setErrorMeetingData(prev => ({ ...prev, toDate: false }))
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: errorMeetingData.toDate,
                  helperText: errorMeetingData.toDate ? 'Invalid to date' : ''
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TimePicker
              label='To Time'
              value={
                meetingData.toTime ? dayjs(meetingData.toTime, 'HH:mm') : dayjs().add(2, 'hour') 
              }
              onChange={newValue => {
                const time = newValue ? newValue.format('HH:mm') : ''
                handleMeetingChange('toTime', time)
                const invalid = validateReminderTime()
                setReminderToTimeMeetingError(invalid)
              }}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: reminderToTimeMeetingError,
                  helperText: reminderToTimeMeetingError ? 'Cannot be in the past' : ''
                }
              }}
            />
          </Grid>

          {/* Host */}
          <Grid item xs={12}>
            <TextField
              disabled
              label='Host'
              value={user_name || ''}
              fullWidth
              sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      {/* 🔹 Footer */}
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0', mt: 2 }}>
        <Box display='flex' justifyContent='space-between' width='100%'>
          <Button
            onClick={handleMeetingClose}
            variant='outlined'
            sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#ccc' }}
          >
            Close
          </Button>
          <Button
            variant='contained'
            disabled={
              loaderMeeting ||
              reminderFromTimeMeetingError ||
              reminderToTimeMeetingError ||
              !meetingData.title ||
              !meetingData.link ||
              !meetingData.fromDate ||
              !meetingData.toDate
            }
            onClick={saveMeeting}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' }
            }}
          >
            {loaderMeeting ? 'Saving...' : editingMeeting ? 'Update' : 'Save'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}

export default MeetingDialog
