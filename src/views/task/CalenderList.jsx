'use client'

import React from 'react'
import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'
import Link from 'next/link'
import PushPinIcon from '@mui/icons-material/PushPin'
import EventIcon from '@mui/icons-material/Event'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import { encryptCryptoRes } from '@/helper/frontendHelper'

const IconEnum = {
  REMINDER: NotificationsIcon,
  DATE: EventIcon,
  TIME: AccessTimeIcon
}

function CalenderList({ loading, tasks, selectedDate, setSelectedDate, fetchTasks, loggedInUserName }) {

  // ✅ Prepare tasks with activity subject
  const preparedTasks = tasks
    .map(task => {
      const values = task.values || {}
      const activityTask = values?.Activity?.[0]?.task?.[0]

      if (!activityTask || !activityTask.subject) return null

      return {
        _id: task._id,
        lead_id: task.lead_id,
        subject: activityTask.subject,
        dueDate: activityTask.dueDate,
        reminderDate: activityTask.reminderDate,
        reminderTime: activityTask.reminderTime,
        owner: activityTask.owner || values['Assigned To'] || loggedInUserName,
        Company: values.Company || '-',
        firstName: values['First Name'] || '-',
        lastName: values['Last Name'] || '-',
        Phone: values.Phone || '-',
        status: activityTask.status || 'Unknown',
        priority: activityTask.priority || '-'
      }
    })
    .filter(Boolean) // remove nulls

  return (
    <>
      {/* 📅 Calendar */}
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
          <DateCalendar
            value={selectedDate}
            onChange={newDate => {
              setSelectedDate(newDate)
              fetchTasks({ from: newDate, to: newDate })
            }}
          />
        </Card>
      </Grid>

      {/* 📋 Tasks */}
      <Grid item xs={12} md={8}>
        {loading ? (
          <Box textAlign='center' py={4}>
            <CircularProgress />
          </Box>
        ) : preparedTasks.length === 0 ? (
          <Typography textAlign={'center'}>No tasks found 🚫</Typography>
        ) : (
          <Grid container spacing={2}>
            {preparedTasks.map((task, idx) => (
              <Grid item xs={12} key={idx} md={4}>
                <Link
                  href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(task.lead_id))}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
                      {/* Task Subject */}
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 'bold', color: 'purple', display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <PushPinIcon fontSize='small' /> {task.subject}
                      </Typography>

                      {/* Due Date */}
                      <Typography variant='body2' sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon fontSize='small' /> <b>Due Date:</b> {task.dueDate ? dayjs(task.dueDate).format('DD MMM YYYY') : '-'}
                      </Typography>

                      {/* Reminder Date */}
                      {task.reminderDate && task.reminderTime && (
                        <Typography variant='body2' sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                          {React.createElement(IconEnum.REMINDER, { fontSize: 'small' })}
                          <b>Reminder:</b>
                          {React.createElement(IconEnum.DATE, { fontSize: 'small' })}
                          {dayjs(task.reminderDate).format('DD MMM YYYY')}
                          {React.createElement(IconEnum.TIME, { fontSize: 'small' })}
                          {dayjs(task.reminderTime, 'HH:mm').format('hh:mm A')}
                        </Typography>
                      )}

                      {/* Owner */}
                      <Typography variant='body2' sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PersonIcon fontSize='small' /> {task.owner}
                      </Typography>

                      {/* Lead Info */}
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        <b>Company:</b> {task.Company}
                      </Typography>
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        <b>User Name:</b> {task.firstName} {task.lastName}
                      </Typography>
                      <Typography variant='body2' sx={{ mt: 0.5 }}>
                        <b>Phone:</b> {task.Phone}
                      </Typography>

                      {/* Status & Priority */}
                      <Box mt={2} display='flex' gap={1} flexWrap='wrap'>
                        <Chip
                          label={task.status}
                          sx={{
                            backgroundColor:
                              task.status === 'Completed'
                                ? '#4caf50'
                                : task.status === 'In Progress'
                                ? '#ff9800'
                                : task.status === 'Deferred'
                                ? '#9e9e9e'
                                : '#03a9f4',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip
                          label={`Priority: ${task.priority}`}
                          sx={{
                            backgroundColor:
                              task.priority === 'High'
                                ? '#f44336'
                                : task.priority === 'Medium'
                                ? '#ff9800'
                                : '#4caf50',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            ))}
          </Grid>
        )}
      </Grid>
    </>
  )
}

export default CalenderList
