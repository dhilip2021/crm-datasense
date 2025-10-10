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
  MenuItem
} from '@mui/material'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

const ConvertDealDialog = ({
  open,
  onClose,
  accountName,
  contactName,
  createDeal,
  setCreateDeal,
  handleConvert,
  fieldConfig,
  leadData,
  dealData,
  setDealData
}) => {
  // 🧠 Extract owner name from leadData
  const ownerName = leadData?.c_createdByName || 'Unknown'

  // 🎯 Extract Lead Status dropdown options from config
  const stageOptions = fieldConfig?.['Lead Status'] || []



  // When leadData changes, update the defaults
  useEffect(() => {
    if (leadData) {
      setDealData({
        amount: '',
        dealName: leadData?.values?.Company || accountName || '',
        closingDate: '',
        stage: leadData?.values?.['Lead Status'] || 'Qualification'
      })
    }
  }, [leadData, accountName])

  // Handle field changes
  const handleChange = e => {
    const { name, value } = e.target
    setDealData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6'>
          Convert Lead{' '}
          <Typography component='span' variant='subtitle1' color='text.secondary'>
            ({contactName} - {accountName})
          </Typography>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        {/* 🏢 Create New Account */}
        <Box display='flex' alignItems='center' mb={2}>
          <Typography sx={{ width: 180 }}>Create New Account</Typography>
          <Chip
            label={accountName}
            sx={{ backgroundColor: '#e3e6ed', fontWeight: 500, borderRadius: '6px' }}
          />
        </Box>

        {/* 👤 Create New Contact */}
        <Box display='flex' alignItems='center' mb={2}>
          <Typography sx={{ width: 180 }}>Create New Contact</Typography>
          <Chip
            label={contactName}
            sx={{ backgroundColor: '#e3e6ed', fontWeight: 500, borderRadius: '6px' }}
          />
        </Box>

        {/* 💼 Create Deal Option */}
        <FormControlLabel
          control={
            <Checkbox
              checked={createDeal}
              onChange={e => setCreateDeal(e.target.checked)}
            />
          }
          label='Create a new Deal for this Account.'
          sx={{ mt: 1 }}
        />

        {/* 💰 Deal Fields (show only when checked) */}
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
                name='amount'
                value={dealData.amount}
                onChange={handleChange}
                fullWidth
                size='small'
                placeholder='Enter Amount'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>INR</InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position='end'>
                      <InfoOutlinedIcon fontSize='small' color='action' />
                    </InputAdornment>
                  )
                }}
              />
            </Box>

            {/* Deal Name */}
            <Box mb={2}>
              <Typography fontSize={14} mb={0.5}>
                Deal Name
              </Typography>
              <TextField
                name='dealName'
                value={dealData.dealName}
                onChange={handleChange}
                fullWidth
                size='small'
                placeholder='Enter Deal Name'
              />
            </Box>

            {/* Closing Date */}
            <Box mb={2}>
              <Typography fontSize={14} mb={0.5}>
                Closing Date
              </Typography>
              <TextField
                name='closingDate'
                type='date'
                value={dealData.closingDate}
                onChange={handleChange}
                fullWidth
                size='small'
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Stage (Lead Status) */}
            <Box>
              <Typography fontSize={14} mb={0.5}>
                Stage
              </Typography>
              <TextField
                name='stage'
                select
                value={dealData.stage}
                onChange={handleChange}
                fullWidth
                size='small'
              >
                {stageOptions.map(stage => (
                  <MenuItem key={stage} value={stage}>
                    {stage}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        )}

        {/* 👑 Owner */}
        <Box mt={3}>
          <Typography variant='body2' color='text.secondary'>
            Owner of the New Records
          </Typography>
          <Typography variant='body1' fontWeight={500}>
            {ownerName}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ mt: 2 }}>
        <Button
          variant='contained'
          onClick={() => handleConvert(dealData, createDeal)}
          sx={{
            background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
            color: '#fff',
            textTransform: 'none',
            px: 3,
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
            textTransform: 'none'
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConvertDealDialog
