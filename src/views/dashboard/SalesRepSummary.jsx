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
  Skeleton
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
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        c_role_name: user.c_role_name,
        avatar: user.c_user_img_url || '/images/avatars/placeholder.png',
        ...statusCounts
      }
    })
  }, [userList, dataFilter, fieldConfig, loading])

  // 🦴 Skeleton rows
  const skeletonRows = Array.from({ length: 4 }).map((_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Box display='flex' alignItems='center' gap={2}>
          <Skeleton variant='circular' width={40} height={40} />
          <Box>
            <Skeleton variant='text' width={120} />
            <Skeleton variant='text' width={80} />
          </Box>
        </Box>
      </TableCell>
      {leadStatusList.map((_, j) => (
        <TableCell key={j} align='center'>
          <Skeleton variant='rounded' width={40} height={28} />
        </TableCell>
      ))}
    </TableRow>
  ))

  // 🧠 Available view options
  const dateRangeOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months']

  return (
    <Card sx={{ width: '100%' }}>
      <CardHeader
        title={
          <Box display='flex' alignItems='center' gap={1}>
            Sales Rep-wise Lead Summary ({viewType})
            {/* {viewType && (
              <Chip
                size='small'
                label={viewType}
                color='primary'
                variant='outlined'
                sx={{ ml: 1, fontWeight: 500 }}
              />
            )} */}
          </Box>
        }
        action={
          <OptionsMenu
            iconClassName='text-textPrimary'
            options={dateRangeOptions.map(option => ({
              text: option,
              menuItemProps: {
                onClick: () => setViewType(option) // ✅ working change handler
              }
            }))}
          />
        }
        sx={{ pb: 0 }}
      />

      <TableContainer sx={{ p: 2, overflowX: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Sales Rep</TableCell>
              {leadStatusList.map(status => (
                <TableCell key={status} sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  {status}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading
              ? skeletonRows
              : repSummary.map((rep, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box display='flex' alignItems='center' gap={2}>
                        <Avatar src={rep.avatar} alt={rep.name} sx={{ width: 40, height: 40 }} />
                        <Box>
                          <Typography fontWeight='medium'>{rep.name}</Typography>
                          <Typography variant='body2' color='text.secondary'>
                            {rep.c_role_name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {leadStatusList.map(status => (
                      <TableCell key={status} align='center'>
                        <Chip
                          label={rep[status] || 0}
                          variant='outlined'
                          color={
                            rep[status] > 0
                              ? status === 'New'
                                ? 'primary'
                                : status === 'Contacted'
                                ? 'info'
                                : status === 'Qualified'
                                ? 'success'
                                : status === 'Unqualified'
                                ? 'error'
                                : 'default'
                              : 'default'
                          }
                        />
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
