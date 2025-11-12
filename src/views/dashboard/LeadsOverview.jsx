'use client'

import { Card, Grid, Box, Typography, Skeleton } from '@mui/material'
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

export default function LeadsOverview({ cardConfig = [], loading }) {
  // 👇 When loading, render 6 skeleton cards for layout consistency
  const skeletonCount = 5
  const itemsToRender = loading ? Array.from({ length: skeletonCount }) : cardConfig

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={2.5}>
        {itemsToRender.map((item, i) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={i}>
            <StatCard>
              {loading ? (
                <>
                  {/* 🦴 Skeleton Avatar */}
                  <Skeleton
                    variant='rounded'
                    width={44}
                    height={44}
                    animation='wave'
                    sx={{ borderRadius: 2, mr: 2 }}
                  />

                  {/* 🦴 Skeleton Text */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton
                      variant='text'
                      width={80}
                      height={20}
                      animation='wave'
                      sx={{ mb: 1 }}
                    />
                    <Skeleton
                      variant='text'
                      width={60}
                      height={28}
                      animation='wave'
                    />
                  </Box>
                </>
              ) : (
                <>
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

                  {/* Right Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant='body2'
                      sx={{ color: 'text.secondary', fontWeight: 500 }}
                    >
                      {item.title}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant='h6'
                        sx={{
                          fontWeight: 700,
                          color: '#111',
                          fontSize: 24
                        }}
                      >
                        {item.count}
                      </Typography>
                    </Box>
                  </Box>
                </>
              )}
            </StatCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
