'use client'

import React, { useState } from 'react'
import {
  Box,
  Grid,
  TextField,
  Typography,
  Paper,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

export default function NewLeadForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    companyName: '',
    jobTitle: '',
    leadSource: '',
    leadStatus: '',
    companySize: '',
    revenue: '',
    website: '',
    country: '',
    state: '',
    city: '',
    street: '',
    pinCode: '',
    otherInfo: '',
    followUpDate: null,
    timeline: '',
    assignedTo: 'Dhilip'
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    console.log('🚀 Submitted Data:', formData)
    alert('Lead submitted successfully!')
  }

  return (

     <LocalizationProvider dateAdapter={AdapterDayjs}>
       <Box sx={{ p: 3, bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        New Lead
      </Typography>

      <form onSubmit={handleSubmit}>
        {/* Contact Information */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Contact Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Email"
                required
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Mobile Number"
                required
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                InputProps={{
                  startAdornment: <Box sx={{ mr: 1 }}>🇮🇳 +91</Box>
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={e => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Company Information */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Company Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Company Name"
                value={formData.companyName}
                onChange={e => handleChange('companyName', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Job Title"
                value={formData.jobTitle}
                onChange={e => handleChange('jobTitle', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Lead Source</InputLabel>
                <Select
                  value={formData.leadSource}
                  onChange={e => handleChange('leadSource', e.target.value)}
                >
                  <MenuItem value="Website">Website</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Ad Campaign">Ad Campaign</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Lead Status</InputLabel>
                <Select
                  value={formData.leadStatus}
                  onChange={e => handleChange('leadStatus', e.target.value)}
                >
                  <MenuItem value="New">New</MenuItem>
                  <MenuItem value="Working">Working</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={formData.companySize}
                  onChange={e => handleChange('companySize', e.target.value)}
                >
                  <MenuItem value="1-10">1 to 10</MenuItem>
                  <MenuItem value="11-50">11 to 50</MenuItem>
                  <MenuItem value="51-200">51 to 200</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Annual Revenue"
                InputProps={{
                  startAdornment: <Box sx={{ mr: 1 }}>₹</Box>
                }}
                value={formData.revenue}
                onChange={e => handleChange('revenue', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={e => handleChange('website', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Address Information */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Address Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                >
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="US">US</MenuItem>
                  <MenuItem value="UK">UK</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>State</InputLabel>
                <Select
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                >
                  <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
                  <MenuItem value="Kerala">Kerala</MenuItem>
                  <MenuItem value="Karnataka">Karnataka</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>City</InputLabel>
                <Select
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                >
                  <MenuItem value="Chennai">Chennai</MenuItem>
                  <MenuItem value="Madurai">Madurai</MenuItem>
                  <MenuItem value="Coimbatore">Coimbatore</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Street"
                value={formData.street}
                onChange={e => handleChange('street', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="PIN Code"
                value={formData.pinCode}
                onChange={e => handleChange('pinCode', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Other Information"
                value={formData.otherInfo}
                onChange={e => handleChange('otherInfo', e.target.value)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Follow-Up */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0}>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Follow-Up
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Next Follow-up Date"
                value={formData.followUpDate}
                onChange={date => handleChange('followUpDate', date)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Timeline to Buy</InputLabel>
                <Select
                  value={formData.timeline}
                  onChange={e => handleChange('timeline', e.target.value)}
                >
                  <MenuItem value="1 month">1 Month</MenuItem>
                  <MenuItem value="3 months">3 Months</MenuItem>
                  <MenuItem value="6 months">6 Months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth label="Assigned To" value={formData.assignedTo} disabled />
            </Grid>
          </Grid>
        </Paper>

        {/* Buttons */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined">Cancel</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#9c27b0' }}>
            Submit
          </Button>
        </Box>
      </form>
    </Box>
     </LocalizationProvider>
   
  )
}
