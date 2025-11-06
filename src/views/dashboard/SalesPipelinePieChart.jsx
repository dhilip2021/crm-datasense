'use client'

import React, { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Box, Button, Card, CardContent, Menu, MenuItem, Typography } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const SalesPipelinePieChart = ({ data }) => {
  const COLORS = [
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#10B981', // Green
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Violet
    '#9CA3AF' // Gray
  ]

  const [anchorViewEl, setAnchorViewEl] = useState(null)
  const [viewType, setViewType] = useState('This Month')
  const view = Boolean(anchorViewEl)

  const handleViewClick = event => {
    setAnchorViewEl(event.currentTarget)
  }
  const handleViewClose = () => {
    setAnchorViewEl(null)
  }

  return (
    <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
      <CardContent>
        <Box display={'flex'} justifyContent={'space-between'}>
          <Typography variant='h6' fontWeight='bold' mb={2}>
            Sales Pipeline by Stage
          </Typography>
          <Button variant='outlined' size='small' endIcon={<KeyboardArrowDownIcon />} onClick={handleViewClick}>
            {viewType}
          </Button>

          <Menu anchorEl={anchorViewEl} open={view} onClose={handleViewClose}>
            <MenuItem
              onClick={() => {
                setViewType('This Week')
                handleViewClose()
              }}
            >
              This Week
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewType('This Month')
                handleViewClose()
              }}
            >
              This Month
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewType('Last Month')
                handleViewClose()
              }}
            >
              Last Month
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewType('Last 6 Months')
                handleViewClose()
              }}
            >
              Last 6 Months
            </MenuItem>
            <MenuItem
              onClick={() => {
                setViewType('Last 1 Year')
                handleViewClose()
              }}
            >
              Last 1 Year
            </MenuItem>
          </Menu>
        </Box>

        <ResponsiveContainer width='100%' height={350}>
          <PieChart>
            <Pie
              data={data}
              cx='50%'
              cy='50%'
              labelLine={false}
              outerRadius={100}
              fill='#8884d8'
              dataKey='value'
              nameKey='stage'
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={value => [`₹${value.toLocaleString()}`, 'Value']}
              contentStyle={{
                backgroundColor: '#fff',
                borderRadius: '8px',
                border: '1px solid #ccc'
              }}
            />
            <Legend verticalAlign='bottom' height={36} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default SalesPipelinePieChart
