'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Typography,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  Grid
} from '@mui/material'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { getAllUserListApi } from '@/apiFunctions/ApiAction'
import PushPinIcon from '@mui/icons-material/PushPin'
import EventIcon from '@mui/icons-material/Event'
import NotificationsIcon from '@mui/icons-material/Notifications'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'
dayjs.extend(customParseFormat)

const IconEnum = {
  REMINDER: NotificationsIcon,
  DATE: EventIcon,
  TIME: AccessTimeIcon
}


function NormalList({loading, tasks}) {
  return (
            <>
          {/* 📋 Tasks */}
          <Grid item xs={12} md={12}>
            {loading ? (
              <Box textAlign='center' py={4}>
                <CircularProgress />
              </Box>
            ) : tasks.length === 0 ? (
              <Typography textAlign={'center'}>No tasks found 🚫</Typography>

//               <Box
//   display="flex"
//   flexDirection="column"
//   alignItems="center"
//   justifyContent="center"
//   py={8}
//   sx={{
//     backgroundColor: '#ffffff',
//     borderRadius: 3,
//     boxShadow: 1,
//     minHeight: 200
//   }}
// >
//   <Box
//     component="img"
//     src="/no-tasks.svg" // Optional: an illustration image
//     alt="No Tasks"
//     sx={{ width: 120, mb: 2 }}
//   />
//   <Typography variant="h6" color="textSecondary" gutterBottom>
//     No tasks found
//   </Typography>
//   <Typography variant="body2" color="textSecondary" textAlign="center">
//     You don’t have any tasks for the selected filters or date range.
//     <br />
//     Try changing the filters or adding a new task.
//   </Typography>
//   <Button
//     variant="contained"
//     color="primary"
//     sx={{ mt: 3 }}
//     onClick={() => console.log('Open add task modal')}
//   >
//     + Add New Task
//   </Button>
// </Box>
            ) : (
              <Grid container spacing={2}>
  {tasks.map((task, idx) => (
    <Grid item xs={12} key={idx} md={4}>
       <Link
                                  href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(task['lead_id']))}`}
                                  style={{ textDecoration: 'none' }}
                                >
                                  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {/* Task Subject */}
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 'bold', color: 'purple', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <PushPinIcon fontSize='small' /> {task.subject || 'Untitled Task'}
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
            <PersonIcon fontSize='small' /> {task.owner || loggedInUserName}
          </Typography>

          {/* 🔹 Lead Info */}
          <Typography variant='body2' sx={{ mt: 0.5 }}>
             <b>Company:</b> {task['Company'] }{" "}
          </Typography>
          <Typography variant='body2' sx={{ mt: 0.5 }}>
           
            <b>User Name:</b> {task['First Name'] }{" "}{task['Last Name']}
          </Typography> 
          <Typography variant='body2' sx={{ mt: 0.5 }}>
            <b>Phone:</b> {task['Phone'] || '-'}
          </Typography>

          {/* Status & Priority Chips */}
          <Box mt={2} display='flex' gap={1} flexWrap='wrap'>
            <Chip
              label={task.status || 'Unknown'}
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
              label={`Priority: ${task.priority || '-'}`}
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

export default NormalList
