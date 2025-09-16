'use client'

import { useState, useMemo, useEffect, useLayoutEffect } from 'react'
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
  CardHeader,
  TextField
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
    lead_source: '',
    city: '',
    timeline_to_buy: '',
    next_followup_date: ''
  })

    const [sections, setSections] = useState([])
    const [fieldConfig, setFieldConfig] = useState({})


  //  🔹 Flatten helper
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

  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    const lead_form = 'lead-form'
    // setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
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
    } finally {
      // setLoader(false)
    }
  }




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
        if (fieldConfig && Array.isArray(fieldConfig['Lead Source'])) {
          return [...fieldConfig['Lead Source']]
        }
        return [] // fallback empty array
      }, [fieldConfig])



  const uniqueCities = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['City']))].filter(Boolean)
  }, [dataFilter])

  const uniqueTimelines = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Timeline to Buy']))].filter(Boolean)
  }, [dataFilter])

  const uniqueStatus = useMemo(() => {
    return [...new Set(dataFilter.map(item => item.values['Lead Status']))].filter(Boolean)
  }, [dataFilter])

  const fetchFilteredLeads = async que => {
    // const query = new URLSearchParams(filters).toString()
    // const res = await fetch(`/api/v1/admin/lead-form/dashboard-list?${que}`)
    // const data = await res.json()
    // console.log('Filtered Leads:', data)

     try {
      const res = await fetch(`/api/v1/admin/lead-form/dashboard-list?${que}`)
      const json = await res.json()
      console.log('Filtered Leads:', json)

      if (json.success) {
        setStats(json.stats) 
        // setDataFilter(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }



  }

  const fetchData = async () => {
    setLoading(true)

    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.source && { source: filters.source }),
      ...(filters.city && { city: filters.city }), // ✅ New
      ...(filters.timeline && { timeline: filters.timeline }), // ✅ New
      ...(filters.nextFollowup && { nextFollowup: dayjs(filters.nextFollowup).format('YYYY-MM-DD') }),
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

  useEffect(() => {
   console.log(uniqueSources,"<<< uniqueSources")
  }, [uniqueSources])
  

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
    const allEmpty = Object.values(filters).every(value => value === '')

    if (allEmpty) {
      console.log('All fields are empty')
       fetchData()
    } else {
      setLoading(true)

      const form_name = 'lead-form'
      const query = new URLSearchParams({
        organization_id,
        form_name,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
        ...(filters.city && { city: filters.city }), // ✅ New
        ...(filters.timeline && { timeline: filters.timeline }), // ✅ New
        ...(filters.nextFollowup && { nextFollowup: dayjs(filters.nextFollowup).format('YYYY-MM-DD') }),
        ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
        ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
      })

      fetchFilteredLeads(query)
      console.log('At least one filter is selected')
    }
  }, [filters])

  useEffect(() => {
    fetchFormTemplate()
  }, [])
  


  return (
    <>
      {/* <CardHeader title='Leads Overview' /> */}

      {/* Filters */}
      <Box
        display='flex'
        gap={2}
        flexWrap='wrap'
        alignItems='center'
        p={2}
        sx={{
          backgroundColor: '#fafafa',
          borderRadius: 2,
          mb: 3
        }}
      >
        {/* <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Lead Source</InputLabel>
          <Select value={leadSource} onChange={e => setLeadSource(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueSources.map(src => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </Select>
        </FormControl> */}


         <Grid item xs={12} sm={2}>
                      <TextField
                        select
                        size='small'
                        fullWidth
                        label='Source'
                         value={filters.source}
                        onChange={e => setFilters({ ...filters, source: e.target.value })}
                        // onChange={e => setLeadSource(e.target.value)}
                      >
                        <MenuItem value=''>All</MenuItem>
                        {uniqueSources.map(source => (
                          <MenuItem key={source} value={source}>
                            {source}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

        <FormControl size='small' sx={{ minWidth: 180 }}>
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

        <FormControl size='small' sx={{ minWidth: 200 }}>
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

      <Grid container spacing={3} p={2}>
        {loading
          ? [...Array(11)].map((_, i) => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={i}>
                <StatSkeleton />
              </Grid>
            ))
          : cardConfig.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
                <StatCard>
                  <CardContent className='flex items-center gap-3'>
                    <CustomAvatar
                      variant='rounded'
                      color={item.color}
                      className='shadow-md'
                      sx={{ width: 40, height: 40, fontSize: 16 }}
                    >
                      <i className={item.icon}></i>
                    </CustomAvatar>
                    <Box>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
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
