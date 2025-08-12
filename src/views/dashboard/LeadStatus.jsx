'use client'

import { useState, useMemo } from 'react'
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
  CardHeader
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import OptionsMenu from '@core/components/option-menu'
import CustomAvatar from '@core/components/mui/Avatar'

// ===== Dummy DB data =====
const leadsData = [
  {
    lead_name: 'CRM LEAD 2025 00001',
    values: {
      'Full Name': 'Ramesh Kumar',
      'Lead Source': 'WhatsApp',
      'City / Location': 'Bangalore',
      'Next Follow-up Date': '2025-08-12',
      'Timeline to Buy': 'Immediately',
      Status: 'Contacted',
      Label: 'Hot Lead'
    }
  },
  {
    lead_name: 'CRM LEAD 2025 00002',
    values: {
      'Full Name': 'Priya Sharma',
      'Lead Source': 'Website',
      'City / Location': 'Chennai',
      'Next Follow-up Date': '2025-08-15',
      'Timeline to Buy': '6+ Months',
      Status: 'New',
      Label: 'Cold Lead'
    }
  },
  {
    lead_name: 'CRM LEAD 2025 00003',
    values: {
      'Full Name': 'Karthik Raj',
      'Lead Source': 'Referral',
      'City / Location': 'Bangalore',
      'Next Follow-up Date': '2025-08-14',
      'Timeline to Buy': '3–6 Months',
      Status: 'Qualified',
      Label: 'Warm Lead'
    }
  },
  {
    lead_name: 'CRM LEAD 2025 00004',
    values: {
      'Full Name': 'Ananya Singh',
      'Lead Source': 'WhatsApp',
      'City / Location': 'Hyderabad',
      'Next Follow-up Date': '2025-08-13',
      'Timeline to Buy': 'Immediately',
      Status: 'Converted',
      Label: 'Hot Lead'
    }
  },
  {
    lead_name: 'CRM LEAD 2025 00005',
    values: {
      'Full Name': 'Vijay Kumar',
      'Lead Source': 'Website',
      'City / Location': 'Bangalore',
      'Next Follow-up Date': '2025-08-12',
      'Timeline to Buy': '6+ Months',
      Status: 'Lost',
      Label: 'Cold Lead'
    }
  }
]

// ===== Styled Card =====
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2),
  boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0px 8px 20px rgba(0,0,0,0.08)'
  }
}))

const quickRanges = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 60 Days', days: 60 }
]

