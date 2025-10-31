'use client'

import React, { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Stack,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import { encryptCryptoRes } from '@/helper/frontendHelper'

export default function SmartAlertsCard({ deals = [], loader }) {
  console.log(deals, '<<< deals')

  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedDeals, setSelectedDeals] = useState([])

  // 🧮 Compute categorized deals
  const { over60, between30and60, under30 } = useMemo(() => {
    const groups = {
      over60: [],
      between30and60: [],
      under30: []
    }

    deals.forEach(deal => {
      const days = Number(deal.days) || 0
      if (days > 60) groups.over60.push(deal)
      else if (days >= 30 && days <= 60) groups.between30and60.push(deal)
      else groups.under30.push(deal)
    })

    return groups
  }, [deals])

  const isEmpty = !loader && deals.length === 0

  // 🧩 Handle popup
  const handleOpenPopup = (title, dealList) => {
    setSelectedCategory(title)
    setSelectedDeals(dealList)
    setOpenDialog(true)
  }

  const handleClosePopup = () => {
    setOpenDialog(false)
  }

  return (
    <>
      <Card
        variant='outlined'
        sx={{
          borderRadius: 3,
          p: 0,
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
          height: 430,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ height: '100%', overflowY: 'auto' }}>
          <Typography
            variant='h6'
            sx={{
              fontWeight: 700,
              color: '#111827',
              mb: 2
            }}
          >
            Smart Alerts
          </Typography>

          {/* 🌀 Loader (Skeletons) */}
          {loader ? (
            <Stack spacing={1.5}>
              {[1, 2, 3].map(i => (
                <Box key={i}>
                  <Skeleton variant='rectangular' height={60} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
              <Divider sx={{ my: 3 }} />
              <Skeleton variant='text' width='50%' height={25} />
              {[1, 2].map(i => (
                <Skeleton key={i} variant='text' width='80%' height={20} />
              ))}
            </Stack>
          ) : isEmpty ? (
            // 📉 No Records Found
            <Box
              sx={{
                textAlign: 'center',
                mt: 15,
                color: 'text.secondary'
              }}
            >
              <Typography variant='body1' fontWeight={600}>
                📉 No records found
              </Typography>
              <Typography variant='caption'>Try changing filters or date range</Typography>
            </Box>
          ) : (
            <>
              {/* ✅ Alert Boxes */}
              <Stack spacing={1.5}>
                <AlertBox
                  color='#b91c1c'
                  bg='#fee2e2'
                  border='#fca5a5'
                  icon={<HourglassBottomIcon sx={{ fontSize: 18, mr: 0.5 }} />}
                  title='Deals > 60 days'
                  subtitle='Require immediate attention'
                  value={over60.length}
                  onClick={() => handleOpenPopup('Deals > 60 days', over60)}
                />

                <AlertBox
                  color='#b45309'
                  bg='#fef9c3'
                  border='#fcd34d'
                  icon={<AccessTimeIcon sx={{ fontSize: 18, mr: 0.5 }} />}
                  title='Deals 30–60 days'
                  subtitle='Monitor closely'
                  value={between30and60.length}
                  onClick={() => handleOpenPopup('Deals 30–60 days', between30and60)}
                />

                <AlertBox
                  color='#15803d'
                  bg='#dcfce7'
                  border='#86efac'
                  icon={<CheckCircleIcon sx={{ fontSize: 18, mr: 0.5 }} />}
                  title='Deals < 30 days'
                  subtitle='On track'
                  value={under30.length}
                  onClick={() => handleOpenPopup('Deals < 30 days', under30)}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* 📊 Top Win/Loss Reasons */}
              <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
                Top Win Reasons
              </Typography>

              <Stack spacing={1}>
                <ReasonItem label='Feature fit' value='28%' color='green' />
                <ReasonItem label='Timeline match' value='16%' color='green' />
              </Stack>

              <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#111827', mt: 2, mb: 1 }}>
                Top Loss Reasons
              </Typography>

              <Stack spacing={1}>
                <ReasonItem label='Budget constraints' value='32%' color='red' />
                <ReasonItem label='Competitor pricing' value='24%' color='red' />
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      {/* 💬 Popup Dialog */}
      <Dialog open={openDialog} onClose={handleClosePopup} fullWidth maxWidth='sm'>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontWeight: 700
          }}
        >
          {selectedCategory}
          <IconButton onClick={handleClosePopup}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedDeals.length === 0 ? (
            <Typography textAlign='center' color='text.secondary'>
              No deals found in this category.
            </Typography>
          ) : (
            <List>
              {selectedDeals.map((deal, index) => (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: '1px solid #eee',
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f9fafb' }
                  }}
                  onClick={() =>
                    window.open(`/view/opportunity-form/${encodeURIComponent(encryptCryptoRes(deal.link))}`, '_blank')
                  }
                >
                  <ListItemText
                    primary={
                      <Box display={'flex'} justifyContent={'space-between'}>
                        <Typography fontWeight={600}>{deal.company}</Typography>
                        <Chip
                          label={deal.status || 'Unknown'}
                          size='small'
                          sx={{
                            backgroundColor:
                              deal.status === 'New Opportunity'
                                ? '#1976d2' // primary blue
                                : deal.status === 'Proposal Sent'
                                  ? '#0288d1' // info blueish
                                  : deal.status === 'Negotiation'
                                    ? '#2e7d32' // green
                                    : deal.status === 'Decision Pending'
                                      ? '#6a1b9a' // purple
                                      : deal.status === 'Ready to Close'
                                        ? '#9e9e9e' // grey
                                        : deal.status === 'Closed Lost'
                                          ? '#ed6c02' // orange
                                          : deal.status === 'Closed Won'
                                            ? '#2e7d32' // green
                                            : '#bdbdbd',
                            color: '#fff'
                          }}
                        />
                      </Box>
                    }
                    secondary={`Value: ${deal.amount} | ${deal.days} days`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/* ✅ Reusable Alert Box */
const AlertBox = ({ color, bg, border, icon, title, subtitle, value, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      borderRadius: 2,
      border: `1px solid ${border}`,
      backgroundColor: bg,
      p: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: '0.2s',
      '&:hover': { backgroundColor: `${bg}cc` }
    }}
  >
    <Box>
      <Typography variant='subtitle1' sx={{ fontWeight: 600, color }}>
        {icon}
        {title}
      </Typography>
      <Typography variant='body2' sx={{ color }}>
        {subtitle}
      </Typography>
    </Box>
    <Typography variant='h5' sx={{ color, fontWeight: 700 }}>
      {value}
    </Typography>
  </Box>
)

/* ✅ Reusable Win/Loss Reason */
const ReasonItem = ({ label, value, color }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      color: '#374151'
    }}
  >
    <Typography variant='body2'>{label}</Typography>
    <Typography variant='body2' sx={{ fontWeight: 600, color: color === 'red' ? '#dc2626' : '#16a34a' }}>
      {value}
    </Typography>
  </Box>
)
