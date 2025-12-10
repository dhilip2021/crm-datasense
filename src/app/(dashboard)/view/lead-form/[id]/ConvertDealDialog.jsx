'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Box,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  FormHelperText,
  Grid
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'

const ConvertDealDialog = ({
  open,
  onClose,
  accountName,
  contactName,
  createDeal,
  setCreateDeal,
  handleConvert,
  fieldOpportunityConfig,
  leadData,
  dealData,
  setDealData,
  userList,
  user_id
}) => {



  // const ownerName = leadData?.c_createdByName || 'Unknown'
  const stageOptions = fieldOpportunityConfig?.['Lead Status'] || []
  const [errors, setErrors] = useState({})


  // 🧩 Prefill values from leadData
  useEffect(() => {
    if (leadData) {
      setDealData({
        amount: '',
        dealName: leadData?.values?.Company || accountName || '',
        closingDate: null,
        stage: 'New Opportunity',
        'Assigned To': user_id
      })
      setErrors({})
    }
  }, [leadData, accountName, setDealData])

  // 🖊️ Handle text field changes
  const handleChange = e => {
    const { name, value } = e.target
    setDealData(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' })) // clear error on change
  }

  // 📅 Handle DatePicker change
  const handleDateChange = newValue => {
    setDealData(prev => ({ ...prev, closingDate: dayjs(newValue) }))
    setErrors(prev => ({ ...prev, closingDate: '' }))
  }

  // ⚙️ Validation logic
  const validateForm = () => {
    const newErrors = {}

    if (createDeal) {
      if (!dealData.dealName?.trim()) newErrors.dealName = 'Deal name is required.'
      if (!dealData.closingDate) {
        newErrors.closingDate = 'Closing date is required.'
      } else {
        const today = new Date()
        const closing = new Date(dealData.closingDate)

        // 🧠 Clear the time part for accurate date-only comparison
        today.setHours(0, 0, 0, 0)
        closing.setHours(0, 0, 0, 0)

        if (closing < today) {
          newErrors.closingDate = 'Closing date cannot be in the past.'
        }
      }

      if (!dealData.stage?.trim()) newErrors.stage = 'Please select a stage.'
      if (dealData.amount !== '' && Number(dealData.amount) < 0) newErrors.amount = 'Amount cannot be negative.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 🧠 Handle Convert Button Click
  const handleConvertClick = () => {
    if (createDeal && !validateForm()) {
      return
    }
    handleConvert(dealData, createDeal)
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600}>
          Convert Lead{' '}
          <Typography component='span' variant='subtitle1' color='text.secondary' fontWeight={400}>
            ({contactName} - {accountName})
          </Typography>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 1.5 }}>
        {/* 🏢 Create New Account */}
        <Box display='flex' alignItems='center' mb={2}>
          <Typography sx={{ width: 180 }}>Create New Account</Typography>
          <Chip
            label={accountName}
            sx={{
              backgroundColor: '#f0f2f7',
              fontWeight: 500,
              borderRadius: '6px'
            }}
          />
        </Box>

        {/* 👤 Create New Contact */}
        <Box display='flex' alignItems='center' mb={2}>
          <Typography sx={{ width: 180 }}>Create New Contact</Typography>
          <Chip
            label={contactName}
            sx={{
              backgroundColor: '#f0f2f7',
              fontWeight: 500,
              borderRadius: '6px'
            }}
          />
        </Box>

        {/* 💼 Create Deal Checkbox */}
        <FormControlLabel
          control={<Checkbox checked={createDeal} onChange={e => setCreateDeal(e.target.checked)} />}
          label='Create a new Opportunity for this Account'
          sx={{ mt: 1 }}
        />

        {/* 💰 Deal Fields */}
        {createDeal && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            {/* Amount */}
            <Box mb={2}>
              <Typography fontSize={14} mb={0.5}>
                Amount
              </Typography>
              <TextField
                autoComplete='off'
                name='amount'
                value={
                  dealData.amount
                    ? Number(dealData.amount).toLocaleString('en-IN') // 💡 show formatted (1,00,000)
                    : ''
                }
                onChange={e => {
                  // Remove commas before parsing
                  let value = e.target.value.replace(/,/g, '')

                  // Prevent negatives
                  if (value === '' || Number(value) >= 0) {
                    // Allow only numbers
                    if (!isNaN(value)) {
                      handleChange({
                        target: {
                          name: 'amount',
                          value: value
                        }
                      })
                    }
                  }
                }}
                fullWidth
                size='small'
                type='text' // 👈 important (not 'number'), so commas display correctly
                placeholder='Enter Amount'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>₹</InputAdornment>,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <InfoOutlinedIcon fontSize='small' color='action' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Deal Name (Required) */}
            <Box mb={2}>
              <Typography fontSize={14} mb={0.5}>
                Deal Name <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                autoComplete='off'
                name='dealName'
                value={dealData.dealName}
                onChange={handleChange}
                fullWidth
                size='small'
                required
                error={!!errors.dealName}
                helperText={errors.dealName}
                placeholder='Enter Deal Name'
              />
            </Box>

            {/* Closing Date (Required) */}
            <Box mb={2}>
              <Typography fontSize={14} mb={0.5}>
                Closing Date <span style={{ color: 'red' }}>*</span>
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  value={dealData.closingDate}
                  onChange={handleDateChange}
                  format='DD/MM/YYYY'
                  disablePast
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      required: true,
                      error: !!errors.closingDate,
                      helperText: errors.closingDate,
                      placeholder: 'Select Closing Date'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            {/* Stage (Required) */}
            <Box>
              <Typography fontSize={14} mb={0.5}>
                Stage <span style={{ color: 'red' }}>*</span>
              </Typography>
              <TextField
                autoComplete='off'
                name='stage'
                select
                value={dealData.stage}
                onChange={handleChange}
                fullWidth
                size='small'
                required
                error={!!errors.stage}
                helperText={errors.stage}
              >
                {stageOptions.length > 0 ? (
                  stageOptions.map(stage => (
                    <MenuItem key={stage} value={stage}>
                      {stage}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No stages found</MenuItem>
                )}
              </TextField>
            </Box>
          </Box>
        )}

        {/* 👑 Owner Info */}
        <Box mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Assign to
          </Typography>
      
          <Grid item xs={6}>
            <TextField
              fullWidth
              select
              size='small'
              variant='outlined'
              defaultValue={dealData['Assigned To'] || ''}
              value={dealData['Assigned To'] || ''} // 🛠 Bracket notation
              onChange={e => {
                setDealData({ ...dealData, ['Assigned To']: e.target.value }) // 🛠 Correct update
              }}
              sx={{ minWidth: 150 }}
            >
              {userList.map(u => (
                <MenuItem key={u.user_id} value={u.user_id}>
                  {u.user_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ mt: 1.5, pb: 2 }}>
        <Button
          variant='contained'
          onClick={handleConvertClick}
          sx={{
            background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
            color: '#fff',
            textTransform: 'none',
            px: 3,
            fontWeight: 500,
            '&:hover': {
              background: 'linear-gradient(90deg, #3f5ca9 0%, #101c38 100%)'
            }
          }}
        >
          Convert
        </Button>
        <Button
          variant='outlined'
          onClick={onClose}
          sx={{
            color: '#333',
            borderColor: '#ccc',
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConvertDealDialog
