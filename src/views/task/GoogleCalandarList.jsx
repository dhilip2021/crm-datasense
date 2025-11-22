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
  Chip,
  Divider,
  Tooltip
} from '@mui/material'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'
import WorkIcon from '@mui/icons-material/Work'
import BusinessIcon from '@mui/icons-material/Business'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PhoneIcon from '@mui/icons-material/Phone'
import PriorityHighIcon from '@mui/icons-material/PriorityHigh'

function extractTasksFromLeads(leads) {
  const taskData = []

  leads.forEach(lead => {
    const leadId = lead.lead_id
    const company = lead.values?.Company || '-'
    const phone = lead.values?.Phone || '-'

    // Check if Activity exists
    const activities = lead.values?.Activity || []
    activities.forEach(activityObj => {
      const tasks = activityObj.task || []
      tasks.forEach(task => {
        taskData.push({
          _id: task._id,
          subject: task.subject,
          dueDate: task.dueDate,
          status: task.status || 'Unknown',
          owner: task.owner || lead.assignedTo || '-',
          Company: company,
          Phone: phone,
          priority: task.priority || '-',
          lead_id: leadId,
          reminderDate: task.reminderDate || '-',
          reminderTime: task.reminderTime || '-'
        })
      })
    })
  })

  return taskData
}

export default function GoogleCalandarList({ tasks, fetchTasks }) {

  console.log(tasks,"<<< tasks")
  console.log(fetchTasks,"<<< fetchTasks")


  const taskData = extractTasksFromLeads(tasks)

  const [open, setOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  // 🔹 Map tasks to FullCalendar events

  const events = taskData.map(task => ({
    id: task._id,
    title: task.subject || 'Untitled Task',
    start: task.dueDate,
    extendedProps: {
      status: task.status,
      owner: task.owner,
      company: task.Company,
      phone: task.Phone,
      priority: task.priority,
      lead_id: task.lead_id
    },
    backgroundColor: task.status === 'Completed' ? '#43a047' : task.status === 'In Progress' ? '#fb8c00' : '#9e9e9e',
    borderColor: task.priority === 'High' ? '#e53935' : task.priority === 'Medium' ? '#fdd835' : '#43a047',
    textColor: '#fff'
  }))



  // 🔹 Custom renderer for event content
  const renderEventContent = eventInfo => {
    const { company, status, priority } = eventInfo.event.extendedProps
    return (
      <Box
        sx={{
          whiteSpace: 'normal',
          fontSize: '0.8rem',
          lineHeight: 1.4,
          fontWeight: 500,
          p: 0.3
        }}
      >
        <Typography variant='body2' sx={{ fontWeight: 600 }}>
          {eventInfo.event.title}
        </Typography>
        <Typography variant='caption' sx={{ display: 'block', opacity: 0.9 }}>
          {company || 'No Company'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.6, mt: 0.3 }}>
          <Chip
            label={status}
            size='small'
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: status === 'Completed' ? '#388e3c' : status === 'In Progress' ? '#ffa726' : '#9e9e9e',
              color: '#fff'
            }}
          />
          <Chip
            label={priority}
            size='small'
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: priority === 'High' ? '#d32f2f' : priority === 'Medium' ? '#f9a825' : '#2e7d32',
              color: '#fff'
            }}
          />
        </Box>
      </Box>
    )
  }

  // 🔹 Fetch tasks by date range
  const fetchTasksForRange = async dateInfo => {
    const formatDate = date => {
      const d = new Date(date)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    }

    const firstDay = dateInfo.view.currentStart
    const lastDay = new Date(dateInfo.view.currentEnd)
    lastDay.setDate(lastDay.getDate() - 1)

    fetchTasks({ from: formatDate(firstDay), to: formatDate(lastDay) })
  }

  return (
    <Card
      elevation={4}
      sx={{
        width: '100%',
        p: 2,
        borderRadius: 3,
        bgcolor: '#fafafa',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
      }}
    >
      <CardContent>
        <Typography
          variant='h6'
          sx={{
            mb: 2,
            fontWeight: 700,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          📅 Task Calendar Overview
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
            eventContent={renderEventContent}
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
            aspectRatio={1.5}
            expandRows
            datesSet={dateInfo => fetchTasksForRange(dateInfo)}
          />
        </Box>
      </CardContent>

      {/* 🔹 Dialog Popup */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main' }}>📌 Task Details</DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant='subtitle1' fontWeight={700} sx={{ color: 'text.primary' }}>
                  {selectedEvent.title}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <WorkIcon fontSize='small' /> Owner
                </Typography>
                <Typography variant='body2'>{selectedEvent.owner}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BusinessIcon fontSize='small' /> Company
                </Typography>
                <Typography variant='body2'>{selectedEvent.company || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PriorityHighIcon fontSize='small' /> Priority
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
                          ? '#fbc02d'
                          : '#43a047',
                    color: '#fff'
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon fontSize='small' /> Status
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
                <Typography variant='body2' sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneIcon fontSize='small' /> Phone
                </Typography>
                <Typography variant='body2'>{selectedEvent.phone || '-'}</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant='body2' fontWeight={600}>
                  Due Date
                </Typography>
                <Typography variant='body2'>
                  {selectedEvent.date ? new Date(selectedEvent.date).toLocaleDateString() : '-'}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
          <Button onClick={() => setOpen(false)} variant='outlined' color='primary'>
            Close
          </Button>
          {selectedEvent && (
            <Link
              href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(selectedEvent.lead_id))}`}
              style={{ textDecoration: 'none' }}
            >
              <Button variant='contained' color='success'>
                Open Lead
              </Button>
            </Link>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  )
}
