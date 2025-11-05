'use client'

import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Chip
} from '@mui/material'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'

export default function GoogleCalandarList({ tasks, fetchTasks }) {

  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // 🔹 Map tasks to FullCalendar events
  const events = tasks.map(task => ({
    id: task._id,
    title: `${task.subject} • ${task.Company || 'No Company'}`,
    start: task.dueDate,
    extendedProps: {
      status: task.status,
      owner: task.owner,
      company: task.Company,
      phone: task.Phone,
      priority: task.priority,
      lead_id: task.lead_id
    },
    color: task.priority === 'High' ? '#e53935' : task.priority === 'Medium' ? '#fb8c00' : '#43a047'
  }))

  // 🔹 Custom renderer so text won’t cut off
  const renderEventContent = eventInfo => {
    const { company, status, priority } = eventInfo.event.extendedProps
    return (
      <div
        style={{
          whiteSpace: 'normal',
          fontSize: '0.8rem',
          lineHeight: 1.3,
          fontWeight: 500
        }}
      >
        <div style={{ fontWeight: 600 }}>{eventInfo.event.title}</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
          {status} • {priority}
        </div>
      </div>
    )
  }

  // 🔹 API call function when date range changes
  // 🔹 API call function when date range changes
  const fetchTasksForRange = async dateInfo => {
    const formatDate = date => {
      const d = new Date(date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // ✅ Correct month range from FullCalendar view
    const firstDay = dateInfo.view.currentStart // always 1st of visible month
    const lastDay = dateInfo.view.currentEnd // always last of visible month + 1 day

    // ⚠️ currentEnd points to next month's 1st date, so adjust back one day
    const adjustedLastDay = new Date(lastDay)
    adjustedLastDay.setDate(adjustedLastDay.getDate() - 1)
    const startDate = formatDate(firstDay)
    const endDate = formatDate(adjustedLastDay)
    fetchTasks({ from: startDate, to: endDate })
  }

  return (
    <Card
      elevation={3}
      sx={{
        width: '100%',
        p: 2,
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}
    >
      <CardContent>
        <Typography variant='h6' sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          📅 Task Calendar
        </Typography>

        <Box sx={{ width: '100%', overflow: 'hidden' }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView='dayGridMonth'
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            }}
            events={events}
            eventContent={renderEventContent} // ✅ Fix text cutoff
            eventClick={info => {
              setSelectedEvent({
                title: info.event.title,
                ...info.event.extendedProps,
                date: info.event.start
              })
              setOpen(true)
            }}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            }}
            height='calc(100vh - 260px)'
            contentHeight='auto'
            aspectRatio={1.5}
            expandRows={true}
            datesSet={dateInfo => fetchTasksForRange(dateInfo)} // ✅ FIX
          />
        </Box>
      </CardContent>

      {/* 🔹 Popup Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>📌 Task Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                  {selectedEvent.title}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Owner:
                </Typography>
                <Typography variant='body2'>{selectedEvent.owner}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Status:
                </Typography>
                <Chip
                  label={selectedEvent.status}
                  size='small'
                  color={
                    selectedEvent.status === 'Completed'
                      ? 'success'
                      : selectedEvent.status === 'In Progress'
                        ? 'warning'
                        : 'default'
                  }
                  sx={{ mt: 0.5 }}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Priority:
                </Typography>
                <Chip
                  label={selectedEvent.priority}
                  size='small'
                  sx={{
                    mt: 0.5,
                    bgcolor:
                      selectedEvent.priority === 'High'
                        ? '#e53935'
                        : selectedEvent.priority === 'Medium'
                          ? '#fb8c00'
                          : '#43a047',
                    color: '#fff'
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Company:
                </Typography>
                <Typography variant='body2'>{selectedEvent.company || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Phone:
                </Typography>
                <Typography variant='body2'>{selectedEvent.phone || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Due Date:
                </Typography>
                <Typography variant='body2'>
                  {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Box display='flex' justifyContent='space-between' width='100%' mt={5}>
            <Button onClick={() => setOpen(false)} variant='contained' color='primary'>
              Close
            </Button>

            {selectedEvent && (
              <Link
                href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(selectedEvent.lead_id))}`}
                style={{ textDecoration: 'none' }}
              >
                <Button onClick={() => setOpen(false)} variant='contained' color='success'>
                  Open
                </Button>
              </Link>
            )}
          </Box>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
