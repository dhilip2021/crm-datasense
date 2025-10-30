'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, Typography, Box } from '@mui/material'

const StageBarChart = ({ funnelData }) => {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: '16px',
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
        background: 'linear-gradient(to bottom right, #f9fafb, #ffffff)'
      }}
    >
      <CardContent>
        <Typography
          variant='h6'
          fontWeight='bold'
          mb={2}
          sx={{ color: '#1a237e' }}
        >
          🎯 Sales Pipeline by Stage
        </Typography>

        <Box height={350}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={funnelData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray='3 3' opacity={0.2} />
              <XAxis
                dataKey='stage'
                angle={-30}
                textAnchor='end'
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tickFormatter={(val) => `₹${val.toLocaleString('en-IN')}`} />
              <Tooltip
                formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                labelStyle={{ color: '#1976d2' }}
              />
              <Legend />
              <Bar dataKey='value' name='Value (₹)' fill='#1976d2' radius={[8, 8, 0, 0]} />
              <Bar dataKey='count' name='Count' fill='#ffb300' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StageBarChart
