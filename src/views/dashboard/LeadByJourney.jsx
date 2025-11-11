'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Cell
} from 'recharts'
import {
  Card,
  CardContent,
  Typography,
  useTheme,
  Box,
  Skeleton,
  Stack
} from '@mui/material'

const LeadJourneyStagesChart = ({ uniqueSources, dataFilter, loading }) => {
  const theme = useTheme()

  // Count leads by status dynamically
  const data = uniqueSources.map(source => {
    const count = dataFilter.filter(
      lead => lead?.values?.['Lead Status'] === source
    ).length

    return {
      name: source,
      value: count
    }
  })

  // Sort descending order for better visual
  const sortedData = [...data].sort((a, b) => b.value - a.value)

  // Add opacity fade for last bars
  const styledData = sortedData.map((d, i) => ({
    ...d,
    opacity: i < 4 ? 1 : i === 4 ? 0.8 : i === 5 ? 0.6 : 0.4
  }))

  return (
    <Card
      sx={{
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        backgroundColor: '#fff',
        p: 0
      }}
    >
      <CardContent sx={{ pb: 0 }}>
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            mb: 3,
            color: '#111',
            letterSpacing: 0.6
          }}
        >
          Lead Journey Stages
        </Typography>

        {/* 🔥 Skeleton Loader when loading is true */}
        {loading ? (
          <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            {[...Array(6)].map((_, i) => (
              <Stack key={i} direction='row' alignItems='center' spacing={2}>
                <Skeleton variant='text' width={100} height={24} />
                <Skeleton
                  variant='rectangular'
                  height={28}
                  width={`${70 - i * 10}%`}
                  sx={{ borderRadius: '8px' }}
                />
              </Stack>
            ))}
          </Box>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart
              layout='vertical'
              data={styledData}
              margin={{ top: 10, right: 30, left: 110, bottom: 10 }}
              barSize={32}
              barCategoryGap={15}
              barGap={8}
            >
              <defs>
                <linearGradient id='barGradient' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#03A9F4' />
                  <stop offset='100%' stopColor='#0288D1' />
                </linearGradient>
              </defs>

              <XAxis type='number' hide />

              <YAxis
                dataKey='name'
                type='category'
                axisLine={false}
                tickLine={false}
                width={100}
                tick={({ x, y, payload }) => (
                  <text
                    x={x - 15}
                    y={y}
                    textAnchor='end'
                    dominantBaseline='middle'
                    fill='#444'
                    fontSize={14}
                    fontWeight={500}
                  >
                    {payload.value}
                  </text>
                )}
              />

              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                contentStyle={{
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />

              <Bar dataKey='value' radius={[10, 10, 10, 10]}>
  {styledData.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill='url(#barGradient)'
      opacity={entry.opacity}
    />
  ))}

  {/* ✅ Custom Label that always renders on top */}
  <LabelList
    dataKey='value'
    content={({ x, y, width, height, value }) => (
      <text
        x={x + width / 2}
        y={y + height / 2}
        textAnchor='middle'
        dominantBaseline='middle'
        fill='#fff'
        fontSize={14}
        fontWeight={700}
        style={{ pointerEvents: 'none' }}
      >
        {value}
      </text>
    )}
  />
</Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default LeadJourneyStagesChart
