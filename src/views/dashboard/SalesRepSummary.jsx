'use client'

import { useMemo, useState } from 'react'
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Grid
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import OptionsMenu from '@core/components/option-menu'
import { encryptCryptoRes } from '@/helper/frontendHelper'
import Link from 'next/link'

export default function SalesRepSummary({
  fieldConfig = {},
  loading = false,
  dataFilter = [],
  userList = [],
  viewType,
  setViewType
}) {
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedRep, setSelectedRep] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [filteredLeads, setFilteredLeads] = useState([])

  const leadStatusList = fieldConfig?.['Lead Status'] || []
  const dateRangeOptions = ['Today', 'This Week', 'This Month', 'Last Month', 'Last 6 Months','Last 1 Year']

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

  // 🎨 Status Color
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

  // 🪄 When a Chip (count) is clicked
  const handleChipClick = (rep, status) => {
    const leads = dataFilter.filter(
      lead => lead.values?.['Assigned To'] === rep.id && lead.values?.['Lead Status'] === status
    )
    setFilteredLeads(leads)
    setSelectedRep(rep)
    setSelectedStatus(status)
    setOpenDialog(true)
  }

  const handleClose = () => setOpenDialog(false)

  // 🦴 Skeleton Rows
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

  return (
    <>
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
                menuItemProps: { onClick: () => setViewType(option) }
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
            maxHeight: 480,
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
                  zIndex: 2,
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

            {/* <TableBody>
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
                                borderRadius: '6px',
                                cursor: rep[status] > 0 ? 'pointer' : 'default'
                              }}
                              onClick={() => rep[status] > 0 && handleChipClick(rep, status)}
                            />
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
            </TableBody> */}

            <TableBody>
  {loading
    ? skeletonRows
    : leadStatusList.map((status, i) => (
        <TableRow key={i} hover>
          <TableCell sx={{ fontWeight: 600 }}>{status}</TableCell>
          {repSummary.map((rep, j) => {
            const count = rep[status] || 0
            return (
              <TableCell key={j} align='center'>
                <Tooltip title={`${rep.name}: ${status} Leads`} arrow>
                  <Typography
                    onClick={() => count > 0 && handleChipClick(rep, status)}
                    sx={{
                      cursor: count > 0 ? 'pointer' : 'default',
                      fontWeight: count > 0 ? 600 : 400,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: count > 0 ? 'primary.main' : 'text.secondary'
                      
                    }}
                  >
                    {count}
                  </Typography>
                </Tooltip>
              </TableCell>
            )
          })}
        </TableRow>
      ))}
</TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 🔍 Lead Details Popup */}
      <Dialog open={openDialog} onClose={handleClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {selectedRep?.name} - {selectedStatus} Leads
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Total: {filteredLeads.length}
            </Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {filteredLeads.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No leads found for this selection.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {filteredLeads.map((lead, i) => (
                <Grid
                  item
                  xs={12}
                  md={6}
                  key={i}
                  sx={{
                    border: '1px solid #eee',
                    borderRadius: 2,
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <Link
                    href={`/view/lead-form/${encodeURIComponent(encryptCryptoRes(lead.lead_id))}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Typography variant='subtitle1' fontWeight={600}>
                      {lead.values?.Company || 'N/A'}
                    </Typography>
                    {/* <Typography variant='body2' color='text.secondary'>
                   {lead.lead_id}
                  </Typography> */}
                    <Typography variant='body2' color='text.secondary'>
                      Source: {lead.values?.['Lead Source'] || 'N/A'}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Assigned To: {selectedRep?.name}
                    </Typography>
                  </Link>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
