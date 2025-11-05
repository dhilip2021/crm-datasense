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
  Skeleton,
  useTheme,
  Fade,
  TextField
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import CustomAvatar from '@core/components/mui/Avatar'
import Cookies from 'js-cookie'

// 🔹 Stat Card Style
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
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({})
  const [dataFilter, setDataFilter] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [sections, setSections] = useState([])

  // 🔹 Date Range Logic
  const getDateRange = type => {
    const today = dayjs()
    if (type === 'Today') return { fromDate: today, toDate: today }
    if (type === 'This Week') return { fromDate: today.startOf('week').add(1, 'day'), toDate: today }
    if (type === 'This Month') return { fromDate: today.startOf('month'), toDate: today }
    if (type === 'Last Month')
      return {
        fromDate: today.subtract(1, 'month').startOf('month'),
        toDate: today.subtract(1, 'month').endOf('month')
      }
    if (type === 'Last 6 Months') return { fromDate: today.subtract(6, 'month').startOf('month'), toDate: today }
    return { fromDate: today.subtract(7, 'day'), toDate: today }
  }

  // 🔹 Fetch Data
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

  // 🔹 Flatten Fields Safely
  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      if (!section.fields) return
      Object.values(section.fields || {}).forEach(fieldGroup => {
        if (!Array.isArray(fieldGroup)) return
        fieldGroup.forEach(field => flat.push({ sectionName: section.title || '', ...field }))
      })
    })
    return flat
  }

  // 🔹 Fetch Form Template
  const fetchFormTemplate = async () => {
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=lead-form`
      )
      const json = await res.json()
      if (json.success && json.data?.sections?.length) {
        setSections(json.data.sections)
        const flat = flattenFields(json.data.sections)
        const config = {}
        flat.forEach(f => {
          if (f.type === 'Dropdown' && f.options?.length) config[f.label] = f.options
        })

        console.log(config,"<<< CONFIGGGG")
        setFieldConfig(config)
      }
    } catch (err) {
      console.error(err)
    }
  }

  // 🔹 Initialize
  useEffect(() => {
    fetchFormTemplate()
    const { fromDate, toDate } = getDateRange('This Month')
    setFilters(prev => ({ ...prev, fromDate, toDate }))
  }, [])

  useEffect(() => {
    if (filters.fromDate && filters.toDate) fetchData()
  }, [filters])

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate, toDate }))
  }, [viewType])

  // 🔹 Lead Status Counts
  const leadStatusCounts = useMemo(() => {
    const counts = {}
    const allStatuses = fieldConfig['Lead Status'] || []
    allStatuses.forEach(status => {
      counts[status] = dataFilter.filter(l => l.values && l.values['Lead Status'] === status).length
    })
    return {
      ...counts,
      totalLeads: dataFilter.length,
      hotLeads: counts['Hot'] || 0,
      warmLeads: counts['Warm'] || 0,
      coldLeads: counts['Cold'] || 0
    }
  }, [dataFilter, fieldConfig])

  // 🔹 Lead Status Counts
// const leadStatusCounts = useMemo(() => {
//   const counts = {}

//   dataFilter.forEach(lead => {
//     const label = lead.values?.Label || ''

//         const status = fieldConfig['Lead Status'] || []
//     status.forEach(status => {
//       counts[status] = dataFilter.filter(l => l.values && l.values['Lead Status'] === status).length
//     })

//     // Hot/Warm/Cold based on Label
//     if (label.includes('Hot')) counts['Hot'] = (counts['Hot'] || 0) + 1
//     else if (label.includes('Warm')) counts['Warm'] = (counts['Warm'] || 0) + 1
//     else if (label.includes('Cold')) counts['Cold'] = (counts['Cold'] || 0) + 1
//     else {
//       // For anything else, use Lead Status
//       counts[status] = (counts[status] || 0) + 1
//     }
//   })

//   return {
//     ...counts,
//     totalLeads: dataFilter.length,
//     hotLeads: counts['Hot'] || 0,
//     warmLeads: counts['Warm'] || 0,
//     coldLeads: counts['Cold'] || 0
//   }
// }, [dataFilter, fieldConfig])

const statusMeta = {
  Hot: { color: 'error', icon: '🔥' },
  Warm: { color: 'warning', icon: '☀️' },
  Cold: { color: 'info', icon: '❄️' },
  'In Progress': { color: 'info', icon: '⏳' },
  New: { color: 'primary', icon: '🆕' },
  Contacted: { color: 'secondary', icon: '📞' },
  Qualified: { color: 'success', icon: '✅' },
  'Proposal Sent': { color: 'warning', icon: '📩' },
  Unqualified: { color: 'error', icon: '❌' },
  Junk: { color: 'secondary', icon: '🗑️' },
  Qualification: { color: 'info', icon: '📝' },
  Quotation: { color: 'warning', icon: '💰' },
  Negatiation: { color: 'warning', icon: '🤝' },
  'Ready to close': { color: 'success', icon: '🏁' },
  'Closed Won': { color: 'success', icon: '🏆' },
  'Closed Lost': { color: 'error', icon: '💔' },
  'Attempted to Contact': { color: 'info', icon: '📲' },
  'Lost Lead - No Requirements': { color: 'secondary', icon: '⚠️' },
  'No Response/Busy': { color: 'secondary', icon: '⏱️' },
  'Lost Lead - Already Using': { color: 'secondary', icon: '🔒' },
  Interested: { color: 'success', icon: '✨' },
  'Demo Scheduled': { color: 'info', icon: '📅' },
  'Need to Schedule Demo': { color: 'warning', icon: '🗓️' },
  'Demo Completed': { color: 'success', icon: '🎯' },
  'Call Back': { color: 'info', icon: '📱' },
  'Invalid Number': { color: 'error', icon: '❌' },
  'Lost Lead - Small scale': { color: 'secondary', icon: '⚠️' },
  'Converted To Deal': { color: 'success', icon: '💼' },
  Total: { color: 'primary', icon: '👥' }
}


  // 🔹 Card Config
  const cardConfig = useMemo(() => {
    const cards = []

    cards
      .push({
        title: 'Total Leads',
        count: leadStatusCounts.totalLeads,
        color: statusMeta.Total.color,
        icon: statusMeta.Total.icon
      });

      ['Hot', 'Warm', 'Cold'].forEach(status => {
        const count = leadStatusCounts[status] || 0
        if (count > 0) {
          const meta = statusMeta[status]
          cards.push({ title: `${status} Leads`, count, color: meta.color, icon: meta.icon })
        }
      })

    Object.entries(leadStatusCounts).forEach(([status, count]) => {
      if (!['totalLeads', 'Hot', 'Warm', 'Cold'].includes(status) && count > 0) {
        const meta = statusMeta[status] || { color: 'info', icon: 'ri-checkbox-circle-line' }
        cards.push({ title: status, count, color: meta.color, icon: meta.icon })
      }
    })

    return cards
  }, [leadStatusCounts])

  const uniqueSources = useMemo(() => [...new Set(dataFilter.map(d => d.values?.Source).filter(Boolean))], [dataFilter])
  const uniqueCities = useMemo(() => [...new Set(dataFilter.map(d => d.values?.City).filter(Boolean))], [dataFilter])
  const uniqueTimelines = useMemo(
    () => [...new Set(dataFilter.map(d => d.values?.Timeline).filter(Boolean))],
    [dataFilter]
  )
  return (
    <>
      {/* FILTER BAR */}
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
                onChange={e => setFilters(prev => ({ ...prev, source: e.target.value }))}
              >
                <MenuItem value=''>All</MenuItem>
                {uniqueSources.map(s => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl size='small' fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={filters.city}
                  onChange={e => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  label='City'
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
                <InputLabel>Timeline</InputLabel>
                <Select
                  value={filters.timeline}
                  onChange={e => setFilters(prev => ({ ...prev, timeline: e.target.value }))}
                  label='Timeline'
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
                  onChange={d => setFilters({ ...filters, nextFollowup: d })}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={2.4}>
              <FormControl fullWidth size='small'>
                <InputLabel id='view-type-label'>Date Range</InputLabel>
                <Select labelId='view-type-label' value={viewType} onChange={e => setViewType(e.target.value)}>
                  {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months'].map(l => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* STAT CARDS */}
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
                        {/* <i className={item.icon}></i> */}
                        {item.icon}
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
