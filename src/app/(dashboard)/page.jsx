'use client'

import React, { useEffect, useState } from 'react'

import Cookies from 'js-cookie'

// MUI Imports
import Grid from '@mui/material/Grid'

// Components Imports
import Award from '@views/dashboard/Award'
import Transactions from '@views/dashboard/Transactions'
import WeeklyOverview from '@views/dashboard/WeeklyOverview'
import TotalEarning from '@views/dashboard/TotalEarning'
import LineChart from '@views/dashboard/LineChart'
import DistributedColumnChart from '@views/dashboard/DistributedColumnChart'
import DepositWithdraw from '@views/dashboard/DepositWithdraw'
import SalesByCountries from '@views/dashboard/SalesByCountries'
import CardStatVertical from '@components/card-statistics/Vertical'
import Table from '@views/dashboard/Table'

import { getUserListApi } from '@/apiFunctions/ApiAction'

import { removeCredentials } from '@/helper/frontendHelper'
import LeadStatus from '@/views/dashboard/LeadStatus'
import LeadWeekly from '@/views/dashboard/LeadWeekly'
import LeadByLocation from '@/views/dashboard/LeadByLocation'
import LeadBySource from '@/views/dashboard/LeadBySource'
import HighValueLeads from '@/views/dashboard/HighValueLeads'
import LeadStatusSummary from '@/views/dashboard/LeadStatusSummary'
import AssignedStatusCard from '@/views/dashboard/AssignedStatusCard'
import DashboardWidgets from '@/views/dashboard/DashboardWidgets'
import ConversionFunnel from '@/views/dashboard/ConversionFunnel'
import SalesRepSummary from '@/views/dashboard/SalesRepSummary'
import KanbanView from '@/views/dashboard/KanbanView'
import SalesFunnelChart from '@/views/dashboard/SalesFunnelChart'
import TopAccountsCard from '@/views/dashboard/TopAccountsCard'
import DealAgingAnalysis from '@/views/dashboard/DealAgingAnalysis'
import SmartAlertsCard from '@/views/dashboard/SmartAlertsCard'
import dayjs from 'dayjs'

const DashboardAnalytics = () => {
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

        // const flattened = flattenFields(json.data.sections)
        // const config = {}
        // flattened.forEach(field => {
        //   if (field.type === 'Dropdown' && field.options?.length > 0) {
        //     config[field.label] = field.options
        //   }
        // })

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
    if (user_id !== undefined) {
      getUserListFn(user_id)
    }
  }, [user_id])



  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate: fromDate, toDate: toDate }))
  }, [viewType])










  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={12} lg={12}>
        <LeadStatus />
      </Grid>
     

      

     

     
      <Grid item xs={12} md={6} lg={6}>
        <LeadByLocation data={data} loader={loader} />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <LeadWeekly data={data} loader={loader}/>
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
        <DashboardWidgets />
      </Grid>

      <Grid item xs={12} md={6} lg={6}>
        <HighValueLeads />
      </Grid>

      <Grid item xs={12} md={12} lg={6}>
        <ConversionFunnel />
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
        <LeadBySource />
      </Grid>

      <Grid item xs={12} md={12} lg={12}>
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
      </Grid>

      <Grid item xs={12} sm={12} lg={12}>
        <SalesRepSummary />
      </Grid>

       {/* <Grid item xs={12}>
        <LeadStatusSummary />
      </Grid> */}
    </Grid>
  )
}

export default DashboardAnalytics
