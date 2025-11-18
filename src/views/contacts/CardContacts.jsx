/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect, useState } from 'react'

import Image from 'next/image'

import Typography from '@mui/material/Typography'
import { Box, Button, CardHeader, Grid, InputAdornment, MenuItem, TextField } from '@mui/material'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import dayjs from 'dayjs'
// Components Imports
import { getAllUserListApi } from '@/apiFunctions/ApiAction'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import LoaderGif from '@assets/gif/loader.gif'
import NotesIcon from '@mui/icons-material/Notes'
import ContactsCardList from './ContactsCardList'

const CardContacts = () => {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')
  const loggedInUserId = Cookies.get('user_id')
  const loggedInUserName = Cookies.get('user_name')

  const [contacts, setContacts] = useState([])
  const [totalContactsCount, setTotalContactsCount] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState(dayjs().startOf('Month'))
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

  const fetchContacts = async (from, to) => {
    setLoading(true)
    try {
      const payload = {
        organization_id,
        search,
        form_name: 'lead-form',
        c_createdBy: selectedUsers.length > 0 ? selectedUsers : [loggedInUserId],
        from: from ? dayjs(from).format('YYYY-MM-DD') : null,
        to: to ? dayjs(to).format('YYYY-MM-DD') : null,
        page: page,
        limit: limit
      }

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      const res = await fetch('/api/v1/admin/lead-form/contacts', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {

        setContacts(data.data)
        setTotalContactsCount(data?.total)
      } else {
        setContacts([])
        setTotalContactsCount(null)
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMoreContacts = async (nextPage,from,to) => {

    setLoading(true)
    try {
      const payload = {
        organization_id,
        search,
        form_name: 'lead-form',
        c_createdBy: selectedUsers.length > 0 ? selectedUsers : [loggedInUserId],
        from: from ? dayjs(from).format('YYYY-MM-DD') : null,
        to: to ? dayjs(to).format('YYYY-MM-DD') : null,
        page: nextPage,
        limit: limit
      }

      const res = await fetch('/api/v1/admin/lead-form/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setContacts(prev => [...prev, ...data.data]) // append new page data
        //  setTotalContactsCount(data?.total)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (search === '') {
      fetchContacts({ from, to })
    }
  }, [search])

  useEffect(() => {
    getUserListFn()
    fetchContacts({ from, to })
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
              placeholder='Search Contacts....'
              name='search'
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                    
                  fetchContacts(from, to) // ✅ call fetchContacts on Enter
                  setPage(1)
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
              onClick={() => fetchContacts({ from, to })}
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
                setFrom(dayjs().startOf('Month'))
                setTo(dayjs().endOf('Today'))

                // Refetch notes
                fetchContacts({ from: dayjs().startOf('Month'), to: dayjs().endOf('Today') })
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
              Fetching contacts...
            </Typography>
          </Box>
        ) : contacts.length === 0 ? (
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
              No contacts found
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 320 }}>
              There are no contacts available for the selected period.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <ContactsCardList
              contacts={contacts}
              fetchMoreContacts={(nextPage) => fetchMoreContacts(nextPage, from, to)}
              totalCount={totalContactsCount} // total from API response
              page={page}
              setPage={setPage}
              limit={limit}
              setLimit={setLimit}

            />
          </Grid>
        )}
      </Box>
    </LocalizationProvider>
  )
}

export default CardContacts
