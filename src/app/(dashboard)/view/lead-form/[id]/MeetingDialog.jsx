'use client'

import React, { useCallback, useEffect, useRef } from 'react'
import {
  Autocomplete,
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
  const initializedRef = useRef(false)

  // ✅ Validate times
  useEffect(() => {
    if (!meetingData.fromDate || !meetingData.fromTime || !meetingData.toDate || !meetingData.toTime) return

    const now = dayjs()
    const from = dayjs(`${meetingData.fromDate} ${meetingData.fromTime}`)
    const to = dayjs(`${meetingData.toDate} ${meetingData.toTime}`)

    setReminderFromTimeMeetingError(from.isBefore(now))
    setReminderToTimeMeetingError(to.isBefore(now))
  }, [meetingData.fromDate, meetingData.fromTime, meetingData.toDate, meetingData.toTime])

  // ✅ Initialize defaults safely (only once)
  useEffect(() => {
    if (
      openMeetingDialog &&
      !editingMeeting &&
      !meetingData.fromDate &&
      !meetingData.fromTime &&
      !initializedRef.current
    ) {
      const now = dayjs()
      const from = now.add(1, 'hour').startOf('hour')
      const to = from.add(1, 'hour')

      handleMeetingChange('fromDate', from.format('YYYY-MM-DD'))
      handleMeetingChange('fromTime', from.format('HH:mm'))
      handleMeetingChange('toDate', to.format('YYYY-MM-DD'))
      handleMeetingChange('toTime', to.format('HH:mm'))

      initializedRef.current = true // 🔥 Prevent further runs
    }

    if (!openMeetingDialog) {
      initializedRef.current = false // Reset when dialog closes
    }
  }, [openMeetingDialog])

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
              label={<span>Meeting Location</span>}
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

          {meetingData.venue === 'Online' && (
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
                  handleMeetingChange('link', value)
                  setErrorMeetingData(prev => ({ ...prev, link: false }))
                }}
                placeholder='Paste Meeting Link'
                error={errorMeetingData.link}
                helperText={errorMeetingData.link ? 'Meeting link is required' : ''}
              />
            </Grid>
          )}

          {meetingData.venue !== 'Online' && (
            <Grid item xs={12}>
              <TextField
                autoComplete='off'
                fullWidth
                label='Meeting Link (Optional)'
                value={meetingData.link || ''}
                onChange={e => handleMeetingChange('link', e.target.value)}
                placeholder='Paste Meeting Link (if any)'
              />
            </Grid>
          )}
          {/* <Grid item xs={12}>
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
          </Grid> */}

          {/* Participants */}
          <Grid item xs={12} sm={12}>
            <Autocomplete
              multiple
              freeSolo
              options={[]} // optional: can map your user list here
              value={meetingData.participants || []}
              onChange={(e, newValue) => {
                handleMeetingChange('participants', newValue)
                setErrorMeetingData(prev => ({ ...prev, participants: false }))
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Participants <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  placeholder='Enter participant emails'
                  error={errorMeetingData.participants}
                  helperText={errorMeetingData.participants ? 'At least one participant is required' : ''}
                />
              )}
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
              format="DD/MM/YYYY"
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
              format="DD/MM/YYYY"
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
              value={meetingData.toTime ? dayjs(meetingData.toTime, 'HH:mm') : dayjs().add(2, 'hour')}
              onChange={newValue => {
                const time = newValue ? newValue.format('HH:mm') : ''
                handleMeetingChange('toTime', time)
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
              !meetingData.fromDate ||
              !meetingData.toDate ||
              (meetingData.venue === 'Online' && !meetingData.link) || // 🔥 Only required when Online
              !meetingData.participants ||
              meetingData.participants.length === 0 // 👈 Added
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
