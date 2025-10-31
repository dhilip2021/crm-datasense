'use client'
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import SalesFunnelChart from '@/views/dashboard/SalesFunnelChart'
import KanbanView from '@/views/dashboard/KanbanView'
import TopAccountsCard from '@/views/dashboard/TopAccountsCard'
import DealAgingAnalysis from '@/views/dashboard/DealAgingAnalysis'
import SmartAlertsCard from '@/views/dashboard/SmartAlertsCard'
import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import StageBarChart from '@/views/dashboard/StageBarChart'
import SalesPipelinePieChart from '@/views/dashboard/SalesPipelinePieChart'
import SalesPipelineBarChart from '@/views/dashboard/SalesPipelineBarChart'
import dayjs from 'dayjs'
import { Box, Button, Menu, MenuItem } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const Opportunity = () => {
  const organization_id = Cookies.get('organization_id')
  const getToken = Cookies.get('_token')
  const form_name = 'opportunities-form'

  const [data, setData] = useState([])
  const [page, setPage] = useState(0)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loader, setLoader] = useState(false)
  const [funnelData, setFunnelData] = useState([])
  const [topAccounts, setTopAccounts] = useState([])
  const [dealsAging, setDealsAging] = useState([])

  const [fieldStatus, setFieldStatus] = useState({})
  const [filters, setFilters] = useState({
    status: '',
    touch: '',
    source: '',
    region: '',
    assign: '',
    rep: '',
    value: '',
    fromDate: null,
    toDate: null,
    search: ''
  })

  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [viewType, setViewType] = useState('This Month')
  const view = Boolean(anchorViewEl)

  const handleViewClick = event => {
    setAnchorViewEl(event.currentTarget)
  }
  const handleViewClose = () => {
    setAnchorViewEl(null)
  }

  const handleChange = type => {
    setViewType(type)
    handleViewClose()
  }

  // 🔹 Fetch template
  const fetchFormTemplate = async () => {
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${form_name}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken}`
          }
        }
      )
      const json = await res.json()

      if (json?.success && json.data?.sections?.length > 0) {
        // 🔍 Extract Lead Status options dynamically
        let leadStatusOptions = []

        json.data.sections.forEach(section => {
          const allFields = [
            ...(section.fields.left || []),
            ...(section.fields.center || []),
            ...(section.fields.right || [])
          ]

          const leadStatusField = allFields.find(field => field.label === 'Lead Status')

          if (leadStatusField && Array.isArray(leadStatusField.options)) {
            leadStatusOptions = leadStatusField.options
          }
        })

        setFieldStatus(leadStatusOptions)
      } else {
        setFieldStatus([])
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  const fetchData = async () => {
    setLoader(true)

    const form_name = 'opportunity-form'

    const query = new URLSearchParams({
      organization_id,
      form_name,
      page: page + 1,
      limit,
      ...(filters.search && { search: filters.search }),
      ...(filters.status && { status: filters.status }),
      ...(filters.touch && { touch: filters.touch }),
      ...(filters.source && { source: filters.source }),
      ...(filters.region && { region: filters.region }),
      ...(filters.assign && { assign: filters.assign }),
      ...(filters.rep && { rep: filters.rep }),
      ...(filters.value && { value: filters.value }),
      ...(filters.fromDate && { from: dayjs(filters.fromDate).format('YYYY-MM-DD') }),
      ...(filters.toDate && { to: dayjs(filters.toDate).format('YYYY-MM-DD') })
    })

    const header = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken}`
    }

    try {
      const res = await fetch(`/api/v1/admin/opportunity-form/list?${query}`, {
        method: 'GET',
        headers: header
      })
      const json = await res.json()

      if (json.success) {
        setData(json.data)
        setTotal(json.total)
      } else {
        setData([])
        setTotal(0)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
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

  useEffect(() => {
    fetchFormTemplate()
  }, [page, limit])

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate: fromDate, toDate: toDate }))
  }, [viewType, fieldStatus])

  useEffect(() => {
    fetchData()
  }, [filters])

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {

     
    const accountMap = {}

    data.forEach(item => {
      const companyName = item.values?.['Company'] || 'Unknown Company'

      // 🔹 Sum all finalPrice values across all items for this lead
      const totalItemValue = (item.items || []).reduce((leadSum, itemBlock) => {
        const itemTotal = (itemBlock.item_ref || []).reduce(
          (sum, ref) => sum + Number(ref.finalPrice || 0),
          0
        )
        return leadSum + itemTotal
      }, 0)

      // 🔹 Create or update company entry
      if (!accountMap[companyName]) {
        accountMap[companyName] = {
          name: companyName,
          value: 0,
          count: 0,
          link: item.lead_id, // default link
          latestDate: new Date(item.updatedAt) // track latest update
        }
      }

      accountMap[companyName].value += totalItemValue
      accountMap[companyName].count += 1

      // 🔹 If this item is newer, update link
      const itemUpdatedAt = new Date(item.updatedAt)
      if (itemUpdatedAt > accountMap[companyName].latestDate) {
        accountMap[companyName].link = item.lead_id
        accountMap[companyName].latestDate = itemUpdatedAt
      }
    })

    // 🔹 Convert to array and sort by total value
    let topAccountsArr = Object.values(accountMap).sort((a, b) => b.value - a.value)

    // 🔹 Format and limit to top 10
    topAccountsArr = topAccountsArr.slice(0, 10).map((acc, index) => ({
      id: index + 1,
      name: acc.name,
      value: `₹ ${acc.value.toLocaleString('en-IN')}`,
      link: acc.link // ✅ include lead_id as link
    }))
 
    setTopAccounts(topAccountsArr)


       console.log(data,"<<< dataaaaaaaaaaaa")

      const today = new Date() // or new Date() in real use

      const deals = data.map(item => {
        const company = item?.values?.['Company'] || 'Unknown'
        const link = item?.lead_id || ''
        const amount = item?.values?.['Expected Revenue'] || 0
        const status = item?.values?.['Lead Status'] || 'unknown'
        const closingDate = new Date(item?.values?.['Closing Date'])
        const diffTime = Math.abs(today - closingDate)
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          company,
          amount: `₹${Number(amount).toLocaleString('en-IN')}`,
          days,
          link,
          status
        }
      })

      
     

      const sortedDeals = deals.sort((a, b) => Number(a.days) - Number(b.days))

      setDealsAging(sortedDeals)
    } else {
      setTopAccounts([])
      setDealsAging([])
    }







    if (Array.isArray(data) && data.length > 0) {
      const funnelMap = {}

      data.forEach(item => {
        const status = item.values?.['Lead Status'] || 'Unknown'

        // 🔹 Calculate total finalPrice from item.items.item_ref
        const totalItemValue = (item.items?.[0]?.item_ref || []).reduce(
          (sum, ref) => sum + Number(ref.finalPrice || 0),
          0
        )


        if (!funnelMap[status]) {
          funnelMap[status] = { stage: status, value: 0, count: 0 }
        }

        funnelMap[status].value += totalItemValue 
        funnelMap[status].count += 1
      })
      // 🔹 Maintain Lead Status order based on fieldStatus
      let finalFunnelData = Object.values(funnelMap)
      if (Array.isArray(fieldStatus) && fieldStatus.length > 0) {
        finalFunnelData = fieldStatus.map(stage => {
          const found = funnelMap[stage]
          return found || { stage, value: 0, count: 0 }
        })
      }

      setFunnelData(finalFunnelData)
    } else {
      const emtyRes = [
        {
          stage: 'New Opportunity',
          value: 0,
          count: 0
        },
        {
          stage: 'Proposal Sent',
          value: 0,
          count: 0
        },
        {
          stage: 'Negotiation',
          value: 0,
          count: 0
        },
        {
          stage: 'Decision Pending',
          value: 0,
          count: 0
        },
        {
          stage: 'Ready to Close',
          value: 0,
          count: 0
        },
        {
          stage: 'Closed Won',
          value: 0,
          count: 0
        },
        {
          stage: 'Closed Lost',
          value: 0,
          count: 0
        }
      ]

      setFunnelData(emtyRes)
    }
  }, [data, fieldStatus])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12} display={'flex'} justifyContent={'space-between'}>
        <Box>
          <Typography variant='h5'>Opportunity Dashboard</Typography>
        </Box>
        <Box>
          <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleViewClick}>
            {viewType}
          </Button>

          <Menu anchorEl={anchorViewEl} open={view} onClose={handleViewClose}>
            <MenuItem onClick={() => handleChange('Today')}>Today</MenuItem>
            <MenuItem onClick={() => handleChange('This Week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleChange('This Month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleChange('Last Month')}>Last Month</MenuItem>
            <MenuItem onClick={() => handleChange('Last 6 Months')}>Last 6 Months</MenuItem>
          </Menu>
        </Box>
      </Grid>

      <Grid item xs={6}>
        {/* <SalesFunnelChart funnelData={funnelData} /> */}
        {/* <StageBarChart funnelData={funnelData} /> */}
        {/* <SalesPipelinePieChart data={funnelData} /> */}

        <SalesPipelineBarChart data={funnelData} loader={loader} />
      </Grid>

      <Grid item xs={6}>
        <TopAccountsCard data={topAccounts} loader={loader} />
      </Grid>

      <Grid item xs={6}>
        <DealAgingAnalysis deals={dealsAging} loader={loader} />
      </Grid>

      <Grid item xs={6}>
        <SmartAlertsCard deals={dealsAging} loader={loader} />
      </Grid>
    </Grid>
  )
}

export default Opportunity
