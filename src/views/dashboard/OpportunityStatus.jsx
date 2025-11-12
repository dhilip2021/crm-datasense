'use client'
import React from 'react'
import { Box, Grid, Card, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

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

const OpportunityStatus = ({opportunityData}) => {
  

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2.5}>
        {opportunityData.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard>
              {/* Left: Icon */}
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
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
              </Box>

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
