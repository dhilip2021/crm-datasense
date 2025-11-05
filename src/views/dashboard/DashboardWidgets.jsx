'use client'

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  LinearProgress,
  Button,
  Menu,
  MenuItem,
  Skeleton
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { getUserListApi } from '@/apiFunctions/ApiAction'

export default function DashboardWidgets() {
  const router = useRouter()

  const user_id = Cookies.get('user_id')
  const getToken = Cookies.get('_token')

  const organization_id = Cookies.get('organization_id')

  const [data, setData] = useState([])
  const [loader, setLoader] = useState(false)
  const [fetched, setFetched] = useState(true)
  const [sections, setSections] = useState([])
  // const [fieldConfig, setFieldConfig] = useState({})
  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [viewType, setViewType] = useState('This Month')
  const view = Boolean(anchorViewEl)

  const handleViewClick = event => {
    setAnchorViewEl(event.currentTarget)
  }

  const handleViewClose = () => {
    setAnchorViewEl(null)
  }

  const targetHours = 24

  // 👇 Dynamic lead stats
  const assignedLeads = useMemo(() => {
    return data.filter(lead => lead.values?.['Assigned To'] && lead.values['Assigned To'].trim() !== '').length
  }, [data])

  const unassignedLeads = useMemo(() => {
    return data.filter(lead => !lead.values?.['Assigned To'] || lead.values['Assigned To'].trim() === '').length
  }, [data])

  const followUpsToday = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return data.filter(lead => {
      const followDate = lead.values?.['Next Follow-up Date']
      return followDate && dayjs(followDate).isSame(today, 'day')
    }).length
  }, [data])

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    touch: '',
    source: '',
    region: '',
    assign: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    fromFollowDate: null,
    toFollowDate: null
  })

  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      const fieldsObj = section.fields || {} // ← safeguard
      Object.values(fieldsObj).forEach(fieldGroup => {
        ;(fieldGroup || []).forEach(field => {
          flat.push({
            sectionName: section.title || section.sectionName || '',
            ...field
          })
        })
      })
    })
    return flat
  }

  const getDateRange = viewType => {
    const today = dayjs()

    if (viewType === 'Today') {
      return {
        fromDate: today.format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }
    }

    if (viewType === 'This Week') {
      const startOfWeek = today.startOf('week').add(1, 'day') // Monday
      const endOfRange = today // till today
      return {
        fromDate: startOfWeek.format('YYYY-MM-DD'),
        toDate: endOfRange.format('YYYY-MM-DD')
      }
    }

    if (viewType === 'This Month') {
      return {
        fromDate: today.startOf('month').format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }
    }

    if (viewType === 'Last Month') {
      const startOfLastMonth = today.subtract(1, 'month').startOf('month')
      const endOfLastMonth = today.subtract(1, 'month').endOf('month')
      return {
        fromDate: startOfLastMonth.format('YYYY-MM-DD'),
        toDate: endOfLastMonth.format('YYYY-MM-DD')
      }
    }

    if (viewType === 'Last 6 Months') {
      const fromDate = today.subtract(6, 'month').startOf('month')
      return {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }
    }

    // fallback (last 7 days)
    return {
      fromDate: today.subtract(7, 'day').format('YYYY-MM-DD'),
      toDate: today.format('YYYY-MM-DD')
    }
  }

  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    const lead_form = 'lead-form'
    setLoader(true)
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
        // setFieldConfig(config)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  const fetchData = async () => {
    setLoader(true)

    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.touch && { touch: filters.touch }),
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
      ...(filters.assign && { assign: filters.assign }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') }),
      ...(filters.fromFollowDate && { from: dayjs(filters.fromFollowDate).format('YYYY-MM-DD') }),
      ...(filters.toFollowDate && { to: dayjs(filters.toFollowDate).format('YYYY-MM-DD') })
    })

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`, {
        method: 'GET',
        headers: header
      })
      const json = await res.json()

      if (json.success) {
        console.log(json.data, '<<< JSON dataaa123456')

        setData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }

  const getUserListFn = async userId => {
    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }
    try {
      const results = await getUserListApi(userId, header)
      if (results?.payloadJson[0]?.n_status === 0) {
        removeCredentials()
      }
    } catch (err) {
      console.log(err)
    }
  }

  // ⚙️ Calculate average response time in hours
  const avgHours = useMemo(() => {
    if (!data.length) return 0

    const totalHours = data.reduce((acc, lead) => {
      const created = new Date(lead.createdAt?.$date || lead.createdAt)
      const updated = new Date(lead.updatedAt?.$date || lead.updatedAt)

      if (isNaN(created) || isNaN(updated)) return acc

      const diffMs = updated - created
      const diffHours = diffMs / (1000 * 60 * 60) // convert ms → hours
      return acc + diffHours
    }, 0)

    const avg = totalHours / data.length
    return Number(avg.toFixed(2)) // round to 2 decimals
  }, [data])

  useEffect(() => {
    if (!fetched && sections) {
      fetchData()
      setFetched(true)
    }
  }, [filters])

  useEffect(() => {
    if (user_id !== undefined) {
      getUserListFn(user_id)
    }
  }, [user_id])

  useEffect(() => {
    fetchFormTemplate()
    setFetched(false)
  }, [])

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate: fromDate, toDate: toDate }))
    setFetched(false)
  }, [viewType])

  return (
    <>
      <Box display='flex' justifyContent='flex-end'>
        <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleViewClick}>
          {viewType}
        </Button>

        <Menu anchorEl={anchorViewEl} open={view} onClose={handleViewClose}>
          <MenuItem
            onClick={() => {
              setViewType('Today')
              handleViewClose()
            }}
          >
            Today
          </MenuItem>
          <MenuItem
            onClick={() => {
              setViewType('This Week')
              handleViewClose()
            }}
          >
            This Week
          </MenuItem>

          <MenuItem
            onClick={() => {
              setViewType('This Month')
              handleViewClose()
            }}
          >
            This Month
          </MenuItem>

          <MenuItem
            onClick={() => {
              setViewType('Last Month')
              handleViewClose()
            }}
          >
            Last Month
          </MenuItem>
          <MenuItem
            onClick={() => {
              setViewType('Last 6 Months')
              handleViewClose()
            }}
          >
            Last 6 Months
          </MenuItem>
        </Menu>
      </Box>

      {/* 🧠 Loader State */}
      {loader ? (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {[1, 2, 3].map(i => (
            <Grid item xs={12} md={4} key={i}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant='circular' width={40} height={40} sx={{ mr: 2 }} />
                    <Skeleton variant='text' width='60%' height={30} />
                  </Box>

                  <Skeleton variant='text' width='80%' height={20} sx={{ mb: 1 }} />
                  <Skeleton variant='rectangular' width='100%' height={80} sx={{ borderRadius: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Assigned vs Unassigned */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => router('/leads/assignment')}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant='h6' fontWeight='bold'>
                    Assigned vs Unassigned
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Shows if auto-assignment is working
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant='h5' color='success.main'>
                    {assignedLeads} Assigned
                  </Typography>
                  <Typography variant='h5' color='error.main'>
                    {unassignedLeads} Unassigned
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Response Time Tracker */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => router.push('/leads/response-time')}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                    <AccessTimeIcon />
                  </Avatar>
                  <Typography variant='h6' fontWeight='bold'>
                    Response Time Tracker ({viewType})
                  </Typography>
                </Box>

                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Avg time taken to respond to new leads
                </Typography>

                <Typography variant='h4' fontWeight='bold' sx={{ mb: 1 }}>
                  {avgHours} hrs
                </Typography>

                <LinearProgress
                  variant='determinate'
                  value={Math.min((avgHours / targetHours) * 100, 100)}
                  sx={{
                    height: 8,
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: avgHours <= targetHours ? 'success.main' : 'error.main'
                    }
                  }}
                />

                <Typography variant='caption' color='text.secondary'>
                  Target: {targetHours} hours
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Follow-ups Due Today */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => router('/leads/follow-ups')}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                    <EventAvailableIcon />
                  </Avatar>
                  <Typography variant='h6' fontWeight='bold'>
                    Follow-ups Due Today
                  </Typography>
                </Box>
                <Typography variant='body2' color='text.secondary' gutterBottom>
                  Number of leads needing action/follow-up today
                </Typography>
                <Typography
                  variant='h2'
                  fontWeight='bold'
                  sx={{ color: followUpsToday > 0 ? 'error.main' : 'success.main' }}
                >
                  {followUpsToday}
                </Typography>
                <Typography variant='body2' sx={{ color: followUpsToday > 0 ? 'error.main' : 'success.main' }}>
                  {followUpsToday > 0 ? 'Action Required' : 'All Caught Up'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </>
  )
}
