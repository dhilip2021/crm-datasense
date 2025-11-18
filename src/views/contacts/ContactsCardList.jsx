'use client'

import { useState } from 'react'
import { Box, Typography, Divider, Chip, Button, Paper, Grid } from '@mui/material'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BusinessIcon from '@mui/icons-material/Business'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhoneIcon from '@mui/icons-material/Phone'
import NotesIcon from '@mui/icons-material/Notes'
import dayjs from 'dayjs'
import { encryptCryptoRes } from '@/helper/frontendHelper'
import Link from 'next/link'

const ContactsCardList = ({ contacts, fetchMoreContacts, totalCount, page, setPage, limit }) => {
  const [loadingMore, setLoadingMore] = useState(false)
  if (!contacts || contacts.length === 0) {
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
          No contacts available yet.
        </Typography>
      </Box>
    )
  }

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const nextPage = page + 1

    // Save scroll position
    const container = document.getElementById('contacts-scroll-container')
    const scrollPos = container.scrollTop

    await fetchMoreContacts(nextPage)

    // Keep scroll position
    container.scrollTop = scrollPos

    setPage(nextPage)
    setLoadingMore(false)
  }

  return (
    <Grid
      container
      spacing={2}
      id='contacts-scroll-container'
      sx={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      {contacts.map((lead, index) => (
        <Grid item xs={12} sm={6} key={index}>
          {/* <Chip label={index+1} size='small' variant='outlined' sx={{ fontSize: 12, mt: 0.5 }} /> */}
          <Paper
            elevation={1}
            sx={{
              px: 3,
              py: 2,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.2
            }}
          >
            <Link
              href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(lead?.lead_id))}`}
              style={{ textDecoration: 'none' }}
            >
              <Box display='flex' alignItems='center' gap={2}>
                <PersonOutlineIcon color='primary' />
                <Typography variant='h6' fontWeight={600}>
                  {lead.values?.['First Name']} {lead.values?.['Last Name']}
                </Typography>

                {lead.values?.Email && (
                  <Chip label={lead.values.Email} size='small' variant='outlined' sx={{ fontSize: 12, mt: 0.5 }} />
                )}
                
              </Box>
            </Link>
            {/* Name */}

            {/* Phone */}
            {lead.values?.Phone && (
              <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                <PhoneIcon fontSize='small' color='action' />
                <Typography variant='body2'>{lead.values.Phone}</Typography>
              </Box>
            )}

            {/* Company */}
            {lead.values?.Company && (
              <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                <BusinessIcon fontSize='small' color='action' />
                <Typography variant='body2'>{lead.values.Company}</Typography>
              </Box>
            )}

            {/* Location */}
            {(lead.values?.City || lead.values?.State || lead.values?.Country) && (
              <Box display='flex' alignItems='center' gap={1} mt={0.5}>
                <LocationOnIcon fontSize='small' color='action' />
                <Typography variant='body2'>
                  {`${lead.values.City || ''}, ${lead.values.State || ''}, ${lead.values.Country || ''}`.trim()}
                </Typography>
              </Box>
            )}

            <Divider sx={{ mt: 1 }} />

            {/* Call logs */}
            {lead.allContatcs?.map((call, i) => (
              <Box
                key={i}
                sx={{
                  py: 1,
                  px: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  mt: 0.5
                }}
              >
                <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  {call.from} → {call.to} — {dayjs(call.startTime).format('DD MMM YYYY, hh:mm A')}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      ))}

      {/* Load More */}
      {contacts.length < totalCount && (
        <Grid item xs={12}>
          <Box textAlign='center' mt={1}>
            <Button variant='outlined' onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load More'}
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}

export default ContactsCardList
