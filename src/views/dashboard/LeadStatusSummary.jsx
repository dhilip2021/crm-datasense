'use client'

import { useState, useMemo } from 'react'
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Paper
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import OptionsMenu from '@core/components/option-menu'

// Dummy records
const dummyLeads = [
  { lead_name: 'CRM LEAD 2025 00001', values: { 'Full Name': 'Ramesh Kumar', 'Lead Source': 'WhatsApp', 'City / Location': 'Bangalore', 'Next Follow-up Date': '2025-08-12', Status: 'Contacted','Timeline to Buy':'6+ months' } },
  { lead_name: 'CRM LEAD 2025 00002', values: { 'Full Name': 'Priya Sharma', 'Lead Source': 'Website', 'City / Location': 'Chennai', 'Next Follow-up Date': '2025-08-15', Status: 'New', 'Timeline to Buy':'Immediately' } },
  { lead_name: 'CRM LEAD 2025 00003', values: { 'Full Name': 'Karthik Raj', 'Lead Source': 'Referral', 'City / Location': 'Bangalore', 'Next Follow-up Date': '2025-08-14', Status: 'Qualified', 'Timeline to Buy':'1–3 months' } },
  { lead_name: 'CRM LEAD 2025 00004', values: { 'Full Name': 'Ananya Singh', 'Lead Source': 'WhatsApp', 'City / Location': 'Hyderabad', 'Next Follow-up Date': '2025-08-13', Status: 'Converted', 'Timeline to Buy':'1–3 months' } },
  { lead_name: 'CRM LEAD 2025 00005', values: { 'Full Name': 'Vijay Kumar', 'Lead Source': 'Website', 'City / Location': 'Bangalore', 'Next Follow-up Date': '2025-08-12', Status: 'Lost', 'Timeline to Buy':'Immediately' } }
]

export default function LeadStatusSummary() {
  const [leadSource, setLeadSource] = useState('')
  const [city, setCity] = useState('')
  const [followUpDate, setFollowUpDate] = useState(null)
  const [timeLine, setTimeLine] = useState('')

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return dummyLeads.filter((lead) => {
      const sourceMatch = leadSource ? lead.values['Lead Source'] === leadSource : true
      const cityMatch = city ? lead.values['City / Location'] === city : true
      const dateMatch = followUpDate
        ? dayjs(lead.values['Next Follow-up Date']).isSame(followUpDate, 'day')
        : true
      return sourceMatch && cityMatch && dateMatch
    })
  }, [leadSource, city, followUpDate])

  // Stage grouping
  const stageColors = {
    New: 'primary',
    Contacted: 'info',
    Qualified: 'success',
    Lost: 'error',
    Converted: 'warning'
  }

  const stages = useMemo(() => {
    const counts = {}
    filteredLeads.forEach((lead) => {
      const status = lead.values.Status || 'Unknown'
      counts[status] = (counts[status] || 0) + 1
    })

    return Object.keys(counts).map((status) => ({
      title: status,
      count: counts[status],
      color: stageColors[status] || 'default',
      icon:
        status === 'New'
          ? 'ri-add-line'
          : status === 'Contacted'
          ? 'ri-phone-line'
          : status === 'Qualified'
          ? 'ri-check-double-line'
          : status === 'Lost'
          ? 'ri-close-line'
          : 'ri-exchange-dollar-line'
    }))
  }, [filteredLeads])

  const totalLeads = stages.reduce((sum, stage) => sum + stage.count, 0)

  // Unique filter values
  const uniqueLeadSources = [...new Set(dummyLeads.map((l) => l.values['Lead Source']))]
  const uniqueCities = [...new Set(dummyLeads.map((l) => l.values['City / Location']))]
  const uniqueTimeLine = [...new Set(dummyLeads.map((l) => l.values['Timeline to Buy']))]

  return (
    <Card sx={{ width: '100%' }}>
      
      

     

      {/* Filters */}
      <Box display="flex" justifyContent={"space-between"} gap={2} p={2} flexWrap="wrap">
       

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>City</InputLabel>
          <Select value={city} onChange={(e) => setCity(e.target.value)} label="City">
            <MenuItem value="">All</MenuItem>
            {uniqueCities.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

         <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Lead Source</InputLabel>
          <Select
            value={leadSource}
            onChange={(e) => setLeadSource(e.target.value)}
            label="Lead Source"
          >
            <MenuItem value="">All</MenuItem>
            {uniqueLeadSources.map((src) => (
              <MenuItem key={src} value={src}>
                {src}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Next Follow-up Date"
            value={followUpDate}
            onChange={(newDate) => setFollowUpDate(newDate)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </LocalizationProvider>

         <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Timeline </InputLabel>
          <Select value={timeLine} onChange={(e) => setTimeLine(e.target.value)} label="Timeline">
            <MenuItem value="">All</MenuItem>
            {uniqueTimeLine.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter </InputLabel>
          <Select  onChange={(e) => setTimeLine(e.target.value)} label="Filter">
            <MenuItem value="">All</MenuItem>
             <MenuItem  value={"Today"}>Today</MenuItem>
             <MenuItem  value={"Last 7 Days"}>Last 7 Days</MenuItem>
             <MenuItem  value={"Last 30 Days"}>Last 30 Days</MenuItem>
             <MenuItem  value={"Last 60 Days"}>Last 60 Days</MenuItem>
          </Select>
        </FormControl>
      </Box>

       {/* Top Stat Cards */}
      <Box px={2} pb={2}>
        <Grid container spacing={2}>
          {stages.map((stage, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 3,
                  boxShadow: 1,
                  padding:8
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${stage.color}.main`,
                    width: 60,
                    height: 60,
                    borderRadius: 2,
                    mr: 2
                  }}
                >
                  <i className={stage.icon}></i>
                </Avatar>
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stage.count}
                  </Typography>
                  <Typography variant="h6" color="text.secondary">
                    {stage.title}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Card>
  )
}
