'use client'

import { Box, Typography, Chip, Stack, Paper, Button } from '@mui/material'
import dayjs from 'dayjs'

const TaskList = ({ tasks, onEdit }) => {

  console.log(tasks,"<<< Tasksss List")


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
            bgcolor: '#fff',
            position: 'relative' // 🟢 position relative venum
          }}
        >
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
            <Typography variant='h6' fontWeight='bold' color='primary' mb={1}>
              {t.subject}
            </Typography>

            {/* ✏️ Edit Button */}
            {onEdit && (
              <Button size='small' variant='outlined' onClick={() => onEdit(t)}>
                ✏️
              </Button>
            )}
          </Box>

          {/* Dates */}
          <Box display='flex' flexWrap='wrap' gap={1} mb={1}>
            <Typography variant='body2' color='text.secondary'>
              📅 Due: {t.dueDate ? dayjs(t.dueDate).format('DD MMM YYYY') : '-'}
            </Typography>
            {t.reminderDate && (
              <Typography variant='body2' color='secondary'>
                🔔 Reminder: {t.alertType}
                <Box>
                  <span>📅 {dayjs(t.reminderDate).format('DD MMM YYYY')}</span>
                  <span>⏰ {t.reminderTime && ` ${dayjs(`1970-01-01T${t.reminderTime}`).format('hh:mm A')}`}</span>
                </Box>
              </Typography>
            )}
          </Box>

          {/* Owner */}
          <Typography variant='caption' display='block' mb={1} color='text.secondary'>
            👤 {t.owner || 'Unknown'}
          </Typography>

          {/* Status + Priority Chips */}
          <Stack direction='row' spacing={1} mt={2} flexWrap='wrap'>
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
          </Stack>
        </Paper>
      ))}
    </Box>
  )
}

export default TaskList
