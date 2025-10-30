'use client'
import React from 'react'
import { Card, Typography, Box, Avatar, Skeleton } from '@mui/material'

export default function TopAccountsCard({ data, loader }) {
  const isEmpty =
    !data ||
    data.length === 0 ||
    data.every(item => (!item.value || item.value === 0) && (!item.count || item.count === 0))

  return (
    <Card
      sx={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e8f0ff 0%, #ffffff 40%, #fff9f0 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08), inset 0 0 8px rgba(255,255,255,0.2)',
        p: 3,
        height: 430
      }}
    >
      <Box display='flex' justifyContent='space-between'>
        <Typography variant='h6' fontWeight='bold' mb={2}>
          Top Accounts by Value
        </Typography>
      </Box>

      <Box display='flex' flexDirection='column' gap={1.5}>
        {/* ⏳ LOADING STATE */}
        {loader ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              sx={{
                py: 0.8,
                borderBottom: index !== 5 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Box display='flex' alignItems='center' gap={1.5}>
                <Skeleton variant='circular' width={28} height={28} />
                <Skeleton variant='text' width={120} height={20} />
              </Box>
              <Skeleton variant='text' width={60} height={20} />
            </Box>
          ))
        ) : isEmpty ? (
          // 📉 EMPTY STATE
          <Box height={360} display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
            <Typography variant='body1' color='text.secondary' fontWeight={500}>
              📉 No records found
            </Typography>
            <Typography variant='caption' color='text.disabled'>
              Try changing filters or date range
            </Typography>
          </Box>
        ) : (
          // ✅ DATA STATE
          data.map((account, index) => (
            <Box
              key={account.id}
              display='flex'
              alignItems='center'
              justifyContent='space-between'
              sx={{
                py: 0.8,
                borderBottom: index !== data.length - 1 ? '1px solid #f0f0f0' : 'none'
              }}
            >
              <Box display='flex' alignItems='center' gap={1.5}>
                <Avatar
                  sx={{
                    bgcolor: '#e0e0e0',
                    color: '#333',
                    fontSize: 16,
                    width: 28,
                    height: 28
                  }}
                >
                  {account.id?.toString()?.slice(0, 2)?.toUpperCase() || 'A'}
                </Avatar>
                <Typography variant='body2' color='text.primary'>
                  {account.name}
                </Typography>
              </Box>
              <Typography variant='body2' sx={{ fontWeight: 500, color: 'text.primary' }}>
                {account.value?.toLocaleString('en-IN')}
              </Typography>
            </Box>
          ))
        )}
      </Box>
    </Card>
  )
}
