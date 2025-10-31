'use client'

import React, { useMemo } from 'react'

// MUI Imports
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Skeleton,
  Box
} from '@mui/material'

// Third-party Imports
import classnames from 'classnames'

// Components Imports
import OptionMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

const LeadByLocation = ({ data = [], loader }) => {
  // --- Compute grouped data by City
  const groupedData = useMemo(() => {
    if (!data?.length) return []

    // Group leads by "City" or fallback to "Unknown"
    const groups = {}
    data.forEach(lead => {
      const city = lead?.values?.City || 'Unknown'
      if (!groups[city]) groups[city] = { city, leads: 0 }
      groups[city].leads += 1
    })

    // Convert object → array
    let result = Object.values(groups)

    // Sort by leads descending
    result.sort((a, b) => b.leads - a.leads)

    // Assign avatars and random trend indicators
    const colorPalette = ['primary', 'success', 'error', 'warning', 'info', 'secondary']
    result = result.map((item, index) => {
      const trendUp = Math.random() > 0.4 // random up/down
      const trendPercentage = `${(Math.random() * 20 + 5).toFixed(1)}%`
      return {
        avatarLabel: item.city.slice(0, 2).toUpperCase(),
        avatarColor: colorPalette[index % colorPalette.length],
        title: `${item.leads} Leads`,
        subtitle: item.city,
        sales: item.leads,
        trend: trendUp ? 'up' : 'down',
        trendPercentage
      }
    })

    return result
  }, [data])

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        title='Leads by Location (Today)'
        action={
          <OptionMenu
            iconClassName='text-textPrimary'
            options={['Today', 'Last 7 Days', 'Last 30 Days', 'Last 60 Days']}
          />
        }
      />

      <CardContent className='flex flex-col gap-[0.875rem]'>
        {/* --- 1️⃣ Loader --- */}
        {loader ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Box key={i} className='flex items-center gap-4'>
              <Skeleton variant='circular' width={40} height={40} />
              <Box className='flex-1'>
                <Skeleton variant='text' width='60%' />
                <Skeleton variant='text' width='40%' />
              </Box>
            </Box>
          ))
        ) : groupedData.length === 0 ? (
          // --- 2️⃣ No Records ---
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              color: 'text.secondary'
            }}
          >
            <Typography variant='h6'>No records found</Typography>
          </Box>
        ) : (
          // --- 3️⃣ Dynamic Data View ---
          groupedData.map((item, index) => (
            <div key={index} className='flex items-center gap-4'>
              <CustomAvatar skin='light' color={item.avatarColor}>
                {item.avatarLabel}
              </CustomAvatar>
              <div className='flex items-center justify-between is-full flex-wrap gap-x-4 gap-y-2'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-1'>
                    <Typography color='text.primary' className='font-medium'>
                      {item.title}
                    </Typography>
                    <div className='flex items-center gap-1'>
                      <i
                        className={classnames(
                          item.trend === 'up'
                            ? 'ri-arrow-up-s-line text-success'
                            : 'ri-arrow-down-s-line text-error'
                        )}
                      ></i>
                      <Typography color={item.trend === 'up' ? 'success.main' : 'error.main'}>
                        {item.trendPercentage}
                      </Typography>
                    </div>
                  </div>
                  <Typography>{item.subtitle}</Typography>
                </div>
                <div className='flex flex-col gap-1'>
                  <Typography color='text.primary' className='font-medium'>
                    {item.sales}
                  </Typography>
                  <Typography variant='body2' color='text.disabled'>
                    Leads
                  </Typography>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

export default LeadByLocation
