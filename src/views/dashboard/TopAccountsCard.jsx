'use client'
import React from 'react'
import { Card, Typography, Box, Avatar, Divider } from '@mui/material'

const topAccounts = [
  { id: 1, name: 'Finance Corp', value: '₹3,30,000' },
  { id: 2, name: 'TechCorp Industries', value: '₹3,30,000' },
  { id: 3, name: 'Global Manufacturing', value: '₹3,30,000' },
  { id: 4, name: 'StartupCo', value: '₹3,30,000' },
  { id: 5, name: 'Retail Solutions Ltd', value: '₹3,30,000' }
]

export default function TopAccountsCard() {
  return (
     <Card sx={{ p: 3 }}>
      {/* <Typography variant='subtitle1' fontWeight={600} gutterBottom>
        Top Accounts by Value
      </Typography> */}
       <Typography variant='h6' fontWeight={600} mb={2}>
              Top Accounts by Value
            </Typography>

      <Box display='flex' flexDirection='column' gap={1.5}>
        {topAccounts.map((account, index) => (
          <Box
            key={account.id}
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            sx={{
              py: 0.8,
              borderBottom:
                index !== topAccounts.length - 1 ? '1px solid #f0f0f0' : 'none'
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
                {account.id}
              </Avatar>
              <Typography variant='body2' color='text.primary'>
                {account.name}
              </Typography>
            </Box>
            <Typography
              variant='body2'
              sx={{ fontWeight: 500, color: 'text.primary' }}
            >
              {account.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
