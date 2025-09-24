'use client'
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
  Grid,
  IconButton,
  Tooltip
} from '@mui/material'

import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import React, { useState } from 'react'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'

import ColumnViewTaskList from './ColumnViewTaskList'
import TabViewTaskList from './TabViewTaskList'
import ChronologicalTaskList from './ChronologicalTaskList'
import CloseIcon from '@mui/icons-material/Close'

const statusColors = {
  'Not Started': { bg: '#F2F3F4', color: '#7F8C8D' },      // Grey
  'Deferred': { bg: '#FDEDEC', color: '#C0392B' },         // Red
  'In Progress': { bg: '#FEF5E7', color: '#E67E22' },      // Orange
  'Completed': { bg: '#E8F8F5', color: '#27AE60' },        // Green
  'Waiting for input': { bg: '#EBF5FB', color: '#2980B9' } // Blue
}


const priorityColors = {
  High: { bg: '#27AE60', color: '#FFFFFF' },
  Medium: { bg: '#F39C12', color: '#FFFFFF' },
  Low: { bg: '#C0392B', color: '#FFFFFF' }
}

export default function TaskTabs({ leadId, leadData }) {
  // const leadArrayTasks = leadData?.values?.Activity?.[0]?.task || []
  const leadArrayTasks = leadData?.values?.Activity?.[0]?.task?.filter(t => t.status !== 'Completed') || []

  console.log(leadArrayTasks, '<<< leadArrayTasks')

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
  const [view, setView] = useState('tab') // column | tab | chronological
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

  // handle input changes
  const handleChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
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

    // 🔹 Check if dueDate is in the past
    const today = new Date()
    today.setHours(0, 0, 0, 0) // compare only date (not time)
    const selectedDate = new Date(taskData.dueDate)

    if (selectedDate < today) {
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
            },
            lead_touch: 'touch'
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

          setTasks(prev =>
            prev.map(t =>
              t._id === updateTask._id
                ? { ...t, ...updateTask } // replace old task with updated task
                : t
            )
          )

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
            },
            lead_touch: 'touch'
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
      <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
        {/* Tabs + Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={tab}
            onChange={(e, val) => setTab(val)}
            textColor='secondary'
            indicatorColor='secondary'
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500 },
              '& .Mui-selected': { color: '#9c27b0 !important', fontWeight: 600 }
            }}
          >
            <Tab label={`Task (${tasks.length})`} />
            <Tab label='Meetings (0)' />
            <Tab label='Calls (0)' />
          </Tabs>

          <Button
            variant='contained'
            onClick={() => {
              setOpenTaskDialog(true) // ✅ Open the popup
              setAddAnchor(null)
            }}
            sx={{
              backgroundColor: '#AB09F7',
              textTransform: 'none',
              borderRadius: '8px',
              px: 2,
              py: 1,
              '&:hover': { backgroundColor: '#AB09F7' }
            }}
          >
            + New Task
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Task Cards */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tasks.length > 0 ? (
              tasks.map(task => (
                <Card
                  key={task._id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    boxShadow: '0px 2px 6px rgba(0,0,0,0.08)',
                    position: 'relative'
                  }}
                >
                  {/* Title + Status Chips */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>
                      {task.subject}
                    </Typography>

                    <Chip
                      label={task.status}
                      size='small'
                      sx={{
                        bgcolor: statusColors[task.status]?.bg,
                        color: statusColors[task.status]?.color,
                        fontWeight: 500
                      }}
                    />
                    <Chip
                      label={task.priority}
                      size='small'
                      sx={{
                        bgcolor: priorityColors[task.priority]?.bg,
                        color: priorityColors[task.priority]?.color,
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  {/* Footer */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      fontSize: 14,
                      color: 'text.secondary'
                    }}
                  >
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
                    <Typography variant='caption'>
                      {dayjs(task.dueDate).format('DD MMM YYYY')} . {task.reminderTime || '—'}
                    </Typography>
                    <Typography variant='caption' sx={{ ml: 2 }}>
                      Created By <b>{task.owner}</b>
                    </Typography>
                  </Box>

                  {/* Edit Icon */}
                  <IconButton
                    size='small'
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: '#f5f5f5',
                      '&:hover': { bgcolor: '#e0e0e0' }
                    }}
                    onClick={() => {
                      console.log(task, '<< task console')
                      setEditingTask(task) // 🟢 edit mode
                      setTaskData(task) // 🟢 prefill data
                      setOpenTaskDialog(true) // 🟢 open dialog
                    }}
                  >
                    <EditOutlinedIcon fontSize='small' />
                  </IconButton>
                </Card>
              ))
            ) : (
              <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
                🚫 No tasks found
              </Typography>
            )}
          </Box>
        )}

        {tab !== 0 && (
          <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
            No items found 🚫
          </Typography>
        )}

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
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
              ✨ {editingTask ? 'Update Task' : 'Create Task'}
              <Tooltip title={'Close'} arrow>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          {/* Form Content */}
          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
              {/* Subject */}
              <Grid item xs={12}>
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
                      helperText:
                        ErrorTaskData.dueDate && taskData.dueDate === null
                          ? 'Due Date is required'
                          : ErrorTaskData.dueDate && taskData.dueDate !== null
                            ? 'Due date cannot be in the past'
                            : ''
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
            <Box display={'flex'} justifyContent={'space-between'} width={'100%'}>
              <Button
                onClick={handleClose}
                variant='outlined'
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  color: 'text.secondary',
                  borderColor: '#ccc'
                }}
              >
                Close
              </Button>
              <Button
                variant='contained'
                disabled={
                  loader || reminderTimeError || taskData.subject?.length === 0 || taskData.dueDate?.length === 0
                }
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
            </Box>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  )
}
