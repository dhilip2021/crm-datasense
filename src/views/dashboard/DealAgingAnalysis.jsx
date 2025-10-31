'use client'

import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton
} from '@mui/material'
import Link from 'next/link'
import { encryptCryptoRes } from '@/helper/frontendHelper'

export default function DealAgingAnalysis({ deals, loader }) {

  console.log(deals,"<<< DEALDSSDSDSDS")


  const isEmpty = !deals || deals.length === 0

  return (
    <Card
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background:
          'linear-gradient(135deg, #f5f9ff 0%, #ffffff 40%, #fff9f5 100%)',
        boxShadow:
          '0 4px 20px rgba(0,0,0,0.08), inset 0 0 8px rgba(255,255,255,0.2)',
        p: 3,
        height: 430,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant='h6' sx={{ fontWeight: 600, mb: 2, flexShrink: 0 }}>
        Deal Aging Analysis
      </Typography>

      {/* ✅ Scrollable content area */}
      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: 'auto',
          pr: 1,
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '6px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: 'rgba(0,0,0,0.3)'
          }
        }}
      >
        {/* 🌀 Loader (Skeletons) */}
        {loader ? (
          Array.from(new Array(5)).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                pb: 1,
                borderBottom: '1px solid #f0f0f0'
              }}
            >
              <Box width='70%'>
                <Skeleton variant='text' width='60%' height={22} />
                <Skeleton
                  variant='text'
                  width='40%'
                  height={20}
                  sx={{ mt: 0.5 }}
                />
              </Box>
              <Skeleton variant='rounded' width={70} height={30} />
            </Box>
          ))
        ) : isEmpty ? (
          // 📉 No Records Found
          <Box textAlign='center' mt={15}>
            <Typography variant='body1' color='text.secondary' fontWeight={500}>
              📉 No records found
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              Try changing filters or date range
            </Typography>
          </Box>
        ) : (
          // ✅ Actual Data
          deals.map((deal, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
                pb: 1,
                borderBottom:
                  index !== deals.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Box>
                <Link
                  href={`/view/opportunity-form/${encodeURIComponent(
                    encryptCryptoRes(deal.link)
                  )}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 500 }}>
                    {deal.company}
                  </Typography>
                </Link>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 500, mt: 0.5, color: 'text.secondary' }}
                >
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
          ))
        )}
      </CardContent>
    </Card>
  )
}
