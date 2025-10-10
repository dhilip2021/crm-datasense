'use client'
import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Chip,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'

const statusColors = {
  'Not Started': { bg: '#F2F3F4', color: '#7F8C8D' },
  Deferred: { bg: '#FDEDEC', color: '#C0392B' },
  'In Progress': { bg: '#FEF5E7', color: '#E67E22' },
  Completed: { bg: '#E8F8F5', color: '#27AE60' },
  'Waiting for input': { bg: '#EBF5FB', color: '#2980B9' }
}


const priorityColors = {
  High: { bg: '#C0392B', color: '#FFFFFF' },
  Medium: { bg: '#F39C12', color: '#FFFFFF' },
  Low: { bg: '#27AE60', color: '#FFFFFF' }
}







export default function TaskTabs({ leadId, leadData, fetchLeadFromId }) {
  const getToken = Cookies.get('_token')
  const user_name = Cookies.get('user_name')
  const user_id = Cookies.get('user_id')

  // Filter out completed tasks for display
  const leadArrayTasks = leadData?.values?.Activity?.[0]?.task || []

   console.log(leadArrayTasks,"<<< leadArrayTasks")


  const sortedTasks = useMemo(() => {
    return [...leadArrayTasks]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map(t => ({
        type: 'Task',
        _id: t._id || '',
        subject: t.subject || 'Untitled Task',
        dueDate: t.dueDate,
        priority: t.priority || 'Medium',
        status: t.status || 'Not Started',
        owner: t.owner || 'Unknown',
        reminderEnabled: t.reminderEnabled || false,
        reminderDate: t.reminderDate || '',
        reminderTime: t.reminderTime || '',
        alertType: t.alertType || 'Both'
      }))
  }, [leadArrayTasks])


const today = dayjs().startOf('day')

// Separate tasks based on dueDate
const completedTasks = useMemo(
  () => sortedTasks.filter(t => dayjs(t.dueDate).isBefore(today, 'day')),
  [sortedTasks]
)

const currentTasks = useMemo(
  () => sortedTasks.filter(t => dayjs(t.dueDate).isSame(today, 'day')),
  [sortedTasks]
)

const upcomingTasks = useMemo(
  () => sortedTasks.filter(t => dayjs(t.dueDate).isAfter(today, 'day')),
  [sortedTasks]
)



 

  const [tab, setTab] = useState(0)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [tasks, setTasks] = useState(sortedTasks)
  const [editingTask, setEditingTask] = useState(null)
  const [loader, setLoader] = useState(false)
  const [reminderTimeError, setReminderTimeError] = useState(false)

  const initialTaskData = {
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
  }

  const [taskData, setTaskData] = useState(initialTaskData)
  const [errorTaskData, setErrorTaskData] = useState({
    subject: false,
    dueDate: false,
    reminderDate: false
  })

  const renderTaskCard = task => (
  <Card
    key={task._id}
    sx={{ p: 2, borderRadius: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.08)', position: 'relative' }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      <Typography variant='subtitle1' fontWeight={600}>
        {task.subject}
      </Typography>
      <Chip
        label={task.status}
        size='small'
        sx={{
          backgroundColor: statusColors[task.status]?.bg,
          color: statusColors[task.status]?.color,
          fontWeight: 600,
          fontSize: 12,
          px: 1,
          height: 24,
          '& .MuiChip-label': { px: 1 }
        }}
      />
      <Chip
        label={task.priority}
        size='small'
        sx={{
          backgroundColor: priorityColors[task.priority]?.bg,
          color: priorityColors[task.priority]?.color,
          fontWeight: 600,
          fontSize: 12,
          px: 1,
          height: 24,
          '& .MuiChip-label': { px: 1 }
        }}
      />
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 14, color: 'text.secondary' }}>
      <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
      <Typography variant='caption'>
        {dayjs(task.dueDate).format('DD MMM YYYY')} . {task.reminderTime || '—'}
      </Typography>
      <Typography variant='caption' sx={{ ml: 2 }}>
        Created By <b>{task.owner}</b>
      </Typography>
    </Box>

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
        setEditingTask(task)
        setTaskData(task)
        setOpenTaskDialog(true)
      }}
    >
      <EditOutlinedIcon fontSize='small' />
    </IconButton>
  </Card>
)

  const handleChange = (field, value) => setTaskData(prev => ({ ...prev, [field]: value }))

  const handleClose = () => {
    setOpenTaskDialog(false)
    setEditingTask(null)
    setTaskData(initialTaskData)
    setErrorTaskData({ subject: false, dueDate: false, reminderDate: false })
    setReminderTimeError(false)
  }

  const hasInitialSpace = str => str?.[0] === ' '

  const validateReminderTime = () => {
    if (!taskData.reminderEnabled || !taskData.reminderTime || !taskData.reminderDate) return true
    const reminderDateTime = dayjs(`${taskData.reminderDate} ${taskData.reminderTime}`, 'YYYY-MM-DD HH:mm')
    const now = dayjs()
    return !(dayjs(taskData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now))
  }

  const saveTask = async () => {
    // Validation
    if (!taskData.subject || hasInitialSpace(taskData.subject)) {
      setErrorTaskData(prev => ({ ...prev, subject: true }))
      return
    }
    if (!taskData.dueDate) {
      setErrorTaskData(prev => ({ ...prev, dueDate: true }))
      return
    }
    const today = dayjs().startOf('day')
    if (dayjs(taskData.dueDate).isBefore(today)) {
      setErrorTaskData(prev => ({ ...prev, dueDate: true }))
      return
    }
    if (!validateReminderTime()) {
      setReminderTimeError(true)
      return
    }

    // Flatten all tasks
    const allTasks = []
    const activity = leadData?.values?.Activity || {}
    for (const key in activity) {
      if (activity[key]?.task) {
        allTasks.push(...activity[key].task)
      }
    }

    // Convert all due dates to dayjs objects
    const upcomingTasks = allTasks
      .map(t => dayjs(t.dueDate)) // t.dueDate can be string
      .filter(d => d.isAfter(dayjs(), 'day'))

    // Pick the earliest upcoming date
    // const nextFollowUpDate = upcomingTasks.length
    //   ? upcomingTasks.reduce((earliest, d) => (d.isBefore(earliest) ? d : earliest), upcomingTasks[0])
    //   : dayjs(taskData.dueDate)

    const nextFollowUpDate = upcomingTasks.length
      ? upcomingTasks.reduce((earliest, d) => (d.isBefore(earliest) ? d : earliest), upcomingTasks[0])
      : dayjs(taskData.dueDate)

    const payload = {
      _id: editingTask?._id,
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

    const earliest =
      new Date(nextFollowUpDate.format('YYYY-MM-DD')) < new Date(taskData.dueDate)
        ? nextFollowUpDate.format('YYYY-MM-DD')
        : taskData.dueDate
   

    try {
      setLoader(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify({
          values: {
            'Next Follow-up Date': earliest ? earliest : taskData.dueDate,
            Activity: [{ task: [payload] }]
          },
          lead_touch: 'touch'
        })
      })
      const result = await res.json()




      setLoader(false)
      if (!res.ok || !result.success) throw new Error(result.message || 'Server Error')

      const updatedTasks = result.data.values?.Activity?.[0]?.task || []

      const formattedTask = {
        type: 'Task',
        _id: payload._id || updatedTasks[updatedTasks.length - 1]?._id || '',
        subject: payload.subject,
        dueDate: payload.dueDate,
        priority: payload.priority,
        status: payload.status,
        owner: payload.owner,
        reminderEnabled: payload.reminderEnabled,
        reminderDate: payload.reminderDate,
        reminderTime: payload.reminderTime,
        alertType: payload.alertType
      }

      if (editingTask) {
        setTasks(prev => prev.map(t => (t._id === formattedTask._id ? formattedTask : t)))
        toast.success('Task Updated Successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
        
      } else {
        
        setTasks(prev => [formattedTask, ...prev])
        toast.success('Task Added Successfully!', { autoClose: 500, position: 'bottom-center', hideProgressBar: true })
      }
      fetchLeadFromId()
      handleClose()
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to save task')
      setLoader(false)
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', mx: 'auto', mt: 4 }}>
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
            onClick={() => setOpenTaskDialog(true)}
            sx={{ bgcolor: '#009cde', '&:hover': { bgcolor: '#007bb5' }, borderRadius: 2, textTransform: 'none' }}
          >
            + Create Task
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {tab === 0 ? (
          tasks.length > 0 ? (
            // <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            //   {tasks.map(task => (
            //     <Card
            //       key={task._id}
            //       sx={{ p: 2, borderRadius: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.08)', position: 'relative' }}
            //     >
            //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            //         <Typography variant='subtitle1' fontWeight={600}>
            //           {task.subject}
            //         </Typography>
            //         <Chip
            //           label={task.status}
            //           size='small'
            //           sx={{
            //             backgroundColor: statusColors[task.status]?.bg,
            //             color: statusColors[task.status]?.color,
            //             fontWeight: 600,
            //             fontSize: 12,
            //             px: 1,
            //             height: 24,
            //             '& .MuiChip-label': { px: 1 }
            //           }}
            //         />
            //         <Chip
            //           label={task.priority}
            //           size='small'
            //           sx={{
            //             backgroundColor: priorityColors[task.priority]?.bg,
            //             color: priorityColors[task.priority]?.color,
            //             fontWeight: 600,
            //             fontSize: 12,
            //             px: 1,
            //             height: 24,
            //             '& .MuiChip-label': { px: 1 }
            //           }}
            //         />
            //       </Box>

            //       <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 14, color: 'text.secondary' }}>
            //         <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
            //         <Typography variant='caption'>
            //           {dayjs(task.dueDate).format('DD MMM YYYY')} . {task.reminderTime || '—'}
            //         </Typography>
            //         <Typography variant='caption' sx={{ ml: 2 }}>
            //           Created By <b>{task.owner}</b>
            //         </Typography>
            //       </Box>

            //       <IconButton
            //         size='small'
            //         sx={{
            //           position: 'absolute',
            //           top: 8,
            //           right: 8,
            //           bgcolor: '#f5f5f5',
            //           '&:hover': { bgcolor: '#e0e0e0' }
            //         }}
            //         onClick={() => {
            //           setEditingTask(task)
            //           setTaskData(task)
            //           setOpenTaskDialog(true)
            //         }}
            //       >
            //         <EditOutlinedIcon fontSize='small' />
            //       </IconButton>
            //     </Card>
            //   ))}
            // </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
  {/* Current Tasks */}
  {currentTasks.length > 0 && (
    <Card>
      <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#1976d2', fontWeight: 600 }}>
        🟢 Today’s Tasks
      </Typography>
      {currentTasks.map(task => renderTaskCard(task))}
    </Card>
  )}

  {/* Upcoming Tasks */}
  {upcomingTasks.length > 0 && (
    <Card>
      <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#27ae60', fontWeight: 600 }}>
        🚀 Upcoming Tasks
      </Typography>
      {upcomingTasks.map(task => renderTaskCard(task))}
    </Card>
  )}

  {/* Completed / Past Tasks */}
  {completedTasks.length > 0 && (
    <Card>
      <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#c0392b', fontWeight: 600 }}>
        ✅ Completed / Past Tasks
      </Typography>
      {completedTasks.map(task => renderTaskCard(task))}
    </Card>
  )}
</Box>
          ) : (
            <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
              🚫 No tasks found
            </Typography>
          )
        ) : (
          <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
            No items found 🚫
          </Typography>
        )}

        {/* Task Dialog */}
        <Dialog
          open={openTaskDialog}
          onClose={handleClose}
          maxWidth='sm'
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
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
              <Tooltip title='Close' arrow>
                <IconButton onClick={handleClose}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3 }}>
            <Grid container spacing={3}>
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
                  error={errorTaskData.subject}
                  helperText={errorTaskData.subject ? 'Subject is required' : ''}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DatePicker
                  label={
                    <span>
                      Due Date <span style={{ color: 'red' }}>*</span>
                    </span>
                  }
                  disablePast
                  value={taskData.dueDate ? dayjs(taskData.dueDate) : null}
                  onChange={newValue => {
                    handleChange('dueDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                    setErrorTaskData(prev => ({ ...prev, dueDate: false }))
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: errorTaskData.dueDate,
                      helperText: errorTaskData.dueDate ? 'Invalid due date' : ''
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={taskData.priority} onChange={e => handleChange('priority', e.target.value)}>
                    <MenuItem value='Low'>Low</MenuItem>
                    <MenuItem value='Medium'>Medium</MenuItem>
                    <MenuItem value='High'>High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={taskData.status} onChange={e => handleChange('status', e.target.value)}>
                    <MenuItem value='Not Started'>Not Started</MenuItem>
                    <MenuItem value='Deferred'>Deferred</MenuItem>
                    <MenuItem value='In Progress'>In Progress</MenuItem>
                    <MenuItem value='Completed'>Completed</MenuItem>
                    <MenuItem value='Waiting for input'>Waiting for input</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  disabled
                  label='Created By'
                  defaultValue={user_name}
                  fullWidth
                  sx={{ bgcolor: '#fafafa', borderRadius: 2 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ border: '1px solid #eee', p: 2.5, borderRadius: 2, bgcolor: '#f9f9f9' }}>
                  <Typography fontWeight='bold' mb={2}>
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
                          disablePast
                          value={taskData.reminderDate ? dayjs(taskData.reminderDate) : null}
                          onChange={newValue => {
                            handleChange('reminderDate', newValue ? dayjs(newValue).format('YYYY-MM-DD') : '')
                            setErrorTaskData(prev => ({ ...prev, reminderDate: false }))
                          }}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: errorTaskData.reminderDate,
                              helperText: errorTaskData.reminderDate ? 'Reminder Date required' : ''
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TimePicker
                          label='Reminder Time'
                          value={
                            taskData.reminderTime ? dayjs(taskData.reminderTime, 'HH:mm') : dayjs().add(5, 'minute')
                          }
                          onChange={newValue => {
                            const time = newValue ? newValue.format('HH:mm') : ''
                            handleChange('reminderTime', time)
                            setReminderTimeError(!validateReminderTime())
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
                              helperText: reminderTimeError ? 'Cannot be in the past' : ''
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
                            <MenuItem value='Email'>Email</MenuItem>
                            <MenuItem value='Popup'>Pop-up</MenuItem>
                            <MenuItem value='Both'>Both</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #f0f0f0', mt: 2 }}>
            <Box display='flex' justifyContent='space-between' width='100%'>
              <Button
                onClick={handleClose}
                variant='outlined'
                sx={{ borderRadius: 2, textTransform: 'none', color: 'text.secondary', borderColor: '#ccc' }}
              >
                Close
              </Button>
              <Button
                variant='contained'
                disabled={loader || reminderTimeError || !taskData.subject || !taskData.dueDate}
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
