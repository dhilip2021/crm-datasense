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
  FormControlLabel
} from '@mui/material'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'

// Sample data
const tasks = [
  {
    type: 'Task',
    title: 'Follow up this call',
    date: '30/09/2025',
    time: null,
    owner: 'Dhilip',
    status: 'Not Started',
    priority: 'Highest'
  }
]

const meetings = [
  {
    type: 'Meeting',
    title: 'Client Meeting',
    date: '02/09/2025',
    time: '12:00 PM - 01:00 PM',
    owner: 'Dhilip'
  }
]

const calls = [
  {
    type: 'Call',
    title: 'Call scheduled with Dhilip Datasense',
    date: '02/09/2025',
    time: '12:00 PM',
    owner: 'Dhilip',
    purpose: 'Demo',
    agenda: 'Client Demo'
  }
]

// helper function for parsing date+time
function parseDateTime(date, time) {
  const [day, month, year] = date.split('/')
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

export default function OpenActivities() {
  const [addAnchor, setAddAnchor] = useState(null)
  const [viewAnchor, setViewAnchor] = useState(null)
  const [view, setView] = useState('column') // column | tab | chronological
  const [tab, setTab] = useState(0)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [reminderEnabled, setReminderEnabled] = useState(false)

  // Merge + sort activities
  const allActivities = [...tasks, ...calls, ...meetings].sort(
    (a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
  )

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
                <TextField label='Subject' fullWidth variant='outlined' sx={{ bgcolor: '#fff', borderRadius: 2 }} />

                {/* Due Date */}
                <TextField
                  label='Due Date'
                  type='date'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{ bgcolor: '#fff', borderRadius: 2 }}
                />

                {/* Priority */}
                <FormControl fullWidth sx={{ bgcolor: '#fff', borderRadius: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select defaultValue='High' label='Priority'>
                    <MuiMenuItem value='Low'>Low</MuiMenuItem>
                    <MuiMenuItem value='Medium'>Medium</MuiMenuItem>
                    <MuiMenuItem value='High'>High</MuiMenuItem>
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
                    control={<Switch checked={reminderEnabled} onChange={e => setReminderEnabled(e.target.checked)} />}
                    label='Enable Reminder'
                  />

                  {/* Show fields only if Reminder Enabled */}
                  {reminderEnabled && (
                    <>
                      {/* Date & Time Picker */}
                      <Box display='flex' gap={2} mt={2}>
                        <TextField
                          label='Date'
                          type='date'
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={{ bgcolor: '#fff', borderRadius: 2 }}
                        />
                        <TextField
                          label='Time'
                          type='time'
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={{ bgcolor: '#fff', borderRadius: 2 }}
                        />
                      </Box>

                      {/* Alert Type */}
                      <FormControl fullWidth sx={{ mt: 2, bgcolor: '#fff', borderRadius: 2 }}>
                        <InputLabel>Alert Type</InputLabel>
                        <Select defaultValue='Email' label='Alert Type'>
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
              <Button
                onClick={() => setOpenTaskDialog(false)}
                variant='outlined'
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                onClick={() => setOpenTaskDialog(false)}
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
                  <Box key={i} mb={1}>
                    <Typography color='primary'>{t.title}</Typography>
                    <Typography variant='body2'>{t.date}</Typography>
                    <Typography variant='caption'>👤 {t.owner}</Typography>
                    <Typography variant='body2'>Status : {t.status}</Typography>
                    <Typography variant='body2'>Priority : {t.priority}</Typography>
                  </Box>
                ))}
              </Card>

             

              {/* Calls */}
              <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                <Typography fontWeight='bold'>Open Calls ({calls.length})</Typography>
                <Divider sx={{ my: 1 }} />
                {calls.map((c, i) => (
                  <Box key={i} mb={1}>
                    <Typography color='primary'>{c.title}</Typography>
                    <Typography variant='body2'>
                      {c.date} {c.time}
                    </Typography>
                    <Typography variant='caption'>👤 {c.owner}</Typography>
                    <Typography variant='body2'>Call Purpose : {c.purpose}</Typography>
                    <Typography variant='body2'>Call Agenda : {c.agenda}</Typography>
                  </Box>
                ))}
              </Card>

               {/* Meetings */}
              <Card sx={{ p: 2, bgcolor: '#f9f9ff' }}>
                <Typography fontWeight='bold'>Open Meetings ({meetings.length})</Typography>
                <Divider sx={{ my: 1 }} />
                {meetings.map((m, i) => (
                  <Box key={i} mb={1}>
                    <Typography color='primary'>{m.title}</Typography>
                    <Typography variant='body2'>
                      {m.date} {m.time}
                    </Typography>
                    <Typography variant='caption'>👤 {m.owner}</Typography>
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
