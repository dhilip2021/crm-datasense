'use client'

import { useState, useMemo, useEffect } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Skeleton,
  useTheme,
  Fade,
  TextField,
  Dialog,
  IconButton
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import CustomAvatar from '@core/components/mui/Avatar'
import Cookies from 'js-cookie'
import CloseIcon from '@mui/icons-material/Close'
import { encryptCryptoRes } from '@/helper/frontendHelper'
import Link from 'next/link'

// 🔹 Stat Card Style
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(145deg, #ffffff, #f9f9f9)',
  boxShadow: '0px 4px 10px rgba(0,0,0,0.06)',
  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
  }
}))

const StatSkeleton = () => (
  <StatCard>
    <CardContent className='flex items-center gap-4'>
      <Skeleton variant='circular' width={40} height={40} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton width='80%' height={20} />
        <Skeleton width='40%' height={25} />
      </Box>
    </CardContent>
  </StatCard>
)

export default function LeadStatus({
  uniqueSources,
  uniqueCities,
  uniqueTimelines,
  filters,
  setFilters,
  handleOpenStatus,
  handleCloseStatus,
  leadsForStatus,
  viewType,
  setViewType,
  loading,
  cardConfig,
  openStatus,
  selectedStatus
}) {

  console.log(leadsForStatus,"<<< leadsForStatus")


  const theme = useTheme()
  return (
    <>
      {/* FILTER BAR */}
      <Card sx={{ borderRadius: 3, mb: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <CardContent>
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 2, color: theme.palette.primary.main }}>
            🎯 Filter Leads
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={2.4}>
              <TextField
                select
                fullWidth
                size='small'
                label='Source'
                value={filters.source}
                onChange={e => setFilters(prev => ({ ...prev, source: e.target.value }))}
              >
                <MenuItem value=''>All</MenuItem>
                {uniqueSources.map(s => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl size='small' fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={filters.city}
                  onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  label='City'
                >
                  <MenuItem value=''>All</MenuItem>
                  {uniqueCities.map(c => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl size='small' fullWidth>
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={filters.timeline}
                  onChange={e => setFilters(prev => ({ ...prev, timeline: e.target.value }))}
                  label='Timeline'
                >
                  <MenuItem value=''>All</MenuItem>
                  {uniqueTimelines.map(t => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label='Next Follow-up'
                  value={filters.nextFollowup}
                  onChange={d => setFilters({ ...filters, nextFollowup: d })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl fullWidth size='small'>
                <InputLabel id='view-type-label'>Date Range</InputLabel>
                <Select labelId='view-type-label' value={viewType} onChange={e => setViewType(e.target.value)}>
                  {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months'].map(l => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* STAT CARDS */}
      <Grid container spacing={2}>
        {loading
          ? [...Array(11)].map((_, i) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                <StatSkeleton />
              </Grid>
            ))
          : cardConfig.map((item, i) => (
              <Fade in timeout={400 + i * 50} key={i}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <StatCard
                    onClick={() =>
                      handleOpenStatus(item.title.includes(' Leads') ? item.title.replace(' Leads', '') : item.title)
                    }
                    sx={{ cursor: 'pointer' }}
                  >
                    <CardContent className='flex items-center gap-2'>
                      <CustomAvatar
                        variant='rounded'
                        color={item.color}
                        className='shadow-md'
                        sx={{
                          width: 44,
                          height: 44,
                          fontSize: 18,
                          background: theme.palette[item.color].main,
                          color: '#fff'
                        }}
                      >
                        {/* <i className={item.icon}></i> */}
                        {item.icon}
                      </CustomAvatar>
                      <Box>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                          {item.title}
                        </Typography>
                        <Typography variant='h6' sx={{ fontWeight: 700, color: theme.palette[item.color].main }}>
                          {item.count}
                        </Typography>
                      </Box>
                    </CardContent>
                  </StatCard>
                </Grid>
              </Fade>
            ))}
      </Grid>

      <Dialog open={openStatus} onClose={handleCloseStatus} maxWidth='sm' fullWidth>
        <Box sx={{ p: 3, position: 'relative' }}>
          {/* Close Icon */}
          <IconButton onClick={handleCloseStatus} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <CloseIcon />
          </IconButton>

          <Typography variant='h6' sx={{ mb: 3, fontWeight: 600 }}>
            {selectedStatus} Leads ({leadsForStatus.length})
          </Typography>

          {leadsForStatus.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>No leads found.</Typography>
          ) : (
            <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
              {leadsForStatus.map((lead, index) => (
                <Link
                  href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(lead.lead_id))}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    key={index}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid #eee',
                      p: 2,
                      mb: 1,
                      transition: '0.3s',
                      '&:hover': {
                        boxShadow: 3,
                        backgroundColor: '#f9f9f9'
                      }
                    }}
                  >
                    <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                      {lead.values?.Company || 'Unnamed Company'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                      {lead.values?.City ? `City: ${lead.values.City}` : 'City: N/A'}
                    </Typography>
                    {lead.values?.Phone && (
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                        Phone: {lead.values.Phone}
                      </Typography>
                    )}
                    {lead.values?.Email && (
                      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                        Email: {lead.values.Email}
                      </Typography>
                    )}
                  </Box>
                </Link>
              ))}
            </Box>
          )}
        </Box>
      </Dialog>
    </>
  )
}
