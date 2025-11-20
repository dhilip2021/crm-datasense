'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Box, Button, Menu, MenuItem, Skeleton } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Cookies from 'js-cookie'
import Link from '@components/Link'

const LeadBySource = () => {
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')

  const [leadSource, setLeadSource] = useState([])

  const [leadSourceData, setLeadSourceData] = useState([])
  const [opportunitySourceData, setOpportunitySourceData] = useState([])

  const [loading, setLoading] = useState(false)
  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [viewType, setViewType] = useState('This Month')
  const view = Boolean(anchorViewEl)

  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null
  })

  const handleViewClick = e => setAnchorViewEl(e.currentTarget)
  const handleViewClose = () => setAnchorViewEl(null)

  // 🔹 Flatten field helper
  const flattenFields = sections => {
    const flat = []
    sections.forEach(section => {
      const fieldsObj = section.fields || {}
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

  // 🔹 Date Range Helper
  const getDateRange = viewType => {
    const today = dayjs()
    if (viewType === 'Today') return { fromDate: today.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    if (viewType === 'This Week')
      return { fromDate: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    if (viewType === 'This Month')
      return { fromDate: today.startOf('month').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    if (viewType === 'Last Month')
      return {
        fromDate: today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        toDate: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      }
    if (viewType === 'Last 6 Months')
      return {
        fromDate: today.subtract(6, 'month').startOf('month').format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }

    if (viewType === 'Last 1 Year') {
      const fromDate = today.subtract(1, 'year').startOf('month') // 1 year ago
      return {
        fromDate: fromDate.format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }
    }
    return { fromDate: today.subtract(7, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
  }



  // 🔹 Fetch Lead Data
  const fetchData = async () => {
    setLoading(true)
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
        const leads = json.data || []
        console.log(leads, 'leads')

        // Step 1: Count leads by source
        const sourceCounts = leads.reduce((acc, lead) => {
          const src = lead?.values?.['Lead Source']?.trim() || 'Unknown'
          acc[src] = (acc[src] || 0) + 1
          return acc
        }, {})

        // Step 2: Define known sources with custom logos
        const logoMap = {
          facebook: '/images/social/facebook.png',
          linkedin: '/images/social/linkedin.png',
          whatsapp: '/images/social/whatsapp.png',
          referral: '/images/social/employee_referel.png',
          apollo: '/images/social/apollo.png',
          cold: '/images/social/cold_call.png'
        }

        // Step 3: Prepare final list
        const knownSources = Object.keys(sourceCounts).filter(
          src =>
            src.toLowerCase() === 'facebook' ||
            src.toLowerCase() === 'linkedin' ||
            src.toLowerCase() === 'whatsapp' ||
            src.toLowerCase() === 'referral' ||
            src.toLowerCase() === 'apollo'
        )

        const updatedLeadsData = []

        // Add known sources first
        knownSources.forEach(source => {
          updatedLeadsData.push({
            title: source,
            subtitle: `${source} Leads`,
            leads: sourceCounts[source],
            logo: logoMap[source.toLowerCase()] || '/images/social/advertisement.png'
          })
        })

        // Step 4: Count "Others" = all remaining or unknown sources
        const otherLeadsCount = Object.keys(sourceCounts)
          .filter(src => !knownSources.includes(src))
          .reduce((sum, src) => sum + sourceCounts[src], 0)

        if (otherLeadsCount > 0) {
          updatedLeadsData.push({
            title: 'Others',
            subtitle: 'Others Leads',
            leads: otherLeadsCount,
            logo: '/images/social/advertisement.png'
          })
        }

        console.log(updatedLeadsData, 'updatedLeadsData')
        setLeadSourceData(updatedLeadsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Fetch Opportunity Data
  const fetchOpportunityData = async () => {
    setLoading(true)
    const form_name = 'opportunity-form'

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
        const leads = json.data || []

        // Step 1: Count leads by source
        const sourceCounts = leads.reduce((acc, lead) => {
          const src = lead?.values?.['Lead Source']?.trim() || 'Unknown'
          acc[src] = (acc[src] || 0) + 1
          return acc
        }, {})

        // Step 2: Define known sources with custom logos
        const logoMap = {
          facebook: '/images/social/facebook.png',
          linkedin: '/images/social/linkedin.png',
          whatsapp: '/images/social/whatsapp.png',
          referral: '/images/social/employee_referel.png',
          apollo: '/images/social/apollo.png',
          cold: '/images/social/cold_call.png'
        }

        // Step 3: Prepare final list
        const knownSources = Object.keys(sourceCounts).filter(
          src =>
            src.toLowerCase() === 'facebook' ||
            src.toLowerCase() === 'linkedin' ||
            src.toLowerCase() === 'whatsapp' ||
            src.toLowerCase() === 'referral' ||
            src.toLowerCase() === 'apollo'
        )

        const updatedOpportunityData = []

        // Add known sources first
        knownSources.forEach(source => {
          updatedOpportunityData.push({
            title: source,
            subtitle: `${source} Leads`,
            leads: sourceCounts[source],
            logo: logoMap[source.toLowerCase()] || '/images/social/advertisement.png'
          })
        })

        // Step 4: Count "Others" = all remaining or unknown sources
        const otherLeadsCount = Object.keys(sourceCounts)
          .filter(src => !knownSources.includes(src))
          .reduce((sum, src) => sum + sourceCounts[src], 0)

        if (otherLeadsCount > 0) {
          updatedOpportunityData.push({
            title: 'Others',
            subtitle: 'Others Leads',
            leads: otherLeadsCount,
            logo: '/images/social/advertisement.png'
          })
        }

        console.log(updatedOpportunityData, 'updatedOpportunityData')
        setOpportunitySourceData(updatedOpportunityData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (leadSource.length > 0) {
      fetchData()
      fetchOpportunityData()
    }
  }, [leadSource, filters])

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters({ fromDate, toDate })
  }, [viewType])

  // 🔹 Skeleton Loader
  const renderSkeletons = count =>
    Array.from({ length: count }).map((_, i) => (
      <Box key={i} display='flex' alignItems='center' gap={4}>
        <Skeleton variant='circular' width={30} height={30} />
        <Box flex={1}>
          <Skeleton width='40%' height={20} />
          <Skeleton width='60%' height={16} />
        </Box>
        <Skeleton variant='text' width={40} height={20} />
      </Box>
    ))

  return (
    <Card>
      <Box display='flex' justifyContent='flex-end' p={2}>
        <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleViewClick}>
          {viewType}
        </Button>
        <Menu anchorEl={anchorViewEl} open={view} onClose={handleViewClose}>
          {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months', 'Last 1 Year'].map(opt => (
            <MenuItem
              key={opt}
              onClick={() => {
                setViewType(opt)
                handleViewClose()
              }}
            >
              {opt}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Grid container>
        {/* 🔹 LEADS SECTION */}
        <Grid item xs={12} md={6} className='border-be md:border-be-0 md:border-ie'>
          <CardHeader title='Leads By Source' />
          <CardContent className='flex flex-col gap-5'>
            {loading ? (
              renderSkeletons(5)
            ) : leadSourceData.length > 0 ? (
              leadSourceData.map((item, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <img src={item.logo} alt={item.title} width={30} />
                  <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <Typography>{item.subtitle}</Typography>
                    </div>
                    <Typography color='success.main' className='font-medium'>
                      {item.leads}
                    </Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography color='text.secondary'>No lead data available.</Typography>
            )}
          </CardContent>
        </Grid>

        {/* 🔹 OPPORTUNITY SECTION */}
        <Grid item xs={12} md={6}>
          <CardHeader title='Opportunities By Source' />
          <CardContent className='flex flex-col gap-5'>
            {loading ? (
              renderSkeletons(5)
            ) : opportunitySourceData.length > 0 ? (
              opportunitySourceData.map((item, index) => (
                <div key={index} className='flex items-center gap-4'>
                  <img src={item.logo} alt={item.title} width={30} />
                  <div className='flex justify-between items-center is-full flex-wrap gap-x-4 gap-y-2'>
                    <div className='flex flex-col gap-0.5'>
                      <Typography color='text.primary' className='font-medium'>
                        {item.title}
                      </Typography>
                      <Typography>{item.subtitle}</Typography>
                    </div>
                    <Typography color='error.main' className='font-medium'>
                      {item.leads}
                    </Typography>
                  </div>
                </div>
              ))
            ) : (
              <Typography color='text.secondary'>No opportunity data available.</Typography>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default LeadBySource
