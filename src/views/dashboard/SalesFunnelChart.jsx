'use client'

import React, { useState } from 'react'
import { FunnelChart, Funnel, LabelList, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, Box, Typography, Button, Menu, MenuItem } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

// 🌈 Custom Tamil Nadu–inspired vibrant colors
const COLORS = ['#0288d1', '#80deea', '#ef9a9a', '#ffb300', '#43a047', '#ba68c8']

// 💬 Custom tooltip box
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { stage, value, count } = payload[0].payload
    return (
      <Box
        sx={{
          bgcolor: '#fff',
          p: 1.5,
          borderRadius: 2,
          boxShadow: 3,
          border: '1px solid #eee'
        }}
      >
        <Typography variant='subtitle2' fontWeight='bold'>
          {stage}
        </Typography>
        <Typography variant='body2' color='green'>
          Value: ₹{value.toLocaleString('en-IN')}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Deals: {count}
        </Typography>
      </Box>
    )
  }
  return null
}

export default function SalesFunnelChart({ funnelData }) {

  console.log(funnelData,"<< FUNNEL DATA")
  
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
    <Card
      sx={{
        p: 3,
        borderRadius: '16px',
        boxShadow: 4,
        bgcolor: '#fff'
      }}
    >
      <Box display={'flex'} justifyContent={'space-between'}>
        <Typography variant='h6' fontWeight='bold' mb={2}>
          Sales Funnel Overview
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
        </Menu>
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer width='100%' height='100%'>
          <FunnelChart>
            <Tooltip content={<CustomTooltip />} />
            <Funnel data={funnelData} dataKey='value' isAnimationActive={true} animationDuration={800}>
              {funnelData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke='#fff'
                  strokeWidth={2}
                  radius={[5, 5, 0, 0]} // 🎨 Rounded top edges
                />
              ))}
              <LabelList
                dataKey='stage'
                position='right'
                formatter={(stage, item) => `${stage} : ${item?.payload?.count ?? 0}`}
                fill='#333'
              />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  )
}
