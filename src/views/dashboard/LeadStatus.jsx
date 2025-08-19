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
  CardHeader
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import CustomAvatar from '@core/components/mui/Avatar'
import Cookies from 'js-cookie'
import { Skeleton } from '@mui/material'

// ===== Styled Card =====
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(0),
  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.08)'
  }
}))

const quickRanges = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 }
]

const StatSkeleton = () => (
  <StatCard>
    <CardContent className='flex items-center gap-4'>
      <Skeleton variant='circular' width={30} height={30} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton width='80%' height={20} />
        <Skeleton width='40%' height={25} />
      </Box>
    </CardContent>
  </StatCard>
)

export default function LeadStatus() {
  const organization_id = Cookies.get('organization_id')
  const [leadSource, setLeadSource] = useState('')
  const [city, setCity] = useState('')
  const [followUpDate, setFollowUpDate] = useState(null)
  const [timeline, setTimeline] = useState('')
  const [quickRange, setQuickRange] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})
  const [dataFilter, setDataFilter] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    region: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    search: ''
  })

  const cardConfig = [
    { title: 'Total Leads', count: stats.totalLeads || 0, color: 'primary', icon: 'ri-calendar-todo-line' },
    { title: 'Hot Leads', count: stats.hotLeads || 0, color: 'error', icon: 'ri-fire-line' },
    { title: 'Warm Leads', count: stats.warmLeads || 0, color: 'warning', icon: 'ri-sun-line' },
    { title: 'Cold Leads', count: stats.coldLeads || 0, color: 'info', icon: 'ri-snowflake-line' },
    { title: 'New', count: stats.newLeads || 0, color: 'primary', icon: 'ri-add-line' },
    { title: 'Contacted', count: stats.contactedLeads || 0, color: 'info', icon: 'ri-phone-line' },
    { title: 'Qualified', count: stats.qualifiedLeads || 0, color: 'success', icon: 'ri-check-double-line' },
    { title: 'Proposal Sent', count: stats.proposalsentLeads || 0, color: 'success', icon: 'ri-send-plane-line' },
    { title: 'Negotiation', count: stats.negotiationLeads || 0, color: 'warning', icon: 'ri-exchange-dollar-line' },
    { title: 'Closed Won', count: stats.closedWonLeads || 0, color: 'success', icon: 'ri-checkbox-circle-line' },
    { title: 'Closed Lost', count: stats.closedLostLeads || 0, color: 'error', icon: 'ri-close-circle-line' }
  ]

  const uniqueSources = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Source']))].filter(Boolean)
  }, [dataFilter])

  const uniqueCities = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['City']))].filter(Boolean)
  }, [dataFilter])

  const uniqueTimelines = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Timeline to Buy']))].filter(Boolean)
  }, [dataFilter])

  const uniqueStatus = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Status']))].filter(Boolean)
  }, [dataFilter])

  const fetchData = async () => {
    setLoading(true)

    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      // page: page + 1,
      // limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
    })

    try {
      const res = await fetch(`/api/v1/admin/lead-form/dashboard-list?${query}`)
      const json = await res.json()

      if (json.success) {
        setStats(json.stats) // 👈 save stats
        setDataFilter(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Lead Source → already added
  useEffect(() => {
    setFilters(prev => ({ ...prev, source: leadSource }))
  }, [leadSource])

  // City
  useEffect(() => {
    setFilters(prev => ({ ...prev, region: city }))
  }, [city])

  // Timeline
  useEffect(() => {
    setFilters(prev => ({ ...prev, value: timeline }))
  }, [timeline])

  // Follow-up Date
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      fromDate: followUpDate ? dayjs(followUpDate).format('YYYY-MM-DD') : null,
      toDate: followUpDate ? dayjs(followUpDate).format('YYYY-MM-DD') : null
    }))
  }, [followUpDate])

  // Quick Range
  useEffect(() => {
    if (quickRange) {
      setFilters(prev => ({
        ...prev,
        fromDate: dayjs().subtract(quickRange.days, 'day').format('YYYY-MM-DD'),
        toDate: dayjs().format('YYYY-MM-DD')
      }))
    } else {
      setFilters(prev => ({ ...prev, fromDate: null, toDate: null }))
    }
  }, [quickRange])

  useEffect(() => {
    fetchData()
  }, [filters])

  return (
    <>
      {/* <CardHeader title='Leads Overview' /> */}

      {/* Filters */}
      <Box display='flex' gap={2} p={2} flexWrap='wrap'>
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>Lead Source</InputLabel>
          <Select value={leadSource} onChange={e => setLeadSource(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueSources.map(src => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>City</InputLabel>
          <Select value={city} onChange={e => setCity(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueCities.map(c => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Timeline to Buy</InputLabel>
          <Select value={timeline} onChange={e => setTimeline(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueTimelines.map(t => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Next Follow-up Date'
            value={followUpDate}
            onChange={newDate => setFollowUpDate(newDate)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={quickRange?.label || ''}
            onChange={e => {
              const selected = quickRanges.find(r => r.label === e.target.value)
              setQuickRange(selected || null)
            }}
          >
            <MenuItem value=''>All</MenuItem>
            {quickRanges.map(range => (
              <MenuItem key={range.label} value={range.label}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={1} p={0}>
        {loading
          ? [...Array(11)].map((_, i) => (
              <Grid item xs={12} sm={6} md={2} key={i}>
                <StatSkeleton />
              </Grid>
            ))
          : cardConfig.map((item, index) => (
              <Grid item xs={12} sm={6} md={2} key={index}>
                <StatCard>
                  <CardContent className='flex items-center'>
                    <Box>
                      <CustomAvatar
                        variant='rounded'
                        color={item.color}
                        className='shadow-md'
                        sx={{ width: 30, height: 30, fontSize: 10 }}
                      >
                        <i className={item.icon}></i>
                      </CustomAvatar>
                    </Box>
                    <Box >
                      <Typography variant='subtitle' sx={{ color: 'text.secondary' }}>
                        {item.title}
                      </Typography>
                      <Typography variant='h6' sx={{ fontWeight: 600 }}>
                        {item.count}
                      </Typography>
                    </Box>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
      </Grid>
    </>
  )
}
