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
import TaskList from './TaskList'

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
      // let reminderDateTime = ''
      // let reminderDateFormatted = ''
      // let reminderTimeFormatted = ''

      // if (t.reminderDate && t.reminderTime) {
      //   const reminderDateTimeObj = new Date(`${t.reminderDate.split('T')[0]}T${t.reminderTime}:00`)
      //   reminderDateFormatted = reminderDateTimeObj.toLocaleDateString()
      //   reminderTimeFormatted = reminderDateTimeObj.toLocaleTimeString([], {
      //     hour: '2-digit',
      //     minute: '2-digit'
      //   })
      //   reminderDateTime = reminderDateTimeObj
      // }

      return {
        type: 'Task',
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

  const [addAnchor, setAddAnchor] = useState(null)
  const [viewAnchor, setViewAnchor] = useState(null)
  const [view, setView] = useState('column') // column | tab | chronological
  const [tab, setTab] = useState(0)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [tasks, setTasks] = useState(sortedTasks || [])
  const [editingTask, setEditingTask] = useState(null) // holds note being edited
  const [loader, setLoader] = useState(false)

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
    owner: 'Dhilip',
    reminderEnabled: false,
    reminderDate: '',
    reminderTime: '',
    alertType: 'Email'
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

  // Merge + sort activities
  const allActivities = [...tasks, ...calls, ...meetings].sort(
    (a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
  )

  // handle input changes
  const handleChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }))
  }

  const handleCancel = () => {
    setOpenTaskDialog(false) // ✅ Open the popup
    setAddAnchor(null)
    setTaskData({
      subject: '',
      dueDate: '',
      priority: 'High',
      status: 'Not Started',
      owner: 'Dhilip',
      reminderEnabled: false,
      reminderDate: '',
      reminderTime: '',
      alertType: 'Email'
    })
  }

  function hasInitialSpace(str = '') {
    return str.length > 0 && str[0] === ' '
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
      createdBy: user_name
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
        // console.log(result,"<<<  RESULTSSS")
        // 👉 UI display format ku convert

        // Format reminderDate + reminderTime

        // 🟢 Local state update → new task on top

        const response = result.data

        // Get tasks safely
        const tasks = response.values?.Activity?.[0]?.task || []

        // Last task
        const lastTask = tasks.length > 0 ? tasks[tasks.length - 1] : null
              console.log(lastTask,"<<< LAST TASKKKK")

        // let reminderDateFormatted = ''
        // let reminderTimeFormatted = ''

        // if (lastTask.reminderDate && lastTask.reminderTime) {
        //   const reminderDateTimeObj = new Date(`${lastTask.reminderDate.split('T')[0]}T${lastTask.reminderTime}:00`)
        //   reminderDateFormatted = reminderDateTimeObj.toLocaleDateString()
        //   reminderTimeFormatted = reminderDateTimeObj.toLocaleTimeString([], {
        //     hour: '2-digit',
        //     minute: '2-digit'
        //   })
        // }

        const formattedTask = {
          type: 'Task',
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

        // reset form + close
        setOpenTaskDialog(false)
        setAddAnchor(null)
        setTaskData({
          subject: '',
          dueDate: '',
          priority: 'High',
          status: 'Not Started',
          owner: 'Dhilip',
          reminderEnabled: false,
          reminderDate: '',
          reminderTime: '',
          alertType: 'Email'
        })
      }

      console.log(result, '<<< result DATAAAA')
    } catch (err) {
      console.error('Error saving task:', err)
      alert('❌ Failed to create task')
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
              sx={{ marginRight: '20px' }}
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
                    <TextField
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
                    />
                  </Grid>

                  {/* Due Date */}
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label='Due Date'
                      disablePast // 🚀 past date select panna mudiyadhu
                      value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
                      onChange={newValue => {
                        handleChange('dueDate', newValue ? newValue.toISOString() : '')
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
                      label='Owner'
                      defaultValue='Dhilip'
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
                                handleChange('reminderDate', newValue ? newValue.toISOString() : '')
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
                            <TimePicker
                              label='Reminder Time'
                              value={taskData.reminderTime ? dayjs(taskData.reminderTime, 'HH:mm') : null}
                              onChange={newValue =>
                                handleChange('reminderTime', newValue ? newValue.format('HH:mm') : '')
                              }
                              minTime={dayjs()} // 🚀 disallow past times (only works if date = today)
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <FormControl fullWidth>
                              <InputLabel>Alert Type</InputLabel>
                              <Select
                                value={taskData.alertType || 'Email'}
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
                  onClick={saveTask}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    bgcolor: '#1976d2',
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                  disabled={loader}
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
                    <TaskList tasks={tasks} />
                  )}
                </Card>

                {/* Calls */}
                <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                  <Typography fontWeight='bold'>Open Calls ({calls.length})</Typography>
                  <Divider sx={{ my: 1 }} />

                  {Array.isArray(calls) && calls.map((c, i) => (
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

                  {Array.isArray(meetings) && meetings.map((m, i) => (
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
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Task Owner</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Array.isArray(tasks) && tasks.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Typography color='primary'>{t.subject}</Typography>
                          </TableCell>
                          <TableCell>{t.date}</TableCell>
                          <TableCell>{t.owner}</TableCell>
                          <TableCell>{t.status}</TableCell>
                          <TableCell>{t.priority}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
                      { Array.isArray(meetings) && meetings.map((m, i) => (
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
                      {Array.isArray(calls) && calls.map((c, i) => (
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
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Activity Info ({allActivities.length})</TableCell>
                    <TableCell>Owner/Host</TableCell>
                    <TableCell>Date And Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allActivities.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Typography color='primary'>{a.subject}</Typography>
                        {a.type === 'Call' && (
                          <Typography variant='body2'>
                            Call Purpose : {a.purpose} | Call Agenda : {a.agenda}
                          </Typography>
                        )}
                        {a.type === 'Task' && (
                          <Typography variant='body2'>
                            Status : {a.status} | Priority : {a.priority}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{a.owner}</TableCell>
                      <TableCell>
                        {a.date} {a.time ? a.time : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </Box>
      </Card>
    </LocalizationProvider>
  )
}
