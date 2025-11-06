'use client'

import { useMemo } from 'react'
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
  Avatar,
  Box,
  Chip,
  Skeleton,
  Divider,
  Tooltip
} from '@mui/material'
import OptionsMenu from '@core/components/option-menu'

export default function SalesRepSummary({
  fieldConfig = {},
  loading = false,
  dataFilter = [],
  userList = [],
  viewType,
  setViewType
}) {
  const leadStatusList = fieldConfig?.['Lead Status'] || []

  // 🧮 Compute summary dynamically for each Sales Rep
  const repSummary = useMemo(() => {
    if (loading) return []
    return userList.map(user => {
      const userId = user.user_id
      const userLeads = dataFilter.filter(lead => lead.values?.['Assigned To'] === userId)

      const statusCounts = {}
      leadStatusList.forEach(status => (statusCounts[status] = 0))

      userLeads.forEach(lead => {
        const status = lead.values?.['Lead Status']
        if (statusCounts.hasOwnProperty(status)) statusCounts[status]++
      })

      return {
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        c_role_name: user.c_role_name,
        avatar: user.c_user_img_url || '/images/avatars/placeholder.png',
        ...statusCounts
      }
    })
  }, [userList, dataFilter, fieldConfig, loading])

  const skeletonRows = Array.from({ length: 4 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton variant='text' width={100} />
      </TableCell>
      {userList.map((_, j) => (
        <TableCell key={j} align='center'>
          <Skeleton variant='rounded' width={40} height={28} />
        </TableCell>
      ))}
    </TableRow>
  ))

  const dateRangeOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months']

  const getStatusColor = status => {
    switch (status) {
      case 'New':
        return 'primary'
      case 'Contacted':
        return 'info'
      case 'Qualified':
        return 'success'
      case 'Unqualified':
        return 'error'
      case 'In Progress':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Card
      sx={{
        width: '100%',
        borderRadius: 3,
        boxShadow: '0 4px 18px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        bgcolor: 'background.paper'
      }}
    >
      {/* Header Section */}
      <CardHeader
        title={
          <Box display='flex' alignItems='center' gap={1}>
            <Typography variant='h6' fontWeight={600} color='text.primary'>
              Lead Status vs Sales Rep Summary
            </Typography>
            <Chip
              label={viewType}
              size='small'
              color='secondary'
              variant='outlined'
              sx={{
                fontWeight: 500,
                borderRadius: '6px',
                ml: 1,
                textTransform: 'capitalize'
              }}
            />
          </Box>
        }
        action={
          <OptionsMenu
            iconClassName='text-textPrimary'
            options={dateRangeOptions.map(option => ({
              text: option,
              menuItemProps: {
                onClick: () => setViewType(option)
              }
            }))}
          />
        }
        sx={{
          pb: 0,
          '& .MuiCardHeader-action': { alignSelf: 'center' }
        }}
      />

      <Divider />

      {/* Table Section */}
      <TableContainer
        sx={{
          p: 0,
          overflowX: 'auto',
          maxHeight: 480, // 👈 vertical scroll limit
          '&::-webkit-scrollbar': { height: 6, width: 6 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#bbb', borderRadius: 10 }
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: 'grey.100',
                position: 'sticky',
                top: 0,
                zIndex: 2, // 👈 keeps header above content
                boxShadow: '0px 2px 4px rgba(0,0,0,0.08)',
                '& th': {
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  backgroundColor: 'grey.100'
                }
              }}
            >
              <TableCell sx={{ minWidth: 150 }}>Status</TableCell>
              {repSummary.map((rep, index) => (
                <TableCell key={index} align='center' sx={{ minWidth: 130 }}>
                  <Box display='flex' alignItems='center' flexDirection='column'>
                    <Typography variant='body2' fontWeight={600}>
                      {rep.name.split(' ')[0]}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      ({rep.c_role_name})
                    </Typography>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading
              ? skeletonRows
              : leadStatusList.map((status, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{status}</TableCell>
                    {repSummary.map((rep, j) => (
                      <TableCell key={j} align='center'>
                        <Tooltip title={`${rep.name}: ${status} Leads`} arrow>
                          <Chip
                            label={rep[status] || 0}
                            size='small'
                            variant={rep[status] > 0 ? 'filled' : 'outlined'}
                            color={getStatusColor(status)}
                            sx={{
                              minWidth: 40,
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              borderRadius: '6px'
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
