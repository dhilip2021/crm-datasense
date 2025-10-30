'use client'

import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material'


const SalesPipelineBarChart = ({
  data
}) => {


  const theme = useTheme()
  const formatCurrency = val => `₹${val.toLocaleString('en-IN')}`

  return (
    <Card
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e8f0ff 0%, #ffffff 40%, #fff9f0 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 0 8px rgba(255,255,255,0.2)',
        p: 3
      }}
    >
      <Box display={'flex'} justifyContent={'space-between'}>
        <Typography variant='h6' fontWeight='bold' mb={2}>
          Sales Pipeline by Stage
        </Typography>
      </Box>

      <CardContent sx={{ pt: 0 }}>
        <Box height={360}>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 60 }}>
              <defs>
                <linearGradient id='barBlue' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#1565c0' stopOpacity={0.9} />
                  <stop offset='100%' stopColor='#42a5f5' stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id='barGold' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#ffb300' stopOpacity={0.9} />
                  <stop offset='100%' stopColor='#ffe082' stopOpacity={0.8} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray='3 3' opacity={0.15} />
              <XAxis
                dataKey='stage'
                angle={-25}
                textAnchor='end'
                interval={0}
                tick={{ fontSize: 13, fill: '#424242', fontWeight: 500 }}
              />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: '#616161' }} />
              <Tooltip
                formatter={(value, name) => (name === 'value' ? [formatCurrency(value), 'Value'] : [value, 'Count'])}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}
              />
              <Bar dataKey='count' name='Count' fill='url(#barGold)' barSize={20} radius={[10, 10, 0, 0]} />
              <Bar dataKey='value' name='Deal Value (₹)' fill='url(#barBlue)' barSize={40} radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SalesPipelineBarChart
