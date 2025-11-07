'use client'

import React, { useEffect, useState } from 'react'
import { Box, Typography, Button, Menu, Divider, MenuItem, TextField, Grid } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { getAllUserListApi } from '@/apiFunctions/ApiAction'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'

import NormalList from './NormalList'
import CalenderList from './CalenderList'
import TableTaskList from './TableTaskList'
import GoogleCalandarList from './GoogleCalandarList'

const priorities = ['Low', 'Medium', 'High']
const statuses = ['Not Started', 'Deferred', 'In Progress', 'Completed', 'Waiting for input']

export default function TaskList() {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')
  const loggedInUserId = Cookies.get('user_id')
  const loggedInUserName = Cookies.get('user_name')

  const [view, setView] = useState('google')
  const [viewAnchor, setViewAnchor] = useState(null)

  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState(dayjs().startOf('month'))
  const [to, setTo] = useState(dayjs().endOf('month'))

  const [userList, setUserList] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  const [selectedDate, setSelectedDate] = useState(dayjs())

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

  const fetchTasks = async (dateRange = null) => {
    setLoading(true)
    try {
      const payload = {
        organization_id,
        form_name: 'lead-form',
        c_createdBy: selectedUsers.length > 0 ? selectedUsers : [loggedInUserId],
        priority: priority || undefined,
        status: status || undefined,
        from: dateRange ? dayjs(dateRange.from).format('YYYY-MM-DD') : dayjs(from).format('YYYY-MM-DD'),
        to: dateRange ? dayjs(dateRange.to).format('YYYY-MM-DD') : dayjs(to).format('YYYY-MM-DD'),
        limit: 50
      }

      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }
      console.log("call task List 1")
      const res = await fetch('/api/v1/admin/lead-form/list', {
        method: 'POST',
        headers: header,
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        setTasks(data.data)

        

      } else {
        setTasks([])
      }
    } catch (err) {
      console.error('❌ Fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getUserListFn()
    fetchTasks({ from, to })
  }, [])

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        {/* 🔹 Header */}
        <Grid container alignItems='center' justifyContent='space-between' mb={2}>
          <Grid item>
            <Typography variant='h5' fontWeight={600}>
              📋 Task List
            </Typography>
          </Grid>
          <Grid item>
            <Button variant='outlined' endIcon={<ArrowDropDownIcon />} onClick={e => setViewAnchor(e.currentTarget)}>
              {view === 'normal' ? 'Normal View' : view === 'table' ? 'Table View' : 'Calendar View'}
            </Button>
            <Menu anchorEl={viewAnchor} open={Boolean(viewAnchor)} onClose={() => setViewAnchor(null)}>
              <MenuItem
                onClick={() => {
                  setView('normal')
                  setViewAnchor(null)
                }}
              >
                Normal View
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setView('table')
                  setViewAnchor(null)
                }}
              >
                Table View
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setView('google')
                  setViewAnchor(null)
                }}
              >
                Calendar View
              </MenuItem>
            </Menu>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />

        {/* 🔍 Filters */}
        <Grid container spacing={2} mb={3}>
          <Grid item>
            <TextField
              select
              label='Priority'
              value={priority}
              onChange={e => setPriority(e.target.value)}
              size='small'
              sx={{ minWidth: 120 }}
            >
              <MenuItem value=''>All</MenuItem>
              {priorities.map(p => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item>
            <TextField
              select
              label='Status'
              value={status}
              onChange={e => setStatus(e.target.value)}
              size='small'
              sx={{ minWidth: 160 }}
            >
              <MenuItem value=''>All</MenuItem>
              {statuses.map(s => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item>
            <TextField
              select
              label='Created By'
              value={selectedUsers.length > 0 ? selectedUsers : [loggedInUserId]}
              onChange={e =>
                setSelectedUsers(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
              }
              SelectProps={{ multiple: true }}
              size='small'
              sx={{ minWidth: 200 }}
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

          <Grid item>
            <DatePicker
              label='From'
              format="DD/MM/YYYY"
              value={from}
              onChange={newValue => setFrom(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Grid>

          <Grid item>
            <DatePicker
              label='To'
              format="DD/MM/YYYY"
              value={to}
              onChange={newValue => setTo(newValue)}
              slotProps={{ textField: { size: 'small' } }}
            />
          </Grid>

          <Grid item>
            <Button variant='contained' onClick={() => fetchTasks({ from, to })}>
              Apply
            </Button>
          </Grid>
        </Grid>

        {/* 🔹 Task Views */}
        <Grid container>
          {view === 'normal' && <NormalList loading={loading} tasks={tasks} loggedInUserName ={loggedInUserName}/>}
          {view === 'table' && <TableTaskList loading={loading} tasks={tasks} />}
          {view === 'calendar' && (
            <CalenderList
              loading={loading}
              tasks={tasks}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              fetchTasks={fetchTasks}
            />
          )}
          {view === 'google' && <GoogleCalandarList tasks={tasks} fetchTasks={fetchTasks} />}
        </Grid>
      </Box>
    </LocalizationProvider>
  )
}
