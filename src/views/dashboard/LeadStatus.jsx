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
  Button,
  Menu,
  Skeleton,
  useTheme,
  Fade,
  Divider,
  TextField
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import CustomAvatar from '@core/components/mui/Avatar'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Cookies from 'js-cookie'

// 🔹 Card Style — Elevated Gradient Look
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

const quickRanges = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 }
]

export default function LeadStatus() {
  const theme = useTheme()
  const organization_id = Cookies.get('organization_id')
  const [filters, setFilters] = useState({
    source: '',
    city: '',
    timeline: '',
    nextFollowup: null,
    fromDate: null,
    toDate: null
  })
  const [viewType, setViewType] = useState('This Month')
  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [quickRange, setQuickRange] = useState(null)
  const [stats, setStats] = useState({})
  const [dataFilter, setDataFilter] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [sections, setSections] = useState([])

  const view = Boolean(anchorViewEl)
  const handleViewClick = event => setAnchorViewEl(event.currentTarget)
  const handleViewClose = () => setAnchorViewEl(null)

  const getDateRange = viewType => {
    const today = dayjs()

    if (viewType === 'Today') return { fromDate: today.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }

    if (viewType === 'This Week') {
      const startOfWeek = today.startOf('week').add(1, 'day')
      return { fromDate: startOfWeek.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    }

    if (viewType === 'This Month')
      return { fromDate: today.startOf('month').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }

    if (viewType === 'Last Month') {
      const start = today.subtract(1, 'month').startOf('month')
      const end = today.subtract(1, 'month').endOf('month')
      return { fromDate: start.format('YYYY-MM-DD'), toDate: end.format('YYYY-MM-DD') }
    }

    if (viewType === 'Last 6 Months')
      return {
        fromDate: today.subtract(6, 'month').startOf('month').format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }

    return { fromDate: today.subtract(7, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
  }

  // 🔹 Card Config
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

  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      Object.values(section.fields).forEach(fieldGroup => {
        fieldGroup.forEach(field => {
          flat.push({
            sectionName: section.title || section.sectionName || '',
            ...field
          })
        })
      })
    })
    return flat
  }

  const fetchFormTemplate = async () => {
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=lead-form`
      )
      const json = await res.json()
      if (json?.success && json.data?.sections?.length > 0) {
        setSections(json.data.sections)
        const flattened = flattenFields(json.data.sections)
        const config = {}
        flattened.forEach(field => {
          if (field.type === 'Dropdown' && field.options?.length > 0) {
            config[field.label] = field.options
          }
        })
        setFieldConfig(config)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const query = new URLSearchParams({
      organization_id,
      form_name: 'lead-form',
      ...(filters.source && { source: filters.source }),
      ...(filters.city && { city: filters.city }),
      ...(filters.timeline && { timeline: filters.timeline }),
      ...(filters.nextFollowup && { nextFollowup: dayjs(filters.nextFollowup).format('YYYY-MM-DD') }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
    })
    try {
      const res = await fetch(`/api/v1/admin/lead-form/dashboard-list?${query}`)
      const json = await res.json()
      if (json.success) {
        setStats(json.stats)
        setDataFilter(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate, toDate }))
  }, [viewType])

  useEffect(() => {
    if (quickRange) {
      setFilters(prev => ({
        ...prev,
        fromDate: dayjs().subtract(quickRange.days, 'day'),
        toDate: dayjs()
      }))
    }
  }, [quickRange])

  useEffect(() => {
    fetchData()
  }, [filters])

  useEffect(() => {
    fetchFormTemplate()
  }, [])

  const uniqueSources = useMemo(() => fieldConfig['Lead Source'] || [], [fieldConfig])
  const uniqueCities = useMemo(
    () => [...new Set(dataFilter.map(item => item.values['City']))].filter(Boolean),
    [dataFilter]
  )
  const uniqueTimelines = useMemo(
    () => [...new Set(dataFilter.map(item => item.values['Timeline to Buy']))].filter(Boolean),
    [dataFilter]
  )

  return (
    <>
      {/* 🔹 FILTER BAR */}
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
                onChange={e => setFilters({ ...filters, source: e.target.value })}
              >
                <MenuItem value=''>All</MenuItem>
                {uniqueSources.map(src => (
                  <MenuItem key={src} value={src}>
                    {src}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl size='small' fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  label='City'
                  value={filters.city}
                  onChange={e => setFilters({ ...filters, city: e.target.value })}
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
                <InputLabel>Timeline to Buy</InputLabel>
                <Select
                  label='Timeline to Buy'
                  value={filters.timeline}
                  onChange={e => setFilters({ ...filters, timeline: e.target.value })}
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
                  onChange={newDate => setFilters({ ...filters, nextFollowup: newDate })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl fullWidth size='small'>
                <InputLabel id='view-type-label'>Date Range</InputLabel>
                <Select
                  labelId='view-type-label'
                  label='Date Range'
                  value={viewType}
                  onChange={e => setViewType(e.target.value)}
                >
                  {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months'].map(label => (
                    <MenuItem key={label} value={label}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* <Divider sx={{ my: 2 }} /> */}
        </CardContent>
      </Card>

      {/* 🔹 STAT CARDS */}
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
                  <StatCard>
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
                        <i className={item.icon}></i>
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
    </>
  )
}
