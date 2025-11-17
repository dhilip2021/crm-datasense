'use client'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
  Divider,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Grid,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material'
import dayjs from 'dayjs'
import Cookies from 'js-cookie'
import { toast } from 'react-toastify'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import TaskDialog from './TaskDialog'
import MeetingDialog from './MeetingDialog'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined'
import CallDialog from './CallDialog'
import CallLog from './CallLog'
import CallUIPopup from './CallUIPopup'

const statusColors = {
  'Not Started': { bg: '#F2F3F4', color: '#7F8C8D' },
  Deferred: { bg: '#FDEDEC', color: '#C0392B' },
  'In Progress': { bg: '#FEF5E7', color: '#E67E22' },
  Completed: { bg: '#E8F8F5', color: '#27AE60' },
  'Waiting for input': { bg: '#EBF5FB', color: '#2980B9' }
}

const priorityColors = {
  High: { bg: '#C0392B', color: '#FFFFFF' },
  Medium: { bg: '#F39C12', color: '#FFFFFF' },
  Low: { bg: '#27AE60', color: '#FFFFFF' }
}

export default function TaskTabs({ leadId, leadData, fetchLeadFromId }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const getToken = Cookies.get('_token')
  const user_name = Cookies.get('user_name')
  const user_id = Cookies.get('user_id')
  const fromPhoneNumber = Cookies.get('mobile')


  // Filter out completed tasks for display
  const leadArrayTasks = leadData?.values?.Activity?.[0]?.task || []
  const leadArrayMeetings = leadData?.values?.Activity?.[0]?.meeting || []
  const leadArrayCalls = leadData?.values?.Activity?.[0]?.call || []
  // const toPhoneNumber = leadData?.values?.Phone || ""
  const [toPhoneNumber, setToPhoneNumber] = useState(leadData?.values?.Phone)
  const [callResponse, setCallResponse] = useState("")
const [openResponseDialog, setOpenResponseDialog] = useState(false)

  const sortedTasks = useMemo(() => {
    return [...leadArrayTasks]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .map(t => ({
        type: 'Task',
        _id: t._id || '',
        subject: t.subject || 'Untitled Task',
        dueDate: t.dueDate,
        priority: t.priority || 'Medium',
        status: t.status || 'Not Started',
        owner: t.owner || 'Unknown',
        reminderEnabled: t.reminderEnabled || false,
        reminderDate: t.reminderDate || '',
        reminderTime: t.reminderTime || '',
        alertType: t.alertType || 'Both'
      }))
  }, [leadArrayTasks])


    const sortedMeetings = useMemo(() => {
    return [...leadArrayMeetings]
      .sort((a, b) => new Date(a.fromDate) - new Date(b.fromDate))
      .map(t => ({
        type: 'Meeting',
        _id: t._id || '',
        title: t.title || 'New Meeting',
        venue: t.venue || 'Client Location',
        link: t.link || '',
        location: t.location || '',
        fromDate: t.fromDate || new Date(),
        fromTime: t.fromTime,
        toDate: t.toDate,
        toTime: t.toTime,
        host: t.host || 'Unknown',
        participants: t.participants || []
      }))
  }, [leadArrayMeetings])

    const sortedCalls = useMemo(() => {
    return [...leadArrayCalls]
      .sort((a, b) => new Date(a.endTime) - new Date(b.startTime))
      .map(t => ({
        type: 'Call',
        _id: t._id || '',
        from: t.from || '',
        to: t.to || '',
        startTime: t.startTime || '',
        endTime: t.endTime || '',
        duration: t.duration || null,
        createdBy: t.createdBy || ''
       
      }))
  }, [leadArrayCalls])

  const today = dayjs().startOf('day')

  // Separate tasks based on dueDate
  const completedTasks = useMemo(() => sortedTasks.filter(t => dayjs(t.dueDate).isBefore(today, 'day')), [sortedTasks])
  const currentTasks = useMemo(() => sortedTasks.filter(t => dayjs(t.dueDate).isSame(today, 'day')), [sortedTasks])
  const upcomingTasks = useMemo(() => sortedTasks.filter(t => dayjs(t.dueDate).isAfter(today, 'day')), [sortedTasks])

  const completedMeetings = useMemo(
    () => sortedMeetings.filter(t => dayjs(t.fromDate).isBefore(today, 'day')),
    [sortedMeetings]
  )
  const currentMeetings = useMemo(
    () => sortedMeetings.filter(t => dayjs(t.fromDate).isSame(today, 'day')),
    [sortedMeetings]
  )
  const upcomingMeetings = useMemo(
    () => sortedMeetings.filter(t => dayjs(t.fromDate).isAfter(today, 'day')),
    [sortedMeetings]
  )

  const [tab, setTab] = useState(0)
  const [openTaskDialog, setOpenTaskDialog] = useState(false)
  const [openCallDialog, setOpenCallDialog] = useState(false)
  const [openMeetingDialog, setOpenMeetingDialog] = useState(false)
  const [tasks, setTasks] = useState(sortedTasks)
  const [meetings, setMeetings] = useState(sortedMeetings)
  const [calls, setCalls] = useState(sortedCalls)
  const [editingTask, setEditingTask] = useState(null)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [loaderTask, setLoaderTask] = useState(false)
  const [loaderMeeting, setLoaderMeeting] = useState(false)
  const [reminderTimeTaskError, setReminderTimeTaskError] = useState(false)
  const [reminderFromTimeMeetingError, setReminderFromTimeMeetingError] = useState(false)
  const [reminderToTimeMeetingError, setReminderToTimeMeetingError] = useState(false)

  const initialTaskData = {
    _id: '',
    subject: '',
    dueDate: '',
    priority: 'High',
    status: 'Not Started',
    owner: user_name,
    reminderEnabled: false,
    reminderDate: '',
    reminderTime: '',
    alertType: 'Both'
  }
  const initialMeetingData = {
    _id: '',

    title: 'New Meeting',
    venue: 'Client Location',
    location: '',
    link: '',
    fromDate: null,
    fromTime: null,
    toDate: null,
    toTime: null,
    participants: [],
    host: user_name
  }

  const [taskData, setTaskData] = useState(initialTaskData)
  const [meetingData, setMeetingData] = useState(initialMeetingData)
  const [errorTaskData, setErrorTaskData] = useState({
    subject: false,
    dueDate: false,
    reminderDate: false
  })

  const [errorMeetingData, setErrorMeetingData] = useState({
    title: false,
    link: false,
    fromDate: false,
    fromTime: false,
    toDate: false,
    toTime: false,
    participants: false
  })

  const renderTaskCard = task => (
    <Card
      key={task._id}
      sx={{ p: 2, borderRadius: 2, boxShadow: '0px 2px 6px rgba(0,0,0,0.08)', position: 'relative' }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Typography variant='subtitle1' fontWeight={600}>
          {task.subject}
        </Typography>
        <Chip
          label={task.status}
          size='small'
          sx={{
            backgroundColor: statusColors[task.status]?.bg,
            color: statusColors[task.status]?.color,
            fontWeight: 600,
            fontSize: 12,
            px: 1,
            height: 24,
            '& .MuiChip-label': { px: 1 }
          }}
        />
        <Chip
          label={task.priority}
          size='small'
          sx={{
            backgroundColor: priorityColors[task.priority]?.bg,
            color: priorityColors[task.priority]?.color,
            fontWeight: 600,
            fontSize: 12,
            px: 1,
            height: 24,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 14, color: 'text.secondary' }}>
        <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
        <Typography variant='caption'>
          {dayjs(task.dueDate).format('DD MMM YYYY')} . {task.reminderTime || '—'}
        </Typography>
        <Typography variant='caption' sx={{ ml: 2 }}>
          Created By <b>{task.owner}</b>
        </Typography>
      </Box>

      <IconButton
        size='small'
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          bgcolor: '#f5f5f5',
          '&:hover': { bgcolor: '#e0e0e0' }
        }}
        onClick={() => {
          setEditingTask(task)
          setTaskData(task)
          setOpenTaskDialog(true)
        }}
      >
        <EditOutlinedIcon fontSize='small' />
      </IconButton>
    </Card>
  )

  const renderMeetingCard = meeting => (
    <Card
      key={meeting._id}
      sx={{
        p: 3,
        borderRadius: 4,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        position: 'relative',
        transition: 'all 0.25s ease',
        border: '1px solid #e0e0e0',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          transform: 'translateY(-4px)'
        }
      }}
    >
      {/* --- Header --- */}
      <Box display='flex' alignItems='center' justifyContent='space-between' mb={1}>
        <Typography variant='h6' fontWeight={700} sx={{ color: '#1e293b' }}>
          {meeting.title || 'Untitled Meeting'}
        </Typography>

        <Tooltip title='Edit Meeting'>
          <IconButton
            size='small'
            sx={{
              bgcolor: '#f8fafc',
              '&:hover': { bgcolor: '#e2e8f0' }
            }}
            onClick={() => {
              setEditingMeeting(meeting)
              setMeetingData(meeting)
              setOpenMeetingDialog(true)
            }}
          >
            <EditOutlinedIcon sx={{ fontSize: 18, color: '#475569' }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* --- Meeting Details --- */}
      <Grid container spacing={2}>
        {/* Venue */}
        {meeting.venue && (
          <Grid item xs={12} sm={4}>
            <Box display='flex' alignItems='center' gap={1}>
              <PlaceOutlinedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
              <Typography variant='body2' color='text.secondary'>
                <strong>Venue:</strong> {meeting.venue}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Location */}
        {meeting.location && (
          <Grid item xs={12} sm={4}>
            <Box display='flex' alignItems='center' gap={1}>
              <LocationOnOutlinedIcon sx={{ fontSize: 20, color: '#f59e0b' }} />
              <Typography variant='body2' color='text.secondary'>
                <strong>Location:</strong> {meeting.location}
              </Typography>
            </Box>
          </Grid>
        )}

        {/* Link */}
        {meeting.link && (
          <Grid item xs={12} sm={4}>
            <Box display='flex' alignItems='center' gap={1}>
              <VideocamOutlinedIcon sx={{ fontSize: 20, color: '#0ea5e9' }} />
              <Chip
                label='Join Meeting'
                component='a'
                href={meeting.link}
                target='_blank'
                clickable
                sx={{
                  bgcolor: '#e0f2fe',
                  color: '#0369a1',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#bae6fd' }
                }}
              />
            </Box>
          </Grid>
        )}
      </Grid>

      {/* --- Participants --- */}
      {meeting.participants?.length > 0 && (
        <Box mt={2.5}>
          <Typography
            variant='subtitle2'
            color='text.secondary'
            sx={{ mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}
          >
            Participants
          </Typography>
          <Box display='flex' flexWrap='wrap' gap={1}>
            {meeting.participants.map((p, i) => (
              <Chip
                key={i}
                label={p}
                avatar={<Avatar sx={{ bgcolor: '#0ea5e9', width: 28, height: 28 }}>{p.charAt(0).toUpperCase()}</Avatar>}
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#0f172a',
                  fontSize: 13,
                  fontWeight: 500
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* --- Date/Time --- */}
      <Box
        mt={3}
        p={2}
        borderRadius={3}
        sx={{
          bgcolor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5
        }}
      >
        <Chip
          icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: '#0ea5e9' }} />}
          label={
            <>
              <b>From:</b>{' '}
              {`${dayjs(meeting.fromDate).format('DD MMM YYYY')} — ${dayjs(meeting.fromTime, 'HH:mm').format('hh:mm A')}`}
            </>
          }
          sx={{ bgcolor: 'white', fontSize: 13, height: 30, fontWeight: 500 }}
          variant='outlined'
        />
        <Chip
          icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: '#f59e0b' }} />}
          label={
            <>
              <b>To:</b>{' '}
              {`${dayjs(meeting.toDate).format('DD MMM YYYY')} — ${dayjs(meeting.toTime, 'HH:mm').format('hh:mm A')}`}
            </>
          }
          sx={{ bgcolor: 'white', fontSize: 13, height: 30, fontWeight: 500 }}
          variant='outlined'
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* --- Footer --- */}
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Box display='flex' alignItems='center' gap={1}>
          <PersonOutlineIcon sx={{ fontSize: 18, color: '#64748b' }} />
          <Typography variant='caption' color='text.secondary'>
            Created by <b>{meeting.host}</b>
          </Typography>
        </Box>
        <Chip
          label='Meeting Scheduled'
          size='small'
          sx={{
            bgcolor: '#ecfccb',
            color: '#4d7c0f',
            fontWeight: 600,
            fontSize: 12
          }}
        />
      </Box>
    </Card>
  )

  const handleTaskChange = (field, value) => setTaskData(prev => ({ ...prev, [field]: value }))
  const handleMeetingChange = (field, value) => setMeetingData(prev => ({ ...prev, [field]: value }))

  const handleTaskClose = () => {
    setOpenTaskDialog(false)
    setEditingTask(null)
    // setTaskData(initialTaskData)
    setErrorTaskData({ subject: false, dueDate: false, reminderDate: false })
    setReminderTimeTaskError(false)
  }

  const handleMeetingClose = () => {
    setOpenMeetingDialog(false)
    setEditingMeeting(null)
    // setMeetingData(initialMeetingData)
    setErrorMeetingData({ title: false, link: false, fromDate: false, toDate: false, fromTime: false, toTime: false })
    setReminderFromTimeMeetingError(false)
    setReminderToTimeMeetingError(false)
  }

  const handleCallClose = () => {
    setOpenCallDialog(false)
    setToPhoneNumber(leadData?.values?.Phone)
    // setEditingTask(null)
    // setErrorTaskData({ subject: false, dueDate: false, reminderDate: false })
    // setReminderTimeTaskError(false)
  }

  const hasInitialTaskSpace = str => str?.[0] === ' '
  const hasInitialMeetingSpace = str => str?.[0] === ' '

  // const validateReminderTaskTime = () => {
  //   if (!taskData.reminderEnabled || !taskData.reminderTime || !taskData.reminderDate) return true
  //   const reminderDateTime = dayjs(`${taskData.reminderDate} ${taskData.reminderTime}`, 'YYYY-MM-DD HH:mm')
  //   const now = dayjs()
  //   return !(dayjs(taskData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now))
  // }

  const validateReminderTaskTime = () => {
    if (!taskData.reminderEnabled || !taskData.reminderTime || !taskData.reminderDate) return true

    const reminderDateTime = dayjs(
      `${dayjs(taskData.reminderDate).format('YYYY-MM-DD')} ${taskData.reminderTime}`,
      'YYYY-MM-DD HH:mm'
    )
    const now = dayjs()

    // If reminder is set for today, time must be >= current time
    if (dayjs(taskData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now)) {
      return false
    }
    return true
  }

  const validateReminderMeetingTime = () => {
    if (!meetingData.reminderEnabled || !meetingData.reminderTime || !meetingData.reminderDate) return true
    const reminderDateTime = dayjs(`${meetingData.reminderDate} ${meetingData.reminderTime}`, 'YYYY-MM-DD HH:mm')
    const now = dayjs()
    return !(dayjs(meetingData.reminderDate).isSame(now, 'day') && reminderDateTime.isBefore(now))
  }

  const saveTask = async () => {
    // Validation
    if (!taskData.subject || hasInitialTaskSpace(taskData.subject)) {
      setErrorTaskData(prev => ({ ...prev, subject: true }))
      return
    }
    if (!taskData.dueDate) {
      setErrorTaskData(prev => ({ ...prev, dueDate: true }))
      return
    }
    const today = dayjs().startOf('day')
    if (dayjs(taskData.dueDate).isBefore(today)) {
      setErrorTaskData(prev => ({ ...prev, dueDate: true }))
      return
    }
    if (!validateReminderTaskTime()) {
      setReminderTimeTaskError(true)
      return
    }

    // Flatten all tasks
    const allTasks = []
    const activity = leadData?.values?.Activity || {}
    for (const key in activity) {
      if (activity[key]?.task) {
        allTasks.push(...activity[key].task)
      }
    }

    // Convert all due dates to dayjs objects
    const upcomingTasks = allTasks
      .map(t => dayjs(t.dueDate)) // t.dueDate can be string
      .filter(d => d.isAfter(dayjs(), 'day'))

    const nextFollowUpDate = upcomingTasks.length
      ? upcomingTasks.reduce((earliest, d) => (d.isBefore(earliest) ? d : earliest), upcomingTasks[0])
      : dayjs(taskData.dueDate)

    const payload = {
      _id: editingTask?._id,
      subject: taskData.subject,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: taskData.status,
      owner: taskData.owner,
      reminderEnabled: taskData.reminderEnabled,
      reminderDate: taskData.reminderDate,
      reminderTime: taskData.reminderTime,
      alertType: taskData.alertType,
      createdAt: new Date().toISOString(),
      createdBy: user_id
    }

    const earliest =
      new Date(nextFollowUpDate.format('YYYY-MM-DD')) < new Date(taskData.dueDate)
        ? nextFollowUpDate.format('YYYY-MM-DD')
        : taskData.dueDate

    try {
      setLoaderTask(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify({
          values: {
            'Next Follow-up Date': earliest ? earliest : taskData.dueDate,
            Activity: [{ task: [payload] }]
          },
          lead_touch: 'touch'
        })
      })
      const result = await res.json()

      setLoaderTask(false)
      if (!res.ok || !result.success) throw new Error(result.message || 'Server Error')

      const updatedTasks = result.data.values?.Activity?.[0]?.task || []

      const formattedTask = {
        type: 'Task',
        _id: payload._id || updatedTasks[updatedTasks.length - 1]?._id || '',
        subject: payload.subject,
        dueDate: payload.dueDate,
        priority: payload.priority,
        status: payload.status,
        owner: payload.owner,
        reminderEnabled: payload.reminderEnabled,
        reminderDate: payload.reminderDate,
        reminderTime: payload.reminderTime,
        alertType: payload.alertType
      }

      if (editingTask) {
        setTasks(prev => prev.map(t => (t._id === formattedTask._id ? formattedTask : t)))
        toast.success('Task Updated Successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      } else {
        setTasks(prev => [formattedTask, ...prev])
        toast.success('Task Added Successfully!', { autoClose: 500, position: 'bottom-center', hideProgressBar: true })
      }
      fetchLeadFromId()
      // handleTaskClose()
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to save task')
      setLoaderTask(false)
    }
  }

  const saveMeeting = async () => {
    // Validation
    if (!meetingData.title || hasInitialMeetingSpace(meetingData.title)) {
      setErrorMeetingData(prev => ({ ...prev, title: true }))
      return
    }
    if (!meetingData.fromDate) {
      setErrorMeetingData(prev => ({ ...prev, fromDate: true }))
      return
    }
    const today = dayjs().startOf('day')
    if (dayjs(meetingData.fromDate).isBefore(today)) {
      setErrorMeetingData(prev => ({ ...prev, fromDate: true }))
      return
    }
    if (!validateReminderMeetingTime()) {
      setReminderFromTimeMeetingError(true)
      setReminderToTimeMeetingError(true)
      return
    }

    const invalidEmails = meetingData.participants.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    if (invalidEmails) {
      setErrorMeetingData(prev => ({ ...prev, participants: true }))
      return
    }

    if (invalidEmails) {
      setErrorMeetingData(prev => ({ ...prev, participants: true }))
      return
    }

    // 🌐 URL validation
    const urlPattern = /^(https?:\/\/)?([^\s.]+\.[^\s]{2,}|localhost[:?\d]*)\S*$/i
    if (meetingData.link && !urlPattern.test(meetingData.link)) {
      setErrorMeetingData(prev => ({ ...prev, link: true }))
      toast.error('Please enter a valid meeting link (e.g., https://example.com)')
      return
    }

    const payload = {
      _id: editingMeeting?._id,
      title: meetingData.title,
      venue: meetingData.venue,
      location: meetingData.location,
      link: meetingData.link,
      host: meetingData.host,
      fromDate: meetingData.fromDate,
      fromTime: meetingData.fromTime,
      toDate: meetingData.toDate,
      toTime: meetingData.toTime,
      participants: meetingData.participants,
      createdAt: new Date().toISOString(),
      createdBy: user_id
    }

    try {
      setLoaderMeeting(true)
      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` },
        body: JSON.stringify({
          values: {
            Activity: [{ meeting: [payload] }]
          },
          lead_touch: 'touch'
        })
      })
      const result = await res.json()

      setLoaderMeeting(false)
      if (!res.ok || !result.success) throw new Error(result.message || 'Server Error')

      const updatedMeetings = result.data.values?.Activity?.[0]?.meeting || []

      const formattedMeeting = {
        type: 'Meeting',
        _id: payload._id || updatedMeetings[updatedMeetings.length - 1]?._id || '',
        title: payload.title,
        venue: payload.venue,
        location: payload.location,
        link: payload.link,
        host: payload.host,
        fromDate: payload.fromDate,
        fromTime: payload.fromTime,
        toDate: payload.toDate,
        toTime: payload.toTime
      }

      if (editingMeeting) {
        setMeetings(prev => prev.map(t => (t._id === formattedMeeting._id ? formattedMeeting : t)))
        toast.success('Meeting Updated Successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      } else {
        setMeetings(prev => [formattedMeeting, ...prev])
        toast.success('Meeting Added Successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      }
      fetchLeadFromId()
      handleMeetingClose()
    } catch (err) {
      console.error(err)
      toast.error('❌ Failed to save meeting')
      setLoaderMeeting(false)
    }
  }


  const [isCalling, setIsCalling] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const timerRef = useRef(null)
  const maxCallTime = 60 * 60 // 1 hour max

  // 🟢 START CALL
  const handleStartCall = () => {
    setIsCalling(true)
    setSeconds(0)
    const now = new Date().toISOString()
    setStartTime(now)

    // Start timer
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    // Trigger mobile call dialer (will open in phone)
    window.location.href = `tel:${toPhoneNumber}`
  }







  // 🔴 STOP CALL + Log to backend
  const handleStopCall = async () => {
    setIsCalling(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const durationSeconds = seconds
    const formatDuration = sec => {
      const m = Math.floor(sec / 60)
        .toString()
        .padStart(2, '0')
      const s = (sec % 60).toString().padStart(2, '0')
      return `${m}:${s}`
    }

    const payload = {
      values: {
        Activity: [
          {
            call: [
              {
                from: fromPhoneNumber, // example caller number
                to: toPhoneNumber,
                startTime: startTime,
                endTime: new Date().toISOString(),
                duration: formatDuration(durationSeconds),
                response:callResponse,
                createdAt: new Date().toISOString(),
                createdBy: user_name
              }
            ]
          }
        ]
      },
      lead_touch: 'touch'
    }

    try {
      // ✅ Uncomment for real logging
      // await axios.post('/api/call/log', payload)

      const res = await fetch(`/api/v1/admin/lead-form/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken}`
        },
        body: JSON.stringify(payload)
      })

      console.log(res,"<<< RESSSSSSS")


      const result = await res.json()
       if (!res.ok || !result.success) throw new Error(result.message || 'Server Error')


      if (editingTask) {
        setTasks(prev => prev.map(t => (t._id === formattedTask._id ? formattedTask : t)))
        toast.success('Task Updated Successfully!', {
          autoClose: 500,
          position: 'bottom-center',
          hideProgressBar: true
        })
      } else {
        setTasks(prev => [formattedTask, ...prev])
        toast.success('Task Added Successfully!', { autoClose: 500, position: 'bottom-center', hideProgressBar: true })
      }
      fetchLeadFromId()


   

    } catch (err) {
      console.error('❌ Failed to log call', err)
    }

    // Reset
    setSeconds(0)
    setStartTime(null)
    setOpenCallDialog(false)
  }

  const onStopCall = () => {
  // handleStopCall();       // ungaloda existing stop logic
  handleCallClose();      // main dialog close
  setOpenResponseDialog(true); // new response popup open
}

 



    // 🟣 Restore last selected tab when component mounts
  useEffect(() => {
    const savedTab = localStorage.getItem('lastLeadTab')
    if (savedTab) {
      setTab(parseInt(savedTab))
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // 🟢 When user switches tabs, save to localStorage
  const handleTabChange = (e, val) => {
    setTab(val)
    localStorage.setItem('lastLeadTab', val)
  }

  const progress = Math.min((seconds / maxCallTime) * 100, 100)

  // useEffect(() => {
  //   setTasks(sortedTasks)
  // }, [sortedTasks])







  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: '100%', mx: 'auto', mt: 0 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? 1 : 0,
            mb: 2
          }}
        >
          <Tabs
            value={tab}
            onChange={handleTabChange}
            textColor='secondary'
            indicatorColor='secondary'
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 500, minWidth: isMobile ? '120px' : 'auto' },
              '& .Mui-selected': { color: '#9c27b0 !important', fontWeight: 600 },
              flexGrow: isMobile ? 1 : 'unset'
            }}
          >
            <Tab label={`Task (${leadArrayTasks.length})`} />
            <Tab label={`Meetings (${leadArrayMeetings.length})`} />
            <Tab label={`Calls (${leadArrayCalls.length})`} />
          </Tabs>

          <Box sx={{ mt: isMobile ? 1 : 0 }}>
            {tab === 0 && (
              <Button
                variant='contained'
                onClick={() => setOpenTaskDialog(true)}
                sx={{
                  bgcolor: '#009cde',
                  '&:hover': { bgcolor: '#007bb5' },
                  borderRadius: 2,
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                + Create Task
              </Button>
            )}
            {tab === 1 && (
              <Button
                variant='contained'
                onClick={() => setOpenMeetingDialog(true)}
                sx={{
                  bgcolor: '#009cde',
                  '&:hover': { bgcolor: '#007bb5' },
                  borderRadius: 2,
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                + Create Meeting
              </Button>
            )}
            {tab === 2 && (
              <Button
                variant='contained'
                onClick={() => setOpenCallDialog(true)}
                sx={{
                  bgcolor: '#009cde',
                  '&:hover': { bgcolor: '#007bb5' },
                  borderRadius: 2,
                  textTransform: 'none',
                  width: isMobile ? '100%' : 'auto'
                }}
              >
                + Create Call
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {tab === 0 &&
          (Array.isArray(leadArrayTasks) && leadArrayTasks.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Tasks */}
              {currentTasks.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#1976d2', fontWeight: 600 }}>
                    🟢 Today’s Tasks
                  </Typography>
                  {currentTasks.map(task => renderTaskCard(task))}
                </Card>
              )}

              {/* Upcoming Tasks */}
              {upcomingTasks.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#27ae60', fontWeight: 600 }}>
                    🚀 Upcoming Tasks
                  </Typography>
                  {upcomingTasks.map(task => renderTaskCard(task))}
                </Card>
              )}

              {/* Completed / Past Tasks */}
              {completedTasks.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#c0392b', fontWeight: 600 }}>
                    ✅ Completed / Past Tasks
                  </Typography>
                  {completedTasks.map(task => renderTaskCard(task))}
                </Card>
              )}
            </Box>
          ) : (
            <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
              🚫 No tasks found
            </Typography>
          ))}

        {tab === 1 &&
          (Array.isArray(leadArrayMeetings) && leadArrayMeetings.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Current Meetings */}
              {currentMeetings.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 1, mb: 0.5, color: '#1976d2', fontWeight: 600 }}>
                    🟢 Today’s Meetings
                  </Typography>
                  {currentMeetings.map(task => renderMeetingCard(task))}
                </Card>
              )}

              {/* Upcoming Meetings */}
              {upcomingMeetings.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#27ae60', fontWeight: 600 }}>
                    🚀 Upcoming Meetings
                  </Typography>
                  {upcomingMeetings.map(task => renderMeetingCard(task))}
                </Card>
              )}

              {/* Completed / Past Meetings */}
              {completedMeetings.length > 0 && (
                <Card>
                  <Typography variant='subtitle2' sx={{ mt: 2, mb: 0.5, color: '#c0392b', fontWeight: 600 }}>
                    ✅ Completed / Past Meetings
                  </Typography>
                  {completedMeetings.map(task => renderMeetingCard(task))}
                </Card>
              )}
            </Box>
          ) : (
            <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
              🚫 No meetings found
            </Typography>
          ))}

        {tab === 2 &&
          (Array.isArray(leadArrayCalls) && leadArrayCalls.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              <CallLog calls={leadArrayCalls} />

            </Box>
          ) : (
            <Typography textAlign='center' color='text.secondary' sx={{ mt: 4 }}>
              🚫 No calls found
            </Typography>
          ))}

        <TaskDialog
          handleTaskChange={handleTaskChange}
          openTaskDialog={openTaskDialog}
          editingTask={editingTask}
          handleTaskClose={handleTaskClose}
          setErrorTaskData={setErrorTaskData}
          errorTaskData={errorTaskData}
          loaderTask={loaderTask}
          taskData={taskData}
          user_name={user_name}
          setReminderTimeTaskError={setReminderTimeTaskError}
          reminderTimeTaskError={reminderTimeTaskError}
          saveTask={saveTask}
        />

        <MeetingDialog
          handleMeetingChange={handleMeetingChange}
          openMeetingDialog={openMeetingDialog}
          editingMeeting={editingMeeting}
          handleMeetingClose={handleMeetingClose}
          setErrorMeetingData={setErrorMeetingData}
          errorMeetingData={errorMeetingData}
          loaderMeeting={loaderMeeting}
          meetingData={meetingData}
          user_name={user_name}
          setReminderFromTimeMeetingError={setReminderFromTimeMeetingError}
          setReminderToTimeMeetingError={setReminderToTimeMeetingError}
          reminderFromTimeMeetingError={reminderFromTimeMeetingError}
          reminderToTimeMeetingError={reminderToTimeMeetingError}
          saveMeeting={saveMeeting}
        />

        <CallDialog
          openCallDialog={openCallDialog}
          handleCallClose={handleCallClose}
          progress={progress}
          seconds={seconds}
          isCalling={isCalling}
          handleStartCall={handleStartCall}
          toPhoneNumber={toPhoneNumber}
          setToPhoneNumber={setToPhoneNumber}
          callResponse={callResponse} 
          setCallResponse={setCallResponse}
          onStopCall={onStopCall}
          openResponseDialog={openResponseDialog}
          setOpenResponseDialog={setOpenResponseDialog}
          handleStopCall={handleStopCall}
        />


          {/* <CallUIPopup
              open={openCallDialog}
              onClose={handleCallClose}
              toPhoneNumber={toPhoneNumber}
              setToPhoneNumber={setToPhoneNumber}
          /> */}

      </Box>
    </LocalizationProvider>
  )
}
