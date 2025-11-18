'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Divider,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BusinessIcon from '@mui/icons-material/Business'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import NotesIcon from '@mui/icons-material/Notes'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'

// Escape regex special characters
const escapeRegex = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Highlight matched text
const highlightText = (text, search) => {
  if (!text) return ''
  if (!search) return text
  const escapedSearch = escapeRegex(search)
  const regex = new RegExp(`(${escapedSearch})`, 'gi')
  const parts = String(text).split(regex)
  return parts.map((part, i) =>
    regex.test(part) ? (
      <span key={i} style={{ backgroundColor: '#fff176', padding: '0 2px', borderRadius: 2 }}>
        {part}
      </span>
    ) : (
      part
    )
  )
}

const CallCard = ({ search, calls, initialLimit = 4, loadMoreStep = 4 }) => {
  const user_name = Cookies.get('user_name')
  const [limit, setLimit] = useState(initialLimit)

  // 🛠️ Flatten calls from all activities safely
  const filteredLeads = calls
    .map(lead => {
      const allCalls = lead.values?.Activity?.flatMap(activity => activity.call || []) || []

      return allCalls.length > 0
        ? { ...lead, allCalls: allCalls.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) }
        : null
    })
    .filter(Boolean) // remove nulls

  if (filteredLeads.length === 0) {
    return (
      <Box
        sx={{
          p: 6,
          borderRadius: 3,
          bgcolor: 'background.paper',
          textAlign: 'center',
          border: '1px dashed #ccc',
          width: '100%',
          mt: 2
        }}
      >
        <NotesIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
          No calls available yet.
        </Typography>
      </Box>
    )
  }

  const displayedLeads = filteredLeads.slice(0, limit)

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {displayedLeads.map(lead => (
          <Grid item xs={12} sm={6} key={lead._id}>
            <Box
              sx={{
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                bgcolor: 'background.paper'
              }}
            >
              {/* Header */}
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                <Box display='flex' alignItems='center' gap={1.5}>
                  <BusinessIcon color='primary' />
                  <Typography variant='h6' fontWeight={600}>
                    {lead.values?.Company || lead.lead_name}
                  </Typography>
                  <Chip
                    label={lead.values?.['Lead Status'] || 'New / Attempted Contact'}
                    color='primary'
                    variant='outlined'
                    size='small'
                    sx={{ fontSize: 12 }}
                  />
                </Box>

                <Typography variant='body2' color='text.secondary'>
                  Total Calls: {lead.allCalls.length}
                </Typography>
              </Box>

              {/* Calls List */}
              <Box sx={{ p: 2.5 }}>
                {lead.allCalls.map((data, index) => (
                  <Box key={data._id || index} sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        py: 1.5,
                        px: 1,
                        borderRadius: 2,
                        transition: '0.2s ease',
                        '&:hover': { bgcolor: 'grey.50' }
                      }}
                    >
                      {/* LEFT SECTION */}
                      <Box sx={{ flex: 1 }}>
                        {/* Call Response */}
                        <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 0.5 }}>
                          {highlightText(data.response, search)}
                        </Typography>

                        {/* META INFO */}
                        <Box display='flex' alignItems='center' gap={1} sx={{ color: 'text.secondary', fontSize: 13 }}>
                          <CalendarMonthIcon sx={{ fontSize: 18 }} />
                          <Typography variant='body2'>
                            {dayjs(data.startTime).format('DD MMM YYYY, hh:mm A')}
                          </Typography>

                          <Divider orientation='vertical' flexItem />

                          <PersonOutlineIcon sx={{ fontSize: 18 }} />
                          <Typography variant='body2'>{data.createdBy || 'Unknown'}</Typography>

                          <Divider orientation='vertical' flexItem />

                          <Chip label={`Duration: ${data.duration}`} size='small' />
                        </Box>

                        {/* FROM → TO */}
                        <Typography variant='body2' sx={{ mt: 1, color: 'text.secondary' }}>
                          <strong>From:</strong> {data.from} <strong>→ To:</strong> {data.to}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Load More */}
      {limit < filteredLeads.length && (
        <Box textAlign='center' mt={2}>
          <Button variant='contained' onClick={() => setLimit(limit + loadMoreStep)}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default CallCard