export default function LeadStatus() {
  const [leadSource, setLeadSource] = useState('')
  const [city, setCity] = useState('')
  const [followUpDate, setFollowUpDate] = useState(null)
  const [timeline, setTimeline] = useState('')
  const [quickRange, setQuickRange] = useState('')

  // ===== Filtering =====

  const filteredLeads = useMemo(() => {
    return leadsData.filter(lead => {
      const sourceMatch = leadSource ? lead.values['Lead Source'] === leadSource : true
      const cityMatch = city ? lead.values['City / Location'] === city : true
      const timelineMatch = timeline ? lead.values['Timeline to Buy'] === timeline : true

      // Quick range filter
      let quickRangeMatch = true
      if (quickRange) {
        const leadDate = dayjs(lead.values['Next Follow-up Date'])
        if (quickRange.days === 0) {
          quickRangeMatch = leadDate.isSame(dayjs(), 'day')
        } else {
          quickRangeMatch = leadDate.isAfter(dayjs().subtract(quickRange.days, 'day'))
        }
      }

      const dateMatch = followUpDate ? dayjs(lead.values['Next Follow-up Date']).isSame(followUpDate, 'day') : true

      return sourceMatch && cityMatch && dateMatch && timelineMatch && quickRangeMatch
    })
  }, [leadSource, city, followUpDate, timeline, quickRange])

  // ===== Dynamic Card Data =====
  const counts = {
    total: filteredLeads.length,
    hot: filteredLeads.filter(l => l.values.Label === 'Hot Lead').length,
    warm: filteredLeads.filter(l => l.values.Label === 'Warm Lead').length,
    cold: filteredLeads.filter(l => l.values.Label === 'Cold Lead').length,
    new: filteredLeads.filter(l => l.values.Status === 'New').length,
    contacted: filteredLeads.filter(l => l.values.Status === 'Contacted').length,
    qualified: filteredLeads.filter(l => l.values.Status === 'Qualified').length,
    converted: filteredLeads.filter(l => l.values.Status === 'Converted').length,
    lost: filteredLeads.filter(l => l.values.Status === 'Lost').length
  }

  const cardConfig = [
    { title: 'Total Leads', count: counts.total, color: 'primary', icon: 'ri-calendar-todo-line' },
    { title: 'Hot Leads', count: counts.hot, color: 'error', icon: 'ri-fire-line' },
    { title: 'Warm Leads', count: counts.warm, color: 'warning', icon: 'ri-sun-line' },
    { title: 'Cold Leads', count: counts.cold, color: 'info', icon: 'ri-snowflake-line' },
    { title: 'New', count: counts.new, color: 'primary', icon: 'ri-add-line' },
    { title: 'Contacted', count: counts.contacted, color: 'info', icon: 'ri-phone-line' },
    { title: 'Qualified', count: counts.qualified, color: 'success', icon: 'ri-check-double-line' },
    { title: 'Converted', count: counts.converted, color: 'warning', icon: 'ri-exchange-dollar-line' },
    { title: 'Lost', count: counts.lost, color: 'error', icon: 'ri-close-line' }
  ]

  // ===== Unique Filter Values =====
  const uniqueSources = [...new Set(leadsData.map(l => l.values['Lead Source']))]
  const uniqueCities = [...new Set(leadsData.map(l => l.values['City / Location']))]
  const uniqueTimelines = [...new Set(leadsData.map(l => l.values['Timeline to Buy']))]

  return (
    <>
      <CardHeader
        title='Leads Overview'
        action={<OptionsMenu iconClassName='text-textPrimary' options={['Refresh']} />}
      />

      {/* Filters */}
      <Box display='flex' gap={2} p={2} flexWrap='wrap'>
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>Lead Source</InputLabel>
          <Select value={leadSource} onChange={e => setLeadSource(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueSources.map(src => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>City / Location</InputLabel>
          <Select value={city} onChange={e => setCity(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueCities.map(c => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Timeline to Buy</InputLabel>
          <Select value={timeline} onChange={e => setTimeline(e.target.value)}>
            <MenuItem value=''>All</MenuItem>
            {uniqueTimelines.map(t => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label='Next Follow-up Date'
            value={followUpDate}
            onChange={newDate => setFollowUpDate(newDate)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>

        <FormControl size='small' sx={{ minWidth: 180 }}>
          <InputLabel>Date Range</InputLabel>
          <Select
            value={quickRange?.label || ''}
            onChange={e => {
              const selected = quickRanges.find(r => r.label === e.target.value)
              setQuickRange(selected || null)
            }}
          >
            <MenuItem value=''>All</MenuItem>
            {quickRanges.map(range => (
              <MenuItem key={range.label} value={range.label}>
                {range.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Cards */}
      <Grid container spacing={3} p={2}>
        {cardConfig.map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard>
              <CardContent className='flex items-center gap-4'>
                <CustomAvatar
                  variant='rounded'
                  color={item.color}
                  className='shadow-md'
                  sx={{ width: 60, height: 60, fontSize: 30 }}
                >
                  <i className={item.icon}></i>
                </CustomAvatar>
                <div>
                  <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant='h3' sx={{ fontWeight: 600 }}>
                    {item.count}
                  </Typography>
                </div>
              </CardContent>
            </StatCard>
          </Grid>
        ))}
      </Grid>
    </>
  )
}
