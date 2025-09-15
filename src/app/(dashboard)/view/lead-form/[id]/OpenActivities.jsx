'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  Menu,
  Divider,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  MenuItem as MuiMenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Stack,
  Grid
} from '@mui/material'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

// ⏰ Calendar Imports
import dayjs from 'dayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'

import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import ColumnViewTaskList from './ColumnViewTaskList'
import TabViewTaskList from './TabViewTaskList'
import ChronologicalTaskList from './ChronologicalTaskList'

// helper function for parsing date+time
function parseDateTime(date, time) {
  if (!date) return new Date() // fallback to now

  // if ISO date comes (yyyy-mm-dd), handle that too
  let day, month, year

  if (date.includes('/')) {
    // expecting dd/mm/yyyy
    ;[day, month, year] = date.split('/')
  } else if (date.includes('-')) {
    // expecting yyyy-mm-dd
    ;[year, month, day] = date.split('-')
  }

  let fullDate = new Date(`${year}-${month}-${day}`)

  if (time && time.includes(':')) {
    try {
      const t = time.split('-')[0].trim()
      fullDate = new Date(`${year}-${month}-${day} ${t}`)
    } catch (e) {
      console.log('time parse failed', e)
    }
  }
  return fullDate
}

export default function OpenActivities({ leadId, leadData }) {
  const leadArrayTasks = leadData?.values?.Activity?.[0]?.task || []

  const sortedTasks = [...leadArrayTasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(t => {
      return {
        type: 'Task',
        _id: t._id || '',
        subject: t.subject || 'Untitled Task',
        dueDate: t.dueDate, // ✅ Using reminderDate
        priority: t.priority || 'Medium',
        status: t.status || 'Not Started',
        owner: t.owner || 'Unknown',
        reminderEnabled: t.reminderEnabled,
        reminderDate: t.reminderDate,
        reminderTime: t.reminderTime, // ✅ Using reminderTime
        alertType: t.alertType // keep raw Date object if needed
      }
    })

  const getToken = Cookies.get('_token')
  const user_name = Cookies.get('user_name')
  const user_id = Cookies.get('user_id')

  const [addAnchor, setAddAnchor] = useState(null)
  const [viewAnchor, setViewAnchor] = useState(null)
  const [view, setView] = useState('column') // column | tab | chronological
  const [tab, setTab] = useState(0)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [tasks, setTasks] = useState(sortedTasks || [])
  const [editingTask, setEditingTask] = useState(null) // holds note being edited
  const [loader, setLoader] = useState(false)
  const [reminderTimeError, setReminderTimeError] = useState(false)

  // 🟢 Calls + Meetings (still dummy, later API integrate pannalaam)
  const meetings = []
  const calls = []

  // inside component:
  const [taskData, setTaskData] = useState({
    _id: '',
    subject: '',
    dueDate: '',
    priority: 'High',
    status: 'Not Started',
    owner: user_name,
    reminderEnabled: false,
    reminderDate: '',
    reminderTime: '',
    alertType: 'Both'
  })

  const [ErrorTaskData, setErrorTaskData] = useState({
    subject: false,
    dueDate: false,
    priority: false,
    status: false,
    owner: false,
    reminderEnabled: false,
    reminderDate: false,
    reminderTime: false,
    alertType: false
  })

  const allActivities = [...tasks, ...calls, ...meetings].sort((a, b) => {
    const dateA = a.dueDate || a.date || ''
    const timeA = a.reminderTime || a.time || ''
    const dateB = b.dueDate || b.date || ''
    const timeB = b.reminderTime || b.time || ''

    return parseDateTime(dateA, timeA) - parseDateTime(dateB, timeB)
  })

  // handle input changes
  const handleChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setOpenTaskDialog(false)
    setAddAnchor(null)
    setEditingTask(null) // 🟢 reset
    setTaskData({
      _id: '',
      subject: '',
      dueDate: '',
      priority: 'High',
      status: 'Not Started',
      owner: user_name,
      reminderEnabled: false,
      reminderDate: '',
      reminderTime: '',
      alertType: 'Both'
    })
  }

  function hasInitialSpace(str = '') {
    return str.length > 0 && str[0] === ' '
  }

  const validateReminderTime = () => {
    if (!taskData.reminderEnabled || !taskData.reminderTime || !taskData.reminderDate) return true

    const reminderDateTime = dayjs(
      `${dayjs(taskData.reminderDate).format('YYYY-MM-DD')} ${taskData.reminderTime}`,
      'YYYY-MM-DD HH:mm'
    )
    const now = dayjs()

    // If reminder is set for today, time must be >= current time
    if (dayjs(taskData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now)) {
      return false
    }
    return true
  }

  // API call
  const saveTask = async () => {
    if (!taskData.subject || hasInitialSpace(taskData.subject)) {
      setErrorTaskData(prev => ({ ...prev, subject: true }))
      return
    }

    if (!taskData.dueDate) {
      setErrorTaskData(prev => ({ ...prev, dueDate: true }))
      return
    }

    if (editingTask) {
      const updateTask = {
        _id: taskData._id,
        subject: taskData.subject,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
        owner: taskData.owner,
        reminderEnabled: taskData.reminderEnabled,
        reminderDate: taskData.reminderDate,
        reminderTime: taskData.reminderTime,
        alertType: taskData.alertType,
        createdAt: new Date().toISOString(),
        createdBy: user_id
      }

      try {
        setLoader(true)
        const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          },
          body: JSON.stringify({
            values: {
              Activity: [
                {
                  task: [updateTask] // backend push pannum
                }
              ]
            }
          })
        })

        const result = await res.json()

        setLoader(false)

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Server Error')
        }

        if (result.success) {
          const response = result.data
          const tasks = response.values?.Activity?.[0]?.task || []
          setTasks(tasks)

          toast.success('Task Updated Successfully!', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })

          setOpenTaskDialog(false)
          setAddAnchor(null)
          setTaskData({
            _id: '',
            subject: '',
            dueDate: '',
            priority: 'High',
            status: 'Not Started',
            owner: user_name,
            reminderEnabled: false,
            reminderDate: '',
            reminderTime: '',
            alertType: 'Both'
          })
        }
      } catch (err) {
        console.error('Error saving task:', err)
        alert('❌ Failed to create task')
      }
    } else {
      const newTask = {
        subject: taskData.subject,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        status: taskData.status,
        owner: taskData.owner,
        reminderEnabled: taskData.reminderEnabled,
        reminderDate: taskData.reminderDate,
        reminderTime: taskData.reminderTime,
        alertType: taskData.alertType,
        createdAt: new Date().toISOString(),
        createdBy: user_id
      }

      try {
        setLoader(true)
        const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          },
          body: JSON.stringify({
            values: {
              Activity: [
                {
                  task: [newTask] // backend push pannum
                }
              ]
            }
          })
        })

        const result = await res.json()

        setLoader(false)

        if (!res.ok || !result.success) {
          throw new Error(result.message || 'Server Error')
        }

        if (result.success) {
          const response = result.data
          const tasks = response.values?.Activity?.[0]?.task || []

          const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null

          const formattedTask = {
            type: 'Task',
            _id: lastTask._id || '',
            subject: lastTask.subject || 'Untitled Task',
            dueDate: lastTask.dueDate, // ✅ Using reminderDate
            priority: lastTask.priority || 'Medium',
            status: lastTask.status || 'Not Started',
            owner: lastTask.owner || 'Unknown',
            reminderEnabled: lastTask.reminderEnabled,
            reminderDate: lastTask.reminderDate,
            reminderTime: lastTask.reminderTime, // ✅ Using reminderTime
            alertType: lastTask.alertType // keep raw Date object if needed
          }

          setTasks(prev => [formattedTask, ...prev])

          toast.success('Task Added Successfully!', {
            autoClose: 500, // 1 second la close
            position: 'bottom-center',
            hideProgressBar: true, // progress bar venam na
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            progress: undefined
          })

          // reset form + close
          setOpenTaskDialog(false)
          setAddAnchor(null)
          setTaskData({
            _id: '',
            subject: '',
            dueDate: '',
            priority: 'High',
            status: 'Not Started',
            owner: user_name,
            reminderEnabled: false,
            reminderDate: '',
            reminderTime: '',
            alertType: 'Both'
          })
        }
      } catch (err) {
        console.error('Error saving task:', err)
        alert('❌ Failed to create task')
      }
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Card sx={{ p: 2, bgcolor: '#ffffff' }}>
        <Box>
          <Box display='flex' justifyContent='space-between' alignItems='center' width='100%' p={4}>
            <Typography variant='h6' fontWeight='bold'>
              Open Activities
            </Typography>

            <Button
              variant='contained'
              size='small'
              sx={{ marginRight: '37px' }}
              onClick={e => {
                e.stopPropagation() // ✅ prevent accordion toggle
                setAddAnchor(e.currentTarget)
              }}
            >
              + Add New
            </Button>

            <Menu
              anchorEl={addAnchor}
              open={Boolean(addAnchor)}
              onClose={() => setAddAnchor(null)} // ✅ fix closing issue
            >
              <MenuItem
                onClick={() => {
                  setOpenTaskDialog(true) // ✅ Open the popup
                  setAddAnchor(null)
                }}
              >
                Create Task
              </MenuItem>
              <MenuItem
                onClick={() => {
                  alert('Add new Call')
                  setAddAnchor(null)
                }}
              >
                Create Call
              </MenuItem>
              <MenuItem
                onClick={() => {
                  alert('Add new Meeting')
                  setAddAnchor(null)
                }}
              >
                Create Meeting
              </MenuItem>
            </Menu>

            <Dialog
              open={openTaskDialog}
              onClose={() => setOpenTaskDialog(false)}
              maxWidth='sm'
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  p: 1,
                  boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
                  bgcolor: '#fff'
                }
              }}
            >
              {/* Header */}
              <DialogTitle
                sx={{
                  fontWeight: 'bold',
                  fontSize: '1.3rem',
                  textAlign: 'center',
                  borderBottom: '1px solid #f0f0f0',
                  pb: 2
                }}
              >
                ✨ {editingTask ? 'Update Task' : 'Create Task'}
              </DialogTitle>

              {/* Form Content */}
              <DialogContent dividers sx={{ p: 3 }}>
                <Grid container spacing={3}>
                  {/* Subject */}
                  <Grid item xs={12}>
                    {/* <TextField
                      autoFocus
                      label='Subject'
                      fullWidth
                      value={taskData.subject}
                      onChange={e => {
                        handleChange('subject', e.target.value)
                        setErrorTaskData(prev => ({ ...prev, subject: false })) // clear error while typing
                      }}
                      placeholder='Enter Task *'
                      error={ErrorTaskData.subject}
                      helperText={ErrorTaskData.subject ? 'Subject is required' : ''}
                    /> */}

                    <TextField
                      autoFocus
                      fullWidth
                      label={
                        <span>
                          Subject <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      value={taskData.subject}
                      onChange={e => {
                        handleChange('subject', e.target.value)
                        setErrorTaskData(prev => ({ ...prev, subject: false }))
                      }}
                      placeholder='Enter Task'
                      error={ErrorTaskData.subject}
                      helperText={ErrorTaskData.subject ? 'Subject is required' : ''}
                    />
                  </Grid>

                  {/* Due Date */}
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      // label='Due Date *'
                       label={
                        <span>
                          Due Date <span style={{ color: 'red' }}>*</span>
                        </span>
                      }
                      disablePast // 🚀 past date select panna mudiyadhu
                      value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
                      onChange={newValue => {
                        // handleChange('dueDate', newValue ? newValue.toISOString() : '')
                        // When saving dueDate or reminderDate
                        handleChange('dueDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')

                        setErrorTaskData(prev => ({ ...prev, dueDate: false }))
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: ErrorTaskData.dueDate,
                          helperText: ErrorTaskData.dueDate ? 'Due Date is required' : ''
                        }
                      }}
                    />
                  </Grid>

                  {/* Priority */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Priority</InputLabel>
                      <Select value={taskData.priority} onChange={e => handleChange('priority', e.target.value)}>
                        <MuiMenuItem value='Low'>Low</MuiMenuItem>
                        <MuiMenuItem value='Medium'>Medium</MuiMenuItem>
                        <MuiMenuItem value='High'>High</MuiMenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Status */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select value={taskData.status} onChange={e => handleChange('status', e.target.value)}>
                        <MuiMenuItem value='Not Started'>Not Started</MuiMenuItem>
                        <MuiMenuItem value='Deferred'>Deferred</MuiMenuItem>
                        <MuiMenuItem value='In Progress'>In Progress</MuiMenuItem>
                        <MuiMenuItem value='Completed'>Completed</MuiMenuItem>
                        <MuiMenuItem value='Waiting for input'>Waiting for input</MuiMenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Owner */}
                  <Grid item xs={12}>
                    <TextField
                      disabled
                      label='Created By'
                      defaultValue={user_name}
                      fullWidth
                      variant='outlined'
                      sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
                    />
                  </Grid>

                  {/* Reminder Section */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        border: '1px solid #eee',
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: '#f9f9f9'
                      }}
                    >
                      <Typography fontWeight='bold' mb={2} color='text.primary'>
                        ⏰ Reminder
                      </Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={taskData.reminderEnabled}
                            onChange={e => handleChange('reminderEnabled', e.target.checked)}
                          />
                        }
                        label='Set Reminder'
                      />

                      {taskData.reminderEnabled && (
                        <Grid container spacing={2} mt={1}>
                          <Grid item xs={12} sm={6}>
                            <DatePicker
                              label='Reminder Date'
                              disablePast // 🚀 past date select panna mudiyadhu
                              value={taskData.reminderDate ? dayjs(taskData.reminderDate) : null}
                              onChange={newValue => {
                                // handleChange('reminderDate', newValue ? newValue.toISOString() : '')
                                handleChange('reminderDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                                setErrorTaskData(prev => ({ ...prev, reminderDate: false }))
                              }}
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: ErrorTaskData.reminderDate,
                                  helperText: ErrorTaskData.reminderDate ? 'Reminder Date is required' : ''
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            {/* <TimePicker
                              label='Reminder Time'
                              value={
                                taskData.reminderTime
                                  ? dayjs(taskData.reminderTime, 'HH:mm')
                                  : dayjs().add(5, 'minute') // 🟢 default current time + 5 mins
                              }
                              onChange={newValue =>
                                handleChange('reminderTime', newValue ? newValue.format('HH:mm') : '')
                              }
                              minTime={
                                taskData.reminderDate && dayjs(taskData.reminderDate).isSame(dayjs(), 'day')
                                  ? dayjs()
                                  : null
                              }
                            /> */}

                            <TimePicker
                              label='Reminder Time'
                              value={
                                taskData.reminderTime ? dayjs(taskData.reminderTime, 'HH:mm') : dayjs().add(5, 'minute')
                              }
                              onChange={newValue => {
                                const time = newValue ? newValue.format('HH:mm') : ''
                                handleChange('reminderTime', time)

                                // validate on change
                                const isValid =
                                  dayjs(
                                    `${dayjs(taskData.reminderDate).format('YYYY-MM-DD')} ${time}`,
                                    'YYYY-MM-DD HH:mm'
                                  ).isAfter(dayjs()) || !dayjs(taskData.reminderDate).isSame(dayjs(), 'day')
                                setReminderTimeError(!isValid)
                              }}
                              minTime={
                                taskData.reminderDate && dayjs(taskData.reminderDate).isSame(dayjs(), 'day')
                                  ? dayjs()
                                  : null
                              }
                              slotProps={{
                                textField: {
                                  fullWidth: true,
                                  error: reminderTimeError,
                                  helperText: reminderTimeError ? 'Reminder time cannot be in the past' : ''
                                }
                              }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>Alert Type</InputLabel>
                              <Select
                                value={taskData.alertType || 'Both'}
                                onChange={e => handleChange('alertType', e.target.value)}
                              >
                                <MuiMenuItem value='Email'>Email</MuiMenuItem>
                                <MuiMenuItem value='Popup'>Pop-up</MuiMenuItem>
                                <MuiMenuItem value='Both'>Both</MuiMenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>

              {/* Actions */}
              <DialogActions
                sx={{
                  px: 3,
                  py: 2,
                  borderTop: '1px solid #f0f0f0',
                  mt: 2
                }}
              >
                <Button
                  onClick={handleCancel}
                  variant='outlined'
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    color: 'text.secondary',
                    borderColor: '#ccc'
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant='contained'
                  disabled={loader || reminderTimeError}
                  onClick={saveTask}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  {loader ? 'Saving...' : editingTask ? 'Update' : 'Save'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Box display='flex' justifyContent='flex-end'>
            <Button
              sx={{ marginRight: '25px' }}
              variant='outlined'
              endIcon={<ArrowDropDownIcon />}
              onClick={e => {
                e.stopPropagation() // ✅ prevent accordion toggle
                setViewAnchor(e.currentTarget)
              }}
            >
              {view === 'column' ? 'Column View' : view === 'tab' ? 'Tab View' : 'Chronological View'}
            </Button>
          </Box>
          <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>
            <MenuItem
              onClick={() => {
                setView('column')
                setViewAnchor(null)
              }}
            >
              Column View
            </MenuItem>
            <MenuItem
              onClick={() => {
                setView('tab')
                setViewAnchor(null)
              }}
            >
              Tab View
            </MenuItem>
            <MenuItem
              onClick={() => {
                setView('chronological')
                setViewAnchor(null)
              }}
            >
              Chronological View
            </MenuItem>
          </Menu>

          <Card sx={{ p: 2, borderRadius: 3 }}>
            {/* Column View */}
            {view === 'column' && (
              <Box display='grid' gridTemplateColumns='repeat(3, 1fr)' gap={2}>
                {/* Tasks */}
                <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                  <Typography fontWeight='bold'>Open Tasks ({tasks.length})</Typography>
                  <Divider sx={{ my: 1 }} />

                  {Array.isArray(tasks) && tasks.length === 0 ? (
                    <Card
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        bgcolor: '#fafafa',
                        border: '1px dashed #ccc',
                        borderRadius: 3,
                        mt: 3
                      }}
                    >
                      <Typography variant='h6' color='text.secondary' gutterBottom>
                        📝 No Task Found
                      </Typography>
                      <Typography variant='body2' color='text.disabled' mb={2}>
                        Start by adding your first task for this lead.
                      </Typography>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => {
                          setOpenTaskDialog(true) // ✅ Open the popup
                          setAddAnchor(null)
                        }}
                      >
                        + Create Task
                      </Button>
                    </Card>
                  ) : (
                    <ColumnViewTaskList
                      tasks={tasks}
                      onEdit={task => {
                        setEditingTask(task) // 🟢 edit mode set pannidum
                        setTaskData(task) // 🟢 form la data prefill pannidum
                        setOpenTaskDialog(true) // 🟢 dialog open
                      }}
                    />
                  )}
                </Card>

                {/* Calls */}
                <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                  <Typography fontWeight='bold'>Open Calls ({calls.length})</Typography>
                  <Divider sx={{ my: 1 }} />

                  {Array.isArray(calls) &&
                    calls.map((c, i) => (
                      <Box key={i} mb={1.5} p={1.5} border='1px solid #ddd' borderRadius={2} bgcolor='#fff'>
                        {/* Title */}
                        <Typography fontWeight='bold' color='primary'>
                          {c.subject}
                        </Typography>

                        {/* Date + Time */}
                        <Typography variant='body2' color='text.secondary'>
                          📅 {c.date} {c.time && `• ⏰ ${c.time}`}
                        </Typography>

                        {/* Owner */}
                        <Typography variant='caption' display='block'>
                          👤 {c.owner}
                        </Typography>

                        {/* Purpose + Agenda → Chips */}
                        <Stack direction='column' spacing={1} mt={1}>
                          {c.purpose && (
                            <Chip label={`Purpose: ${c.purpose}`} size='small' sx={{ bgcolor: 'info.light' }} />
                          )}
                          {c.agenda && (
                            <Chip label={`Agenda: ${c.agenda}`} size='small' sx={{ bgcolor: 'secondary.light' }} />
                          )}
                        </Stack>
                      </Box>
                    ))}
                </Card>

                {/* Meetings */}
                <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                  <Typography fontWeight='bold'>Open Meetings ({meetings.length})</Typography>
                  <Divider sx={{ my: 1 }} />

                  {Array.isArray(meetings) &&
                    meetings.map((m, i) => (
                      <Box key={i} mb={1.5} p={1.5} border='1px solid #ddd' borderRadius={2} bgcolor='#fff'>
                        {/* Title */}
                        <Typography fontWeight='bold' color='primary'>
                          {m.subject}
                        </Typography>

                        {/* Date + Time */}
                        <Typography variant='body2' color='text.secondary'>
                          📅 {m.date} {m.time && `• ⏰ ${m.time}`}
                        </Typography>

                        {/* Owner */}
                        <Typography variant='caption' display='block'>
                          👤 {m.owner}
                        </Typography>

                        {/* Extra Info → Optional chips */}
                        <Stack direction='row' spacing={1} mt={1}>
                          {m.location && (
                            <Chip label={`Location: ${m.location}`} size='small' sx={{ bgcolor: 'success.light' }} />
                          )}
                          {m.agenda && (
                            <Chip label={`Agenda: ${m.agenda}`} size='small' sx={{ bgcolor: 'warning.light' }} />
                          )}
                        </Stack>
                      </Box>
                    ))}
                </Card>
              </Box>
            )}

            {/* Tab View */}
            {view === 'tab' && (
              <>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                  <Tab label={`Tasks (${tasks.length})`} />
                  <Tab label={`Meetings (${meetings.length})`} />
                  <Tab label={`Calls (${calls.length})`} />
                </Tabs>

                {tab === 0 && (
                  <TabViewTaskList
                    tasks={tasks}
                    onEdit={task => {
                      setEditingTask(task) // 🟢 edit mode set pannidum
                      setTaskData(task) // 🟢 form la data prefill pannidum
                      setOpenTaskDialog(true) // 🟢 dialog open
                    }}
                  />
                )}

                {tab === 1 && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Owner</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(meetings) &&
                        meetings.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Typography color='primary'>{m.subject}</Typography>
                            </TableCell>
                            <TableCell>
                              {m.date} {m.time}
                            </TableCell>
                            <TableCell>{m.owner}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}

                {tab === 2 && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Purpose</TableCell>
                        <TableCell>Agenda</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(calls) &&
                        calls.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Typography color='primary'>{c.subject}</Typography>
                            </TableCell>
                            <TableCell>
                              {c.date} {c.time}
                            </TableCell>
                            <TableCell>{c.owner}</TableCell>
                            <TableCell>{c.purpose}</TableCell>
                            <TableCell>{c.agenda}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}

            {/* Chronological View */}
            {view === 'chronological' && (
              <>
                <Tabs value={tab} onChange={(e, v) => setTab(v)}>
                  <Tab label={`Tasks (${tasks.length})`} />
                  <Tab label={`Meetings (${meetings.length})`} />
                  <Tab label={`Calls (${calls.length})`} />
                </Tabs>

                {tab === 0 && (
                  <ChronologicalTaskList
                    tasks={tasks}
                    onEdit={task => {
                      setEditingTask(task) // 🟢 edit mode set pannidum
                      setTaskData(task) // 🟢 form la data prefill pannidum
                      setOpenTaskDialog(true) // 🟢 dialog open
                    }}
                  />
                )}

                {tab === 1 && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Owner</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(meetings) &&
                        meetings.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Typography color='primary'>{m.subject}</Typography>
                            </TableCell>
                            <TableCell>
                              {m.date} {m.time}
                            </TableCell>
                            <TableCell>{m.owner}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}

                {tab === 2 && (
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Purpose</TableCell>
                        <TableCell>Agenda</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(calls) &&
                        calls.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Typography color='primary'>{c.subject}</Typography>
                            </TableCell>
                            <TableCell>
                              {c.date} {c.time}
                            </TableCell>
                            <TableCell>{c.owner}</TableCell>
                            <TableCell>{c.purpose}</TableCell>
                            <TableCell>{c.agenda}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                )}
              </>
            )}
          </Card>
        </Box>
      </Card>
    </LocalizationProvider>
  )
}
