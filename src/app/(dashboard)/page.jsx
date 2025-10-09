'use client'

import { useEffect } from 'react'

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

const DashboardAnalytics = () => {
  const user_id = Cookies.get('user_id')
  const getToken = Cookies.get('_token')

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
    if (user_id !== undefined) {
      getUserListFn(user_id)
    }
  }, [user_id])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={12} lg={12}>
        <LeadStatus />
      </Grid>
        <Grid item xs={12}>
        <KanbanView />
        </Grid>

        <Grid item xs={6}>
        <SalesFunnelChart />
        </Grid>
        
         <Grid item xs={6}>
          <TopAccountsCard />
         </Grid>


      {/* <Grid item xs={12}>
        <LeadStatusSummary />
      </Grid> */}
      <Grid item xs={12} md={6} lg={6}>
        <LeadByLocation />
      </Grid>
      <Grid item xs={12} md={6} lg={6}>
        <LeadWeekly />
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
    </Grid>
  )
}

export default DashboardAnalytics
