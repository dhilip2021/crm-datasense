'use client'

import { Box, Typography, Chip, Stack, Paper } from '@mui/material'
import dayjs from 'dayjs'

const TaskList = ({ tasks }) => {
  return (
    <Box display='grid' gap={2}>
      {tasks.map((t, i) => (
        <Paper
          key={i}
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            transition: '0.3s',
            '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
            bgcolor: '#fff'
          }}
        >
          {/* Title */}
          <Typography variant='h6' fontWeight='bold' color='primary' mb={1}>
            {t.subject}
          </Typography>

          {/* Dates */}
          <Box display='flex' flexWrap='wrap' gap={1} mb={1}>
            <Typography variant='body2' color='text.secondary'>
              📅 Due: {t.dueDate ? dayjs(t.dueDate).format('DD MMM YYYY') : '-'}
            </Typography>
            {t.reminderDate && (
              <Typography variant='body2' color='secondary'>
                🔔 Reminder:
                <Box>
                  <span>📅 {dayjs(t.reminderDate).format('DD MMM YYYY')}</span>
                  <span> ⏰ {t.reminderTime && ` ${dayjs(`1970-01-01T${t.reminderTime}`).format('hh:mm A')}`}</span>
                </Box>
              </Typography>
            )}
          </Box>

          {/* Owner */}
          <Typography variant='caption' display='block' mb={1} color='text.secondary'>
            👤 {t.owner || 'Unknown'}
          </Typography>

          {/* Status + Priority Chips */}
          <Stack direction='row' spacing={1}  mt={4} flexWrap='wrap'>
            <Box gap={4}>
            <Box >
                 <Chip
              label={t.status || 'Unknown'}
              size='small'
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                bgcolor:
                  t.status === 'Completed'
                    ? 'success.light'
                    : t.status === 'In Progress'
                      ? 'warning.light'
                      : 'grey.300',
                color: 'text.primary'
              }}
            />
            </Box>
            <Box>
                <Chip
              label={`Priority: ${t.priority || 'Medium'}`}
              size='small'
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                bgcolor: t.priority === 'High' ? 'error.light' : t.priority === 'Low' ? 'info.light' : 'grey.200',
                color: 'text.primary'
              }}
            />
            </Box>
            </Box>
            
           
          
          </Stack>
        </Paper>
      ))}
    </Box>
  )
}

export default TaskList
