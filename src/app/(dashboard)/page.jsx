'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Cookies from 'js-cookie'
// MUI Imports
import Grid from '@mui/material/Grid'
// Components Imports
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import CardStatVertical from '@components/card-statistics/Vertical'
import LeadStatus from '@/views/dashboard/LeadStatus'
import LeadWeekly from '@/views/dashboard/LeadWeekly'
import LeadByLocation from '@/views/dashboard/LeadByLocation'
import LeadBySource from '@/views/dashboard/LeadBySource'
import DashboardWidgets from '@/views/dashboard/DashboardWidgets'
import SalesRepSummary from '@/views/dashboard/SalesRepSummary'

import dayjs from 'dayjs'
import {  getHierarchyUserListApi} from '@/apiFunctions/ApiAction'

const DashboardAnalytics = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
   const user_id = Cookies.get('user_id')

  const [openStatus, setOpenStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')

  const handleOpenStatus = status => {
    setSelectedStatus(status)
    setOpenStatus(true)
  }

  const handleCloseStatus = () => {
    setOpenStatus(false)
    setSelectedStatus('')
  }

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
   const [userList, setUserList] = useState([])

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
      const header = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken}`
      }

      const res = await fetch(`/api/v1/admin/lead-form/dashboard-list?${query}`, {
        method: 'GET',
        headers: header
      })
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

    // ✅ Fetch user list
    const getUserListFn = async () => {

      // const header = {
      //   'Content-Type': 'application/json',
      //   Authorization: `Bearer ${getToken}`
      // }
      try {

        const results = await getHierarchyUserListApi()
        if (results?.appStatusCode === 0 && Array.isArray(results.payloadJson)) {
          setUserList(results.payloadJson)
        } else {
          setUserList([])
        }
      } catch (err) {
        console.error('User list error:', err)
        setUserList([])
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
        setFieldConfig(config)
      }
    } catch (err) {
      console.error(err)
    }
  }


  const leadsForStatus = useMemo(() => {
    console.log(dataFilter, '<<< data Filter')

    // 🧠 If "Total" is selected → return everything
    if (selectedStatus === 'Total') return dataFilter || []

    // 🧹 Otherwise, filter by specific Lead Status
    return (dataFilter || []).filter(l => l?.values?.['Lead Status'] === selectedStatus)
  }, [selectedStatus, dataFilter])

  // 🔹 Initialize
  useEffect(() => {

    fetchFormTemplate()
    getUserListFn()
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

    cards.push({
      title: 'Total Leads',
      count: leadStatusCounts.totalLeads,
      color: statusMeta.Total.color,
      icon: statusMeta.Total.icon
    })
    ;['Hot', 'Warm', 'Cold'].forEach(status => {
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
    <Grid container spacing={6}>
      <Grid item xs={12} md={12} lg={12}>
        <LeadStatus
          uniqueSources={uniqueSources}
          uniqueCities={uniqueCities}
          uniqueTimelines={uniqueTimelines}
          filters={filters}
          setFilters={setFilters}
          handleOpenStatus={handleOpenStatus}
          handleCloseStatus={handleCloseStatus}
          leadsForStatus={leadsForStatus}
          viewType={viewType}
          setViewType={setViewType}
          loading={loading}
          cardConfig={cardConfig}
          openStatus={openStatus}
          selectedStatus={selectedStatus}
        />
      </Grid>

      <Grid item xs={12} md={6} lg={6}>
        <LeadByLocation viewType={viewType} dataFilter={dataFilter} loading={loading} />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <LeadWeekly />
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
        <DashboardWidgets />
      </Grid>

      {/* <Grid item xs={12} md={6} lg={6}>
        <HighValueLeads />
      </Grid>

      <Grid item xs={12} md={12} lg={6}>
        <ConversionFunnel />
      </Grid> */}

      <Grid item xs={12} md={12} lg={12}>
        <LeadBySource />
      </Grid>

      {/* <Grid item xs={12} md={12} lg={12}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6} lg={3}>
            <LineChart />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <CardStatVertical
              title='Total Profit'
              stats='₹ 25.6k'
              avatarIcon='ri-pie-chart-2-line'
              avatarColor='secondary'
              subtitle='Weekly Profit'
              trendNumber='42%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <CardStatVertical
              stats='862'
              trend='negative'
              trendNumber='18%'
              title='New Project'
              subtitle='Yearly Project'
              avatarColor='primary'
              avatarIcon='ri-file-word-2-line'
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid> */}

      <Grid item xs={12} sm={12} lg={12}>
        <SalesRepSummary 
        fieldConfig={fieldConfig} 
        dataFilter={dataFilter} 
        loading={loading} 
        userList={userList} 
        viewType={viewType}
        setViewType={setViewType}
        />
      </Grid>

   
    </Grid>
  )
}

export default DashboardAnalytics
