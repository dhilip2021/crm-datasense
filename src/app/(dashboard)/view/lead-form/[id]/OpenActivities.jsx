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
  Stack
} from '@mui/material'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Cookies from 'js-cookie'

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
      let reminderDateTime = ''
      let reminderDateFormatted = ''
      let reminderTimeFormatted = ''

      if (t.reminderDate && t.reminderTime) {
        // Combine reminderDate + reminderTime into a full datetime
        const reminderDateTimeObj = new Date(`${t.reminderDate.split('T')[0]}T${t.reminderTime}:00`)
        reminderDateFormatted = reminderDateTimeObj.toLocaleDateString()
        reminderTimeFormatted = reminderDateTimeObj.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
        reminderDateTime = reminderDateTimeObj
      }

      return {
        type: 'Task',
        title: t.subject || 'Untitled Task',
        date: reminderDateFormatted, // ✅ Using reminderDate
        time: reminderTimeFormatted, // ✅ Using reminderTime
        owner: t.owner || 'Unknown',
        status: t.status || 'Not Started',
        priority: t.priority || 'Medium',
        reminderDateTime // keep raw Date object if needed
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

    const [loader, setLoader] = useState(false)

  // 🟢 Calls + Meetings (still dummy, later API integrate pannalaam)
  const meetings = []
  const calls = []

  // inside component:
  const [taskData, setTaskData] = useState({
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

  // API call
  const saveTask = async () => {
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

      if (result.success) {
        // 👉 UI display format ku convert

        // Format reminderDate + reminderTime
        let reminderDateFormatted = ''
        let reminderTimeFormatted = ''

        if (newTask.reminderDate && newTask.reminderTime) {
          const reminderDateTimeObj = new Date(`${newTask.reminderDate.split('T')[0]}T${newTask.reminderTime}:00`)
          reminderDateFormatted = reminderDateTimeObj.toLocaleDateString()
          reminderTimeFormatted = reminderDateTimeObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        }

        const formattedTask = {
          type: 'Task',
          title: newTask.subject || 'Untitled Task',
          date: reminderDateFormatted, // ✅ reminderDate use pannom
          time: reminderTimeFormatted, // ✅ reminderTime use pannom
          owner: newTask.owner || 'Unknown',
          status: newTask.status || 'Not Started',
          priority: newTask.priority || 'Medium'
        }

        // 🟢 Local state update → new task on top
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
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />} // remove stopPropagation here
        aria-controls='panel3-content'
        id='panel3-header'
      >
        <Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
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
              sx: { borderRadius: 3, p: 1, boxShadow: '0px 8px 24px rgba(0,0,0,0.15)', bgcolor: '#fdfdff' }
            }}
          >
            <DialogTitle
              sx={{
                fontWeight: 'bold',
                fontSize: '1.25rem',
                textAlign: 'center',
                borderBottom: '1px solid #eee'
              }}
            >
              ✨ Create Task
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              <Box display='flex' flexDirection='column' gap={3}>
                {/* Subject */}
                <TextField
                  label='Subject'
                  fullWidth
                  value={taskData.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                />

                {/* Due Date */}
                <TextField
                  label='Due Date'
                  type='date'
                  fullWidth
                  value={taskData.dueDate}
                  onChange={e => handleChange('dueDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                {/* Priority */}
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select value={taskData.priority} onChange={e => handleChange('priority', e.target.value)}>
                    <MuiMenuItem value='Low'>Low</MuiMenuItem>
                    <MuiMenuItem value='Medium'>Medium</MuiMenuItem>
                    <MuiMenuItem value='High'>High</MuiMenuItem>
                  </Select>
                </FormControl>

                {/* Status */}
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

                {/* Owner */}
                <TextField
                  label='Owner'
                  defaultValue='Dhilip'
                  fullWidth
                  variant='outlined'
                  sx={{ bgcolor: '#fff', borderRadius: 2 }}
                />

                {/* Reminder Section */}
                <Box sx={{ border: '1px solid #eee', p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                  <Typography fontWeight='bold' mb={2}>
                    Reminder
                  </Typography>

                  {/* Enable Reminder */}
                  <FormControlLabel
                    control={
                      <Switch
                        checked={taskData.reminderEnabled}
                        onChange={e => handleChange('reminderEnabled', e.target.checked)}
                      />
                    }
                    label='Set Reminder'
                  />

                  {/* Show fields only if Reminder Enabled */}
                  {taskData.reminderEnabled && (
                    <>
                      <TextField
                        label='Reminder Date'
                        type='date'
                        fullWidth
                        value={taskData.reminderDate}
                        onChange={e => handleChange('reminderDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />

                      <TextField
                        label='Reminder Time'
                        type='time'
                        fullWidth
                        value={taskData.reminderTime}
                        onChange={e => handleChange('reminderTime', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />

                      {/* Alert Type */}
                      <FormControl fullWidth sx={{ mt: 2, bgcolor: '#fff', borderRadius: 2 }}>
                        <InputLabel>Alert Type</InputLabel>
                        <Select
                          value={taskData.alertType || 'Email'} // default = Email
                          label='Alert Type'
                          onChange={e => handleChange('alertType', e.target.value)}
                        >
                          <MuiMenuItem value='Email'>Email</MuiMenuItem>
                          <MuiMenuItem value='Popup'>Pop-up</MuiMenuItem>
                          <MuiMenuItem value='Both'>Both</MuiMenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                </Box>

                {/* Repeat */}
                {/* <FormControlLabel control={<Switch />} label="Repeat" /> */}
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee', marginTop: '15px' }}>
              <Button onCl onClick={handleCancel} variant='outlined' sx={{ borderRadius: 2, textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={saveTask} // 🔥 call API here
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  bgcolor: '#1976d2',
                  '&:hover': { bgcolor: '#1565c0' }
                }}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
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

                {tasks.map((t, i) => (
                  <Box key={i} mb={1.5} p={1.5} border='1px solid #ddd' borderRadius={2} bgcolor='#fff'>
                    {/* Title */}
                    <Typography fontWeight='bold' color='primary'>
                      {t.title}
                    </Typography>

                    {/* Date */}
                    <Typography variant='body2' color='text.secondary'>
                      📅 {t.date} {t.time && `• ⏰ ${t.time}`}
                    </Typography>

                    {/* Owner */}
                    <Typography variant='caption' display='block'>
                      👤 {t.owner}
                    </Typography>

                    {/* Status + Priority → Chips */}
                    <Stack direction='row' spacing={1} mt={1}>
                      <Chip
                        label={t.status || 'Unknown'}
                        size='small'
                        sx={{
                          bgcolor:
                            t.status === 'Completed'
                              ? 'success.light'
                              : t.status === 'In Progress'
                                ? 'warning.light'
                                : 'grey.300'
                        }}
                      />
                      <Chip
                        label={`Priority: ${t.priority}`}
                        size='small'
                        sx={{
                          bgcolor:
                            t.priority === 'High' ? 'error.light' : t.priority === 'Low' ? 'info.light' : 'grey.200'
                        }}
                      />
                    </Stack>
                  </Box>
                ))}
              </Card>

              {/* Calls */}
              <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                <Typography fontWeight='bold'>Open Calls ({calls.length})</Typography>
                <Divider sx={{ my: 1 }} />

                {calls.map((c, i) => (
                  <Box key={i} mb={1.5} p={1.5} border='1px solid #ddd' borderRadius={2} bgcolor='#fff'>
                    {/* Title */}
                    <Typography fontWeight='bold' color='primary'>
                      {c.title}
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

                {meetings.map((m, i) => (
                  <Box key={i} mb={1.5} p={1.5} border='1px solid #ddd' borderRadius={2} bgcolor='#fff'>
                    {/* Title */}
                    <Typography fontWeight='bold' color='primary'>
                      {m.title}
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
                    {tasks.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography color='primary'>{t.title}</Typography>
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
                    {meetings.map((m, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography color='primary'>{m.title}</Typography>
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
                    {calls.map((c, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography color='primary'>{c.title}</Typography>
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
                      <Typography color='primary'>{a.title}</Typography>
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
      </AccordionDetails>
    </Accordion>
  )
}
