'use client'

import React from 'react'
import { Box, FormControl, Select, MenuItem } from '@mui/material'

const getLeadStatusColor = status => {
  switch (status) {
    case 'New':
      return '#9C27B0' // Purple
    case 'Contacted':
      return '#03A9F4' // Light Blue
    case 'Qualified':
      return '#4CAF50' // Green
    case 'Proposal Sent':
      return '#757575' // Grey
    case 'Negotiation':
      return '#6D6D6D' // Dark Grey
    case 'Closed Lost':
      return '#FF9800' // Orange
    case 'Closed Won':
      return '#4CAF50' // Green
    case 'Attempted to Contact':
      return '#03A9F4' // Green
    case 'Lost Lead - No Requirements':
      return '#FF9800' // Green
    case 'No Response/Busy':
      return '#4CAF50' // Green
    case 'Lost Lead - Already Using':
      return '#4CAF50' // Green
    case 'Interested':
      return '#4CAF50' // Green
    case 'Demo Scheduled':
      return '#FF9800' // Green
    case 'Need to Schedule Demo':
      return '#4CAF50' // Green
    case 'Demo Completed':
      return '#4CAF50' // Green
    case 'Call Back':
      return '#4CAF50' // Green

    default:
      return '#BDBDBD' // Default Grey
  }
}

const StatusFiled = ({ label, value, options = [], onSave }) => {

  console.log(options,"<<< OPTIONDSDSSSSSS")

  const handleChange = e => {
    if (onSave) onSave(e.target.value)
  }

  const borderColor = '#d1d1d1'
  const bgColor = getLeadStatusColor(value)

  return (
    <Box display='flex' flexDirection='column' gap={0.5} sx={{ mb: 2 }}>
      <FormControl fullWidth size='small'>
        <Select
          value={value || ''}
          onChange={handleChange}
          displayEmpty
          sx={{
            borderRadius: 2,
            backgroundColor: bgColor,
            color: '#fff', // 👈 dropdown text white
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor,
              borderWidth: 2
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: borderColor
            },
            '& .MuiSelect-icon': {
              color: '#fff' // 👈 arrow icon white
            }
          }}
        >
          <MenuItem value='' disabled>
            Select {label}
          </MenuItem>
          {options.slice(0, 24).map(opt => (
            <MenuItem
              key={opt}
              value={opt}
              sx={{ backgroundColor: getLeadStatusColor(opt), color: '#fff' }} // 👈 menu text white
            >
              {opt}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )
}

export default StatusFiled
