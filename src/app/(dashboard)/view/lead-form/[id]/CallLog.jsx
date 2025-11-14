'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Button
} from '@mui/material'
import CallIcon from '@mui/icons-material/Call'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PersonIcon from '@mui/icons-material/Person'
import dayjs from 'dayjs'

const CallLog = ({ calls = [] }) => {

  // Sort by startTime DESC
  const sortedCalls = [...calls].sort(
    (a, b) => new Date(b.startTime) - new Date(a.startTime)
  )

  // How many items to show initially
  const [visibleCount, setVisibleCount] = useState(5)

  // Slice to show only visibleCount
  const visibleCalls = sortedCalls.slice(0, visibleCount)

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 3,
        boxShadow: '0 3px 10px rgba(0,0,0,0.08)',
        border: '1px solid #eee',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          background: '#009cde',
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '1.1rem'
        }}
      >
        📞 Call Activity Log
      </Box>

      <CardContent sx={{ p: 0 }}>
        {visibleCalls.length === 0 ? (
          <Box
            sx={{
              py: 5,
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic'
            }}
          >
            No call logs available.
          </Box>
        ) : (
          visibleCalls.map((call, index) => {
            const start = dayjs(call.startTime).format('MMM D, YYYY h:mm:ss A')
            const end = dayjs(call.endTime).format('h:mm:ss A')

            return (
              <React.Fragment key={call._id}>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.3s ease',
                    '&:hover': { bgcolor: '#f9f9f9' }
                  }}
                >
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Box
                      sx={{
                        bgcolor: '#e3f2fd',
                        p: 1.3,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CallIcon sx={{ color: '#1976d2' }} />
                    </Box>

                    <Box>
                      <Typography variant='subtitle1' fontWeight={600}>
                        {call.from} → {call.to}
                      </Typography>

                      <Typography variant='body2' color='text.secondary'>
                        {start} — {end}
                      </Typography>

                      <Stack
                        direction='row'
                        spacing={4}
                        alignItems='center'
                        mt={1}
                        sx={{ flexWrap: 'wrap' }}
                      >
                        <Stack direction='row' spacing={1} alignItems='center'>
                          <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant='body2' color='text.secondary'>
                            Duration: <strong>{call.duration}</strong>
                          </Typography>
                        </Stack>

                        <Stack direction='row' spacing={1} alignItems='center'>
                          <PersonIcon sx={{ fontSize: 16, color: '#666' }} />
                          <Typography variant='body2' color='text.secondary'>
                            Created By: <strong>{call.createdBy || 'Unknown'}</strong>
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>

                  <Chip
                    label={call.duration}
                    sx={{
                      fontWeight: 'bold',
                      borderRadius: '8px',
                      color: '#fff',
                      bgcolor:
                        call.duration >= '00:30'
                          ? 'success.main'
                          : call.duration >= '00:10'
                          ? 'warning.main'
                          : 'error.main'
                    }}
                  />
                </Box>

                <LinearProgress
                  variant='determinate'
                  value={Math.min(parseInt(call.duration.split(':')[1]) * 4, 100)}
                  sx={{
                    height: 5,
                    borderRadius: 0,
                    bgcolor: '#f3f3f3',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 0,
                      bgcolor:
                        call.duration >= '00:30'
                          ? '#4caf50'
                          : call.duration >= '00:10'
                          ? '#ff9800'
                          : '#f44336'
                    }
                  }}
                />

                {index < visibleCalls.length - 1 && <Divider />}
              </React.Fragment>
            )
          })
        )}

        {/* LOAD MORE BUTTON */}
        {visibleCount < sortedCalls.length && (
          <Box textAlign='center' py={2}>
            <Button
              variant='contained'
              onClick={() => setVisibleCount(prev => prev + 5)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold',
                px: 4
              }}
            >
              Load More
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default CallLog
