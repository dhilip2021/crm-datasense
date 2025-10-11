'use client'

import React from 'react'
import { Card, CardContent, Typography, Box, Chip } from '@mui/material'

const deals = [
  { title: 'Cloud Migration Project', company: 'Cloud Migration', amount: '$85,000', days: 628 },
  { title: 'ERP System', company: 'StartupCo', amount: '$85,000', days: 628 },
  { title: 'Mobile App Development', company: 'Tech Innovations', amount: '$120,000', days: 450 },
  { title: 'Website Redesign', company: 'Creative Agency', amount: '$50,000', days: 300 },
  { title: 'AI Chatbot Implementation', company: 'TechCorp Industries', amount: '$75,000', days: 360 }
]

export default function DealAgingAnalysis() {
  return (
    <Card sx={{ borderRadius: 3, p: 2 }}>
      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
        Deal Aging Analysis
      </Typography>

      <CardContent sx={{ p: 0 }}>
        {deals.map((deal, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              pb: 1,
              borderBottom: index !== deals.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
                {deal.title}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {deal.company}
              </Typography>
              <Typography variant='body2' sx={{ fontWeight: 500, mt: 0.5 }}>
                {deal.amount}
              </Typography>
            </Box>

            <Chip
              label={`${deal.days} days`}
              variant='outlined'
              sx={{
                borderColor: '#d32f2f',
                color: '#d32f2f',
                fontWeight: 600,
                borderRadius: '8px',
                fontSize: '0.85rem',
                px: 1.5
              }}
            />
          </Box>
        ))}
      </CardContent>
    </Card>
  )
}
