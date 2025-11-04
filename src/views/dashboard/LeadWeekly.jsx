'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'

// MUI Imports
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Typography,
  Skeleton,
  Box
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// Components Imports
import OptionsMenu from '@core/components/option-menu'
import Cookies from 'js-cookie'
import dayjs from 'dayjs'

// Styled Component Imports
const AppReactApexCharts = dynamic(() => import('@/libs/styles/AppReactApexCharts'))

export default function LeadWeekly() {


   const user_id = Cookies.get('user_id')
  const getToken = Cookies.get('_token')




 const organization_id = Cookies.get('organization_id')

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loader, setLoader] = useState(false)

  const [fetched, setFetched] = useState(true)
  const [sections, setSections] = useState([])
  const [fieldConfig, setFieldConfig] = useState({})
  const [userList, setUserList] = useState([])
  const [viewType, setViewType] = useState('This Week')


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
        setFieldConfig(config)
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

        console.log(json.data,"<<< JSON dataaa")

        setData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }









  useEffect(() => {
    if (!fetched && sections) {
      fetchData()
      setFetched(true)
    }
  }, [filters])

  useEffect(() => {
    fetchFormTemplate()
    setFetched(false)
  }, [])






  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate: fromDate, toDate: toDate }))
  }, [viewType])


  const theme = useTheme()

  // --- Helper to get day name (Sun, Mon, etc.)
  const getDayName = dateStr => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { weekday: 'short' })
  }

  // --- Current day
  const todayName = new Date().toLocaleString('en-US', { weekday: 'short' })

  // --- Compute weekly lead counts
  const weeklyCounts = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const counts = Object.fromEntries(days.map(d => [d, 0]))

    data.forEach(lead => {
      if (lead?.submittedAt) {
        const day = getDayName(lead.submittedAt)
        if (counts[day] !== undefined) counts[day] += 1
      }
    })
    return days.map(d => counts[d])
  }, [data])

  // --- Dynamic color logic (today highlighted)
  const colors = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
    day === todayName
      ? 'var(--mui-palette-primary-main)' // highlight today
      : 'var(--mui-palette-customColors-trackBg)' // grey others
  )

  // --- Chart options
  const options = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    plotOptions: {
      bar: { borderRadius: 7, distributed: true, columnWidth: '40%' }
    },
    stroke: { width: 2, colors: ['var(--mui-palette-background-paper)'] },
    legend: { show: false },
    grid: {
      xaxis: { lines: { show: false } },
      strokeDashArray: 7,
      padding: { left: -9, top: -20, bottom: 13 },
      borderColor: 'var(--mui-palette-divider)'
    },
    dataLabels: { enabled: false },
    colors,
    xaxis: {
      categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      tickPlacement: 'off',
      labels: { show: true },
      axisTicks: { show: false },
      axisBorder: { show: false }
    },
    yaxis: {
      show: true,
      tickAmount: 4,
      labels: {
        offsetY: 2,
        offsetX: -17,
        style: { colors: 'var(--mui-palette-text-disabled)', fontSize: theme.typography.body2.fontSize },
        formatter: value => `${value}`
      }
    }
  }

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader
        title='Weekly Leads'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Refresh']} />}
      />
      <CardContent>
        {/* --- 1️⃣ Loader State --- */}
        {loader ? (
          <Box>
            <Skeleton variant='rectangular' height={250} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant='text' height={20} width='60%' sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant='rectangular' height={40} width='100%' sx={{ borderRadius: 1 }} />
          </Box>
        ) : data.length === 0 ? (
          // --- 2️⃣ No Records State ---
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: 250
            }}
          >
            <Typography variant='h6' color='text.secondary'>
              No records found
            </Typography>
          </Box>
        ) : (
          // --- 3️⃣ Chart View ---
          <>
            <AppReactApexCharts
              type='bar'
              height={250}
              width='100%'
              series={[{ name: 'Leads', data: weeklyCounts }]}
              options={options}
            />

            <Typography variant='body2' sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
              Total Leads This Week: {data.length}
            </Typography>

            <Button fullWidth variant='contained'>
              Leads Details
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
