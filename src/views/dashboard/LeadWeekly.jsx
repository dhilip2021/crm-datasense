'use client'

import dynamic from 'next/dynamic'
import { useMemo } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Skeleton,
  Box
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Components Imports
import OptionsMenu from '@core/components/option-menu'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

export default function LeadWeekly({ data = [], loader }) {

  console.log(data,"<<< dataahhhh")


  const theme = useTheme()

  // --- Helper to get day name (Sun, Mon, etc.)
  const getDayName = dateStr => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { weekday: 'short' })
  }

  // --- Current day
  const todayName = new Date().toLocaleString('en-US', { weekday: 'short' })

  // --- Compute weekly lead counts
  const weeklyCounts = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = Object.fromEntries(days.map(d => [d, 0]))

    data.forEach(lead => {
      if (lead?.submittedAt) {
        const day = getDayName(lead.submittedAt)
        if (counts[day] !== undefined) counts[day] += 1
      }
    })
    return days.map(d => counts[d])
  }, [data])

  // --- Dynamic color logic (today highlighted)
  const colors = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
    day === todayName
      ? 'var(--mui-palette-primary-main)' // highlight today
      : 'var(--mui-palette-customColors-trackBg)' // grey others
  )

  // --- Chart options
  const options = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 7, distributed: true, columnWidth: '40%' }
    },
    stroke: { width: 2, colors: ['var(--mui-palette-background-paper)'] },
    legend: { show: false },
    grid: {
      xaxis: { lines: { show: false } },
      strokeDashArray: 7,
      padding: { left: -9, top: -20, bottom: 13 },
      borderColor: 'var(--mui-palette-divider)'
    },
    dataLabels: { enabled: false },
    colors,
    xaxis: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tickPlacement: 'off',
      labels: { show: true },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetY: 2,
        offsetX: -17,
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: theme.typography.body2.fontSize },
        formatter: value => `${value}`
      }
    }
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        title='Weekly Leads'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Refresh']} />}
      />
      <CardContent>
        {/* --- 1️⃣ Loader State --- */}
        {loader ? (
          <Box>
            <Skeleton variant='rectangular' height={250} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant='text' height={20} width='60%' sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant='rectangular' height={40} width='100%' sx={{ borderRadius: 1 }} />
          </Box>
        ) : data.length === 0 ? (
          // --- 2️⃣ No Records State ---
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 250
            }}
          >
            <Typography variant='h6' color='text.secondary'>
              No records found
            </Typography>
          </Box>
        ) : (
          // --- 3️⃣ Chart View ---
          <>
            <AppReactApexCharts
              type='bar'
              height={250}
              width='100%'
              series={[{ name: 'Leads', data: weeklyCounts }]}
              options={options}
            />

            <Typography variant='body2' sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
              Total Leads This Week: {data.length}
            </Typography>

            <Button fullWidth variant='contained'>
              Leads Details
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
