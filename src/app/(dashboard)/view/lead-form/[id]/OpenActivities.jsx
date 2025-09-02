'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
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

  // Merge + sort activities
  const allActivities = [...tasks, ...meetings, ...calls].sort(
    (a, b) => parseDateTime(a.date, a.time) - parseDateTime(b.date, b.time)
  )

  return (
    <Accordion defaultExpanded>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon />} // remove stopPropagation here
    aria-controls="panel3-content"
    id="panel3-header"
  >
    <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
      <Typography variant="h6" fontWeight="bold">
        Open Activities
      </Typography>

      {/* Add New */}
<Button
  variant="contained"
  size="small"
  sx={{ marginRight: "20px" }}
  onClick={e => {
    e.stopPropagation() // ✅ stop accordion toggle
    setAddAnchor(e.currentTarget)
  }}
>
  + Add New
</Button>

<Menu
  anchorEl={addAnchor}
  open={Boolean(addAnchor)}
  onClose={() => setAddAnchor(null)} // ✅ FIXED (no event.currentTarget here)
>
  <MenuItem
    onClick={() => {
      alert("Add new Task")
      setAddAnchor(null)
    }}
  >
    Task
  </MenuItem>
  <MenuItem
    onClick={() => {
      alert("Add new Meeting")
      setAddAnchor(null)
    }}
  >
    Meeting
  </MenuItem>
  <MenuItem
    onClick={() => {
      alert("Add new Call")
      setAddAnchor(null)
    }}
  >
    Call
  </MenuItem>
</Menu>
    </Box>
  </AccordionSummary>

      <AccordionDetails>
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
