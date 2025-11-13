/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'

// MUI Imports
import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { Box, Button, CardHeader, Grid, InputAdornment, MenuItem, TextField } from '@mui/material'
import Cookies from 'js-cookie'
import { ToastContainer, toast } from 'react-toastify'
import dayjs from 'dayjs'
// Components Imports
import OptionsMenu from '@core/components/option-menu'
import { createLead, getAllLeadListApi, getAllUserListApi } from '@/apiFunctions/ApiAction'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import LoaderGif from '@assets/gif/loader.gif'
import NoteCard from './NoteCard'
import NotesIcon from '@mui/icons-material/Notes'
// import AddNotesPopup from './AddNotesPopup'

const CardNotes = () => {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')
  const loggedInUserId = Cookies.get('user_id')
  const loggedInUserName = Cookies.get('user_name')

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)

  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState(dayjs().startOf('Today'))
  const [to, setTo] = useState(dayjs().endOf('Today'))

  const [userList, setUserList] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  const getUserListFn = async () => {
    try {
      const results = await getAllUserListApi()
      if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
        setUserList(results.payloadJson)
      } else {
        setUserList([])
      }
    } catch {
      setUserList([])
    }
  }

  const fetchNotes = async (dateRange = null) => {
    setLoading(true)
    try {
      const payload = {
        organization_id,
        search,
        form_name: 'lead-form',
        c_createdBy: selectedUsers.length > 0 ? selectedUsers : [loggedInUserId],
        from: dateRange ? dayjs(dateRange.from).format('YYYY-MM-DD') : null,
        to: dateRange ? dayjs(dateRange.to).format('YYYY-MM-DD') : null,
        limit: 50
      }

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      const res = await fetch('/api/v1/admin/lead-form/notes', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        console.log(data.data, '<<<< Data data')

        setNotes(data.data)
      } else {
        setNotes([])
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Edit Note Handler
  const onEdit = async note => {
    console.log(note, 'Edit note')

    try {
      const trimmedNote = note.note?.trim() || ''
      const leadId = note.lead_id // ensure leadId is passed

      if (!leadId) {
        toast.error('Lead ID missing in note payload', { position: 'bottom-center', autoClose: 1000 })
        return
      }

      const payload = {
        values: {
          Notes: [
            {
              title: note.title,
              note: trimmedNote,
              createdAt: note.createdAt,
              createdBy: note.createdBy,
              _id: note._id
            }
          ]
        },
        lead_touch: 'touch'
      }

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Note updated successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        fetchNotes({ from, to }) // ✅ Refresh list after update
      } else {
        toast.error(result.error || 'Error updating note', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (err) {
      console.error('❌ Edit error:', err)
      toast.error('Something went wrong', {
        autoClose: 800,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
  }

  const onAdd = async note => {
    console.log(note, '<<< add Notess')

    try {
      const trimmedNote = note.note?.trim() || ''
      const leadId = note.lead_id // ensure leadId is passed

      if (!leadId) {
        toast.error('Lead ID missing in note payload', { position: 'bottom-center', autoClose: 1000 })
        return
      }

      const payload = {
        values: {
          Notes: [
            {
              title: note.title,
              note: trimmedNote,
              createdAt: note.createdAt,
              createdBy: note.createdBy
            }
          ]
        },
        lead_touch: 'touch'
      }

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Note Added successfully', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
        fetchNotes({ from, to }) // ✅ Refresh list after update
      } else {
        toast.error(result.error || 'Error updating note', {
          autoClose: 800,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
    } catch (err) {
      console.error('❌ Edit error:', err)
      toast.error('Something went wrong', {
        autoClose: 800,
        position: 'bottom-center',
        hideProgressBar: true
      })
    }
  }

  useEffect(() => {
    if (search === '') {
      fetchNotes({ from, to })
    }
  }, [search])

  useEffect(() => {
    getUserListFn()
    fetchNotes({ from, to })
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* 🔹 Filters Section */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: 1,
          mb: 3
        }}
      >
        <Grid container spacing={2} alignItems='center'>
          {/* 🔍 Search Field */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              autoComplete='off'
              placeholder='Search Notes....'
              name='search'
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  fetchNotes() // ✅ call fetchNotes on Enter
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-line' />
                  </InputAdornment>
                ),
                endAdornment:
                  search?.length > 0 ? (
                    <InputAdornment position='end' sx={{ cursor: 'pointer' }} onClick={() => setSearch('')}>
                      <i className='ri-close-line' />
                    </InputAdornment>
                  ) : null
              }}
              size='small'
            />
          </Grid>

          {/* 👤 Created By */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label='Created By'
              value={selectedUsers.length > 0 ? selectedUsers : [loggedInUserId]}
              onChange={e =>
                setSelectedUsers(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
              }
              SelectProps={{ multiple: true }}
              size='small'
            >
              <MenuItem value={loggedInUserId}>{loggedInUserName || 'Me'}</MenuItem>
              {userList
                .filter(u => u.user_id !== loggedInUserId)
                .map(u => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    {u.user_name || `${u.first_name} ${u.last_name}`}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          {/* 📅 From Date */}
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label='From'
              format='DD/MM/YYYY'
              value={from || null}
              onChange={newValue => setFrom(newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {/* 📅 To Date */}
          <Grid item xs={12} sm={6} md={2}>
            <DatePicker
              label='To'
              format='DD/MM/YYYY'
              value={to || null}
              onChange={newValue => setTo(newValue)}
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Grid>

          {/* 🔘 Apply Button */}
          <Grid item xs={12} sm={12} md={1.5}>
            <Button
              variant='contained'
              fullWidth
              onClick={() => fetchNotes({ from, to })}
              sx={{
                height: '40px',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Apply
            </Button>
          </Grid>
          <Grid item xs={12} sm={12} md={1.5}>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => {
                // Reset all filters
                setSearch('')
                setPriority('')
                setStatus('')
                setSelectedUsers([])
                setFrom(dayjs().startOf('Today'))
                setTo(dayjs().endOf('Today'))

                // Refetch notes
                fetchNotes({ from: dayjs().startOf('Today'), to: dayjs().endOf('Today') })
              }}
              sx={{
                height: '40px',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* 🗒️ Notes List Section */}
      <Box
        sx={{
          maxHeight: 'calc(100vh - 200px)', // adjust 200px based on your Filters section + padding
          overflowY: 'auto',
          px: 2, // optional padding
          pb: 2 // optional padding
        }}
      >
        {loading ? (
          <Box textAlign='center' py={5}>
            <Image src={LoaderGif} alt='Loading...' width={60} height={60} />
            <Typography variant='body2' color='text.secondary' mt={1}>
              Fetching notes...
            </Typography>
          </Box>
        ) : notes.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              px: 3,
              borderRadius: 3,
              bgcolor: 'grey.50',
              border: '1px dashed',
              borderColor: 'grey.300',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <NotesIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant='h6' color='text.secondary' sx={{ mb: 1, fontWeight: 500 }}>
              No notes found
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 320 }}>
              There are no notes available for the selected period.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <NoteCard search={search} notes={notes} onEdit={onEdit} onAdd={onAdd} />
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default CardNotes
