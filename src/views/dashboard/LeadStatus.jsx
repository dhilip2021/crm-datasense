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
import LeadsOverview from './LeadsOverview'
import LeadsOverviewFilters from './LeadsOverviewFilters'

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
  const theme = useTheme()
  return (
    <>
      {/* FILTER  */}
      <LeadsOverviewFilters
        filters={filters}
        setFilters={setFilters}
        viewType={viewType}
        setViewType={setViewType}
        uniqueSources={uniqueSources}
        uniqueCities={uniqueCities}
        uniqueTimelines={uniqueTimelines}
      />

      {/* OVERVIEW  */}
      <LeadsOverview cardConfig={cardConfig} />

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
