'use client'
import React from 'react'
import { FunnelChart, Funnel, Tooltip, LabelList, ResponsiveContainer } from 'recharts'
import { Card, Typography, Box } from '@mui/material'

// 💡 Sample Data (replace with your API response)
const data = [
  { stage: 'Prospecting', value: 20000, count: 1, fill: '#0288d1' },
  { stage: 'Qualification', value: 18000, count: 1, fill: '#80deea' },
  { stage: 'Proposal', value: 16000, count: 1, fill: '#ef9a9a' },
  { stage: 'Negotiation', value: 14000, count: 1, fill: '#ffb300' },
  { stage: 'Won', value: 12000, count: 1, fill: '#43a047' },
  { stage: 'Lost', value: 10000, count: 10, fill: '#ba68c8' },
  
]

// 💰 Format to INR currency
const formatCurrency = value =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)

export default function SalesFunnelChart() {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant='h6' fontWeight={600} mb={2}>
        Sales Funnel
      </Typography>
      <Box width='100%' height={300}>
        <ResponsiveContainer>
          <FunnelChart>
            <Tooltip
              content={({ payload }) => {
                if (payload && payload.length) {
                  const item = payload[0].payload
                  return (
                    <Box
                      sx={{
                        bgcolor: '#fff',
                        p: 1.5,
                        borderRadius: 1,
                        boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                        minWidth: 140
                      }}
                    >
                      <Typography fontWeight={600}>{item.stage}</Typography>
                      <Typography variant='body2'>
                        Value:{' '}
                        <span style={{ color: 'green', fontWeight: 600 }}>{formatCurrency(item.value)}</span>
                      </Typography>
                    </Box>
                  )
                }
                return null
              }}
            />
            <Funnel dataKey='value' data={data} isAnimationActive gap={2}>
              <LabelList
                position="right"
                fill="#000"
                stroke="none"
                dataKey='stage'
                // formatter={(entry) => `${entry.stage} : ${entry.count}`}
                 formatter={(value, entry) =>
                  entry ? `${entry.stage} : ${entry.count}` : ``
                }
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  )
}
