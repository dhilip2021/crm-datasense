'use client'
import React from 'react'
import { Box, Grid, Card, Typography, Skeleton } from '@mui/material'
import { styled } from '@mui/material/styles'
import CustomAvatar from '@/@core/components/mui/Avatar'

// 🔹 Styled Card
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  transition: 'all 0.25s ease',
  '&:hover': {
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    transform: 'translateY(-3px)'
  }
}))

const OpportunityStatus = ({ opportunityData = [], loader = false }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2.5}>
        {loader
          ? // 🔹 Skeleton Loader (4 placeholders)
            Array.from({ length: 4 }).map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard>
                  <Skeleton
                    variant='rounded'
                    width={44}
                    height={44}
                    sx={{ borderRadius: 2, mr: 2 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton width='60%' height={16} sx={{ mb: 1 }} />
                    <Skeleton width='40%' height={28} />
                  </Box>
                </StatCard>
              </Grid>
            ))
          : // 🔹 Real Data Cards
            opportunityData.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard>
                  {/* Left: Icon */}
                  <CustomAvatar
                    variant='rounded'
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: item.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2
                    }}
                  >
                    <Box
                      component='img'
                      src={item.icon}
                      alt={item.title}
                      sx={{
                        width: 28,
                        height: 28,
                        filter: 'brightness(0) invert(1)'
                      }}
                    />
                  </CustomAvatar>

                  {/* Right: Text */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                      {item.title}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          color: '#111',
                          fontSize: 20
                        }}
                      >
                        {item.value}
                      </Typography>

                      {/* {item.change && (
                        <Typography
                          variant='body2'
                          sx={{
                            color: item.color,
                            fontWeight: 600,
                            backgroundColor: `${item.color}1A`,
                            px: 0.8,
                            py: 0.2,
                            borderRadius: 1,
                            fontSize: 13
                          }}
                        >
                          {item.change}
                        </Typography>
                      )} */}
                    </Box>
                  </Box>
                </StatCard>
              </Grid>
            ))}
      </Grid>
    </Box>
  )
}

export default OpportunityStatus
