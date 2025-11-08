'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
  Chip,
  Button,
  Grid
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import BusinessIcon from '@mui/icons-material/Business'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import NotesIcon from '@mui/icons-material/Notes'
import dayjs from 'dayjs'

// Escape regex special characters in search
const escapeRegex = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

// Helper function to highlight text
const highlightText = (text, search) => {
  if (!text) return ''
  if (!search) return text

  const escapedSearch = escapeRegex(search) // escape special characters
  const regex = new RegExp(`(${escapedSearch})`, 'gi') // case-insensitive
  const parts = String(text).split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} style={{ backgroundColor: '#fff176', padding: '0 2px', borderRadius: 2 }}>
        {part}
      </span>
    ) : (
      part
    )
  )
}

const NoteCard = ({ search, notes, onEdit, initialLimit = 4, loadMoreStep = 4 }) => {
  const filteredLeads = notes.filter(
    lead => Array.isArray(lead.values?.Notes) && lead.values.Notes.length > 0
  )

  const [limit, setLimit] = useState(initialLimit)

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
          No notes available yet.
        </Typography>
      </Box>
    )
  }

  // Slice for pagination
  const displayedLeads = filteredLeads.slice(0, limit)

  const handleLoadMore = () => {
    setLimit(prev => prev + loadMoreStep)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={2}>
        {displayedLeads.map((lead) => (
          <Grid item xs={12} sm={6} key={lead._id}>
            <Box
              sx={{
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
                width: '100%',
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
                    label={lead.values?.['Lead Status'] || 'New'}
                    color='primary'
                    variant='outlined'
                    size='small'
                    sx={{ fontSize: 12 }}
                  />
                </Box>

                <Typography variant='body2' color='text.secondary' sx={{ mt: { xs: 1, sm: 0 } }}>
                  Total Notes: {lead.values.Notes.length}
                </Typography>
              </Box>

              {/* Notes */}
              <Box sx={{ p: 2.5 }}>
                {lead.values.Notes.map((note, index) => (
                  <Box key={note._id || index}>
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
                      <Box sx={{ flex: 1 }}>
                        <Typography variant='subtitle1' fontWeight={600} sx={{ mb: 0.5, color: 'text.primary', fontSize: 15 }}>
                          {highlightText(note.title, search)}
                        </Typography>

                        <Box display='flex' alignItems='center' flexWrap='wrap' gap={1.5} sx={{ color: 'text.secondary', fontSize: 13 }}>
                          <Box display='flex' alignItems='center' gap={0.5}>
                            <CalendarMonthIcon fontSize='small' sx={{ fontSize: 18 }} />
                            <Typography variant='body2'>
                              {dayjs(note.createdAt).format('DD MMM YYYY, hh:mm A')}
                            </Typography>
                          </Box>

                          <Divider orientation='vertical' flexItem />

                          <Box display='flex' alignItems='center' gap={0.5}>
                            <PersonOutlineIcon fontSize='small' sx={{ fontSize: 18 }} />
                            <Typography variant='body2'>{note.createdBy || 'Unknown'}</Typography>
                          </Box>
                        </Box>

                        <Typography variant='body2' sx={{ mt: 1.3, color: 'text.secondary', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                          {highlightText(note.note, search)}
                        </Typography>
                      </Box>

                      <Tooltip title='Edit Note'>
                        <IconButton onClick={() => onEdit(note)} size='small' sx={{ bgcolor: 'grey.100', borderRadius: 2, mt: 0.5, ml: 2, transition: '0.2s', '&:hover': { bgcolor: 'grey.200', transform: 'scale(1.1)' } }}>
                          <EditIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {index !== lead.values.Notes.length - 1 && <Divider sx={{ my: 1.5, borderColor: 'divider' }} />}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Load More Button */}
      {limit < filteredLeads.length && (
        <Box textAlign='center' mt={2}>
          <Button variant='contained' onClick={handleLoadMore}>
            Load More
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default NoteCard
