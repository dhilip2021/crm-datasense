'use client'

import { Box, Typography, Chip, Stack } from '@mui/material'
import dayjs from 'dayjs'

const TaskList = ({ tasks }) => {
    console.log(tasks,"<<< TASKSSS")
  return (
    <Box display='grid' gap={2}>
      {tasks.map((t, i) => (
        <Box
          key={i}
          mb={1.5}
          p={1.5}
          border='1px solid #ddd'
          borderRadius={2}
          bgcolor='#fff'
        >
          {/* Title */}
          <Typography fontWeight='bold' color='primary'>
            {t.title}
          </Typography>

          {/* Due Date */}
          <Typography variant='body2' color='text.secondary' mb={0.5}>
            📅 Due Date: {t.date} {t.time && `• ⏰ ${t.time}`}
          </Typography>

          {/* Reminder DateTime */}
          {t.reminderDateTime && (
            <Typography variant='body2' color='secondary' mb={0.5}>
              🔔 Reminder: 📅 { dayjs(t.reminderDateTime).format('DD MMM YYYY')}
            </Typography>
          )}

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
                  t.priority === 'High'
                    ? 'error.light'
                    : t.priority === 'Low'
                    ? 'info.light'
                    : 'grey.200'
              }}
            />
          </Stack>
        </Box>
      ))}
    </Box>
  )
}

export default TaskList
