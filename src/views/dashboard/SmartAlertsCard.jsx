'use client'

import React from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Stack
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const SmartAlertsCard = () => {
  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 3,
        p: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      <CardContent>
        {/* Header */}
        <Typography
          variant='h6'
          sx={{
            fontWeight: 700,
            color: '#111827',
            mb: 2
          }}
        >
          Smart Alerts
        </Typography>

        {/* Alert Boxes */}
        <Stack spacing={1.5}>
          {/* > 60 Days */}
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid #fca5a5',
              backgroundColor: '#fee2e2',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#b91c1c' }}>
                <HourglassBottomIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                Deals &gt; 60 days
              </Typography>
              <Typography variant='body2' sx={{ color: '#b91c1c' }}>
                Require immediate attention
              </Typography>
            </Box>
            <Typography variant='h5' sx={{ color: '#b91c1c', fontWeight: 700 }}>
              5
            </Typography>
          </Box>

          {/* 30–60 Days */}
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid #fcd34d',
              backgroundColor: '#fef9c3',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#b45309' }}>
                <AccessTimeIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                Deals 30–60 days
              </Typography>
              <Typography variant='body2' sx={{ color: '#b45309' }}>
                Monitor closely
              </Typography>
            </Box>
            <Typography variant='h5' sx={{ color: '#b45309', fontWeight: 700 }}>
              12
            </Typography>
          </Box>

          {/* < 30 Days */}
          <Box
            sx={{
              borderRadius: 2,
              border: '1px solid #86efac',
              backgroundColor: '#dcfce7',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, color: '#15803d' }}>
                <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5, verticalAlign: 'middle' }} />
                Deals &lt; 30 days
              </Typography>
              <Typography variant='body2' sx={{ color: '#15803d' }}>
                On track
              </Typography>
            </Box>
            <Typography variant='h5' sx={{ color: '#15803d', fontWeight: 700 }}>
              30
            </Typography>
          </Box>
        </Stack>

        {/* Divider */}
        <Divider sx={{ my: 3 }} />

        {/* Top Win/Loss Reasons */}
        <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
          Top Win/Loss Reasons
        </Typography>

        <Stack spacing={1}>
          <ReasonItem label='Budget constraints' value='32%' color='red' />
          <ReasonItem label='Feature fit' value='28%' color='green' />
          <ReasonItem label='Competitor pricing' value='24%' color='red' />
          <ReasonItem label='Timeline match' value='16%' color='green' />
        </Stack>
      </CardContent>
    </Card>
  )
}

const ReasonItem = ({ label, value, color }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      color: '#374151'
    }}
  >
    <Typography variant='body2'>{label}</Typography>
    <Typography
      variant='body2'
      sx={{ fontWeight: 600, color: color === 'red' ? '#dc2626' : '#16a34a' }}
    >
      {value}
    </Typography>
  </Box>
)

export default SmartAlertsCard
