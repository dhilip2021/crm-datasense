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

export default function GoogleCalandarList({ tasks }) {
  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // 🔹 Map tasks to FullCalendar events
  const events = tasks.map(task => ({
    id: task._id,
    title: `${task.subject} (${task.priority})`,
    start: task.dueDate,
    extendedProps: {
      status: task.status,
      owner: task.owner,
      company: task.Company,
      phone: task.Phone,
      priority: task.priority
    },
    color:
      task.priority === 'High'
        ? '#e53935'
        : task.priority === 'Medium'
        ? '#fb8c00'
        : '#43a047'
  }))

  // 🔹 Custom renderer so text won’t cut off
  const renderEventContent = eventInfo => (
    <div
      style={{
        whiteSpace: 'normal',
        fontSize: '0.8rem',
        lineHeight: 1.2,
        fontWeight: 500
      }}
    >
      <span>{eventInfo.event.title}</span>
    </div>
  )

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
        <Typography
          variant='h6'
          sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}
        >
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
          />
        </Box>
      </CardContent>

      {/* 🔹 Popup Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: 'primary.main' }}>
          📌 Task Details
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography
                  variant='subtitle1'
                  fontWeight={600}
                  gutterBottom
                  sx={{ color: 'text.primary' }}
                >
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
                <Typography variant='body2'>
                  {selectedEvent.company || '-'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Phone:
                </Typography>
                <Typography variant='body2'>
                  {selectedEvent.phone || '-'}
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={500}>
                  Due Date:
                </Typography>
                <Typography variant='body2'>
                  {selectedEvent.date
                    ? new Date(selectedEvent.date).toLocaleDateString()
                    : '-'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            variant='contained'
            color='primary'
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
