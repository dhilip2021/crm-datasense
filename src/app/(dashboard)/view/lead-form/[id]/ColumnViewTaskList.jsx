'use client'

import { useState } from 'react'
import { Box, Typography, Chip, Stack, Paper, Button } from '@mui/material'
import dayjs from 'dayjs'

const ColumnViewTaskList = ({ tasks, onEdit }) => {
  const [visibleCount, setVisibleCount] = useState(5) // 🟢 first 5 tasks show

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5) // each click-ku 5 more add
  }

  return (
    <Box display='grid' gap={2}>
      {tasks.slice(0, visibleCount).map((t, i) => (
        <Paper
          key={t._id || i}
          elevation={3}
          sx={{
            p: 2,
            borderRadius: 3,
            transition: '0.3s',
            '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
            bgcolor: '#fff',
            position: 'relative'
          }}
        >
          <Box display='flex' justifyContent='space-between' alignItems='center' mb={1}>
            <Typography variant='h6' fontWeight='bold' color='primary' mb={1}>
              {t.subject}
            </Typography>

            {onEdit && (
              <Button size='small' variant='outlined' onClick={() => onEdit(t)}>
                ✏️
              </Button>
            )}
          </Box>

          <Box display='flex' flexWrap='wrap' gap={1} mb={1}>
            <Typography variant='body2' color='text.secondary'>
              📅 Due: {t.dueDate ? dayjs(t.dueDate).format('DD MMM YYYY') : '-'}
            </Typography>
            {t.reminderDate && (
              <Typography variant='body2' color='secondary'>
                🔔 Reminder: {t.alertType}
                <Box>
                  <span>📅 {dayjs(t.reminderDate).format('DD MMM YYYY')}</span>
                  <span>
                    ⏰{' '}
                    {t.reminderTime &&
                      `${dayjs(`1970-01-01T${t.reminderTime}`).format('hh:mm A')}`}
                  </span>
                </Box>
              </Typography>
            )}
          </Box>

          <Typography variant='caption' display='block' mb={1} color='text.secondary'>
            👤 {t.owner || 'Unknown'}
          </Typography>

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
                    : t.status === 'Deferred'
                    ? 'error.light'
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
                bgcolor:
                  t.priority === 'High'
                    ? 'error.light'
                    : t.priority === 'Low'
                    ? 'info.light'
                    : 'grey.200',
                color: 'text.primary'
              }}
            />
          </Stack>
        </Paper>
      ))}

      {/* 🟢 Load More Button */}
      {visibleCount < tasks.length && (
        <Box textAlign='center' mt={2}>
          <Button variant='contained' onClick={handleLoadMore}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default ColumnViewTaskList
