'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { Box, Button, Menu, MenuItem, Avatar, Skeleton } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Link from '@components/Link'
import Cookies from 'js-cookie'

const LeadBySource = () => {
  const router = useRouter()

  const user_id = Cookies.get('user_id')
  const getToken = Cookies.get('_token')
  const organization_id = Cookies.get('organization_id')

  const [leadSourceData, setLeadSourceData] = useState([])
  const [opportunitySourceData, setOpportunitySourceData] = useState([])
  const [data, setData] = useState([])
  const [loader, setLoader] = useState(false)
  const [fetched, setFetched] = useState(true)
  const [sections, setSections] = useState([])
  const [leadSource, setLeadSource] = useState([])
  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [viewType, setViewType] = useState('This Month')
  const view = Boolean(anchorViewEl)

  const handleViewClick = event => setAnchorViewEl(event.currentTarget)
  const handleViewClose = () => setAnchorViewEl(null)

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
    toDate: null
  })

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

  const getDateRange = viewType => {
    const today = dayjs()
    if (viewType === 'Today') {
      return { fromDate: today.format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    }
    if (viewType === 'This Week') {
      return {
        fromDate: today.startOf('week').add(1, 'day').format('YYYY-MM-DD'),
        toDate: today.format('YYYY-MM-DD')
      }
    }
    if (viewType === 'This Month') {
      return { fromDate: today.startOf('month').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    }
    if (viewType === 'Last Month') {
      return {
        fromDate: today.subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
        toDate: today.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      }
    }
    if (viewType === 'Last 6 Months') {
      return { fromDate: today.subtract(6, 'month').startOf('month').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
    }
    return { fromDate: today.subtract(7, 'day').format('YYYY-MM-DD'), toDate: today.format('YYYY-MM-DD') }
  }

  // 🔹 Fetch Template
  const fetchFormTemplate = async () => {
    const lead_form = 'lead-form'
    setLoader(true)
    try {
      const res = await fetch(
        `/api/v1/admin/lead-form-template/single?organization_id=${organization_id}&form_name=${lead_form}`,
        {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` }
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
        const leadSourceArray = config['Lead Source'] || []
        setLeadSource(leadSourceArray)
      }
    } catch (err) {
      console.error('fetchFormTemplate error:', err)
    } finally {
      setLoader(false)
    }
  }

  // 🔹 Fetch Lead Data
  const fetchData = async () => {
    setLoader(true)
    const form_name = 'lead-form'

    const query = new URLSearchParams({
      organization_id,
      form_name
    })

    try {
      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` }
      })
      const json = await res.json()

      if (json.success) {
        const leads = json.data || []
        setData(leads)
        const sourceCounts = leads.reduce((acc, lead) => {
          const src = lead?.values?.['Lead Source'] || 'Unknown'
          acc[src] = (acc[src] || 0) + 1
          return acc
        }, {})

        const updatedLeadsData = (leadSource.length > 0 ? leadSource : Object.keys(sourceCounts)).map(source => ({
          title: source,
          subtitle: `${source} Leads`,
          leads: sourceCounts[source] || 0,
          logo: source.toLowerCase().includes('whatsapp')
            ? '/images/social/whatsapp.png'
            : source.toLowerCase().includes('linkedin')
              ? '/images/social/linkedin.png'
              : source.toLowerCase().includes('referral')
                ? '/images/social/employee_referel.png'
                : source.toLowerCase().includes('cold')
                  ? '/images/social/cold_call.png'
                  : '/images/social/advertisement.png'
        }))
        setLeadSourceData(updatedLeadsData)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoader(false)
    }
  }

  // 🔹 Fetch Opportunity Data
  const fetchOpportunityData = async () => {
    setLoader(true)
    const form_name = 'opportunity-form'
    const query = new URLSearchParams({ organization_id, form_name })

    try {
      const res = await fetch(`/api/v1/admin/lead-form/list?${query}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken}` }
      })
      const json = await res.json()

      if (json.success) {
        const leads = json.data || []
        const sourceCounts = leads.reduce((acc, lead) => {
          const src = lead?.values?.['Lead Source'] || 'Unknown'
          acc[src] = (acc[src] || 0) + 1
          return acc
        }, {})

        const updatedLeadsData = (leadSource.length > 0 ? leadSource : Object.keys(sourceCounts)).map(source => ({
          title: source,
          subtitle: `${source} Opportunity`,
          leads: sourceCounts[source] || 0,
          logo: source.toLowerCase().includes('whatsapp')
            ? '/images/social/whatsapp.png'
            : source.toLowerCase().includes('linkedin')
              ? '/images/social/linkedin.png'
              : source.toLowerCase().includes('referral')
                ? '/images/social/employee_referel.png'
                : source.toLowerCase().includes('cold')
                  ? '/images/social/cold_call.png'
                  : '/images/social/advertisement.png'
        }))
        setOpportunitySourceData(updatedLeadsData)
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
      fetchOpportunityData()
      setFetched(true)
    }
  }, [filters])

  useEffect(() => {
    fetchFormTemplate()
    setFetched(false)
  }, [])

  useEffect(() => {
    const { fromDate, toDate } = getDateRange(viewType)
    setFilters(prev => ({ ...prev, fromDate, toDate }))
    setFetched(false)
  }, [viewType])

  // 🔹 Skeleton Loader JSX
  const renderSkeletons = count => (
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
  )

  return (
    <Card>
      <Box display='flex' justifyContent='flex-end' p={2}>
        <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleViewClick}>
          {viewType}
        </Button>

        <Menu anchorEl={anchorViewEl} open={view} onClose={handleViewClose}>
          {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months'].map(opt => (
            <MenuItem key={opt} onClick={() => { setViewType(opt); handleViewClose() }}>
              {opt}
            </MenuItem>
          ))}
        </Menu>
      </Box>

      <Grid container>
        {/* 🔹 LEADS SECTION */}
        <Grid item xs={12} md={6} className='border-be md:border-be-0 md:border-ie'>
          <CardHeader
            title='Leads'
            // action={<Typography component={Link} className='font-medium' color='primary'>View All</Typography>}
          />
          <CardContent className='flex flex-col gap-5'>
            {loader
              ? renderSkeletons(5)
              : leadSourceData.map((item, index) => (
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
                ))}
          </CardContent>
        </Grid>

        {/* 🔹 OPPORTUNITY SECTION */}
        <Grid item xs={12} md={6}>
          <CardHeader
            title='Opportunity'
            // action={<Typography component={Link} className='font-medium' color='primary'>View All</Typography>}
          />
          <CardContent className='flex flex-col gap-5'>
            {loader
              ? renderSkeletons(5)
              : opportunitySourceData.map((item, index) => (
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
                ))}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  )
}

export default LeadBySource
