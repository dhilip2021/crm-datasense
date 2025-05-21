'use client'

import { useEffect } from 'react'

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
import Cookies from 'js-cookie'

import { getUserListApi } from '@/apiFunctions/ApiAction'

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
      console.log(results?.payloadJson[0]?.n_status, '<<< N STATUS')
      if (results?.payloadJson[0]?.n_status === 0) {
        Cookies.remove('riho_token')
        Cookies.remove('_token')
        Cookies.remove('_token_expiry')
        Cookies.remove('privileges')
        Cookies.remove('role_id')
        Cookies.remove('role_name')
        Cookies.remove('user_name')
        Cookies.remove('organization_id')
        Cookies.remove('organization_name')
        Cookies.remove('user_id')
        Cookies.remove('c_version')
        Cookies.remove('endedAt')
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    console.log(user_id, 'ROLE IDDDD')
    if (user_id !== undefined) {
      getUserListFn(user_id)
    }
  }, [user_id])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} md={4}>
        <Award />
      </Grid>
      <Grid item xs={12} md={8} lg={8}>
        <Transactions />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <WeeklyOverview />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <TotalEarning />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <Grid container spacing={6}>
          <Grid item xs={12} sm={6}>
            <LineChart />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CardStatVertical
              title='Total Profit'
              stats='$25.6k'
              avatarIcon='ri-pie-chart-2-line'
              avatarColor='secondary'
              subtitle='Weekly Profit'
              trendNumber='42%'
              trend='positive'
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <DistributedColumnChart />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <SalesByCountries />
      </Grid>
      <Grid item xs={12} lg={8}>
        <DepositWithdraw />
      </Grid>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export default DashboardAnalytics
