'use client'

import { Card, Grid, Box, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled card (flat, minimal shadow)
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.25s ease',
  '&:hover': {
    boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
    transform: 'translateY(-3px)'
  }
}))

export default function LeadsOverview({ cardConfig = [] }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2.5}>
        {cardConfig.map((item, i) => {
          const isPositive = item.percentage >= 0
          return (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
              <StatCard>
                {/* Left Icon */}
                {/* <CustomAvatar
                  variant='rounded'
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: item.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    mr: 2
                  }}
                >
                  {item.icon}
                </CustomAvatar> */}

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
                      filter: 'brightness(0) invert(1)' // makes icon white to match color background
                    }}
                  />
                </CustomAvatar>

                {/* Right Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500 }}>
                    {item.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: '#111', fontSize: 24 }}>
                      {item.count}
                    </Typography>

                    {/* Percentage */}
                    {/* <Box
                      sx={{
                        px: 0.8,
                        py: 0.2,
                        borderRadius: 1,
                        fontSize: 12,
                        fontWeight: 600,
                        color: isPositive ? '#16a34a' : '#dc2626',
                        backgroundColor: isPositive
                          ? 'rgba(22,163,74,0.1)'
                          : 'rgba(220,38,38,0.1)'
                      }}
                    >
                      {isPositive ? '+' : ''}
                      {item.percentage}%
                    </Box> */}
                  </Box>
                </Box>
              </StatCard>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
