'use client'

import React, { useState } from 'react'
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Drawer,
  Button,
  useTheme,
  useMediaQuery
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'

export default function LeadsOverviewFilters({
  filters,
  setFilters,
  viewType,
  setViewType,
  uniqueSources,
  uniqueCities,
  uniqueTimelines
}) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [openDrawer, setOpenDrawer] = useState(false)

  
  const toggleDrawer = (open) => () => {
    setOpenDrawer(open)
  }

  const filterFields = (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, p: isMobile ? 2 : 0 }}>
      {/* Source */}
      <TextField
        select
        size='small'
        label='Source'
        value={filters.source}
        onChange={e => 
        {
          setFilters(prev => ({ ...prev, source: e.target.value }))
          setOpenDrawer(false)
        }
          }
        sx={{ minWidth: 150 }}
      >
        <MenuItem value=''>All</MenuItem>
        {uniqueSources.map(s => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>

      {/* City */}
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>City</InputLabel>
        <Select
          value={filters.city}
          onChange={e => 
          {
            setFilters(prev => ({ ...prev, city: e.target.value }))
             setOpenDrawer(false)
          }
            }
          label='City'
        >
          <MenuItem value=''>All</MenuItem>
          {uniqueCities.map(c => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Timeline */}
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Timeline</InputLabel>
        <Select
          value={filters.timeline}
          onChange={e => 
          {
            setFilters(prev => ({ ...prev, timeline: e.target.value }))
            setOpenDrawer(false)
          }
            }
          label='Timeline'
        >
          <MenuItem value=''>All</MenuItem>
          {uniqueTimelines.map(t => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Date Range */}
      <FormControl size='small' sx={{ minWidth: 150 }}>
        <InputLabel>Date Range</InputLabel>
        <Select
          value={viewType}
          onChange={e => 
          {
             setViewType(e.target.value)
             setOpenDrawer(false)
          }
           }
          label='Date Range'
        >
          {['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months', 'Last 1 Year'].map(l => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  )

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header Row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          mb: 2
        }}
      >
        {/* Title */}
        <Typography
          variant='h6'
          sx={{ fontWeight: 700, color: '#111', mr: 3, mb: { xs: 2, sm: 0 } }}
        >
          Leads Overview
        </Typography>

        {/* Filters */}
        {isMobile ? (
          <>
            <IconButton onClick={toggleDrawer(true)}>
              <FilterListIcon />
            </IconButton>

            <Drawer anchor='right' open={openDrawer} onClose={toggleDrawer(false)}>
              {filterFields}
              <Box sx={{ p: 2 }}>
                <Button variant='contained' fullWidth onClick={toggleDrawer(false)}>
                  Apply Filters
                </Button>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {filterFields}
          </Box>
        )}
      </Box>
    </Box>
  )
}
