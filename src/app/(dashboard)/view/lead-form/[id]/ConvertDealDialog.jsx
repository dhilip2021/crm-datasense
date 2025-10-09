'use client'

import React from 'react'
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
  Chip
} from '@mui/material'

const ConvertDealDialog = ({ open, onClose, accountName, contactName, createDeal, setCreateDeal, ownerName, handleConvert }) => {



  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>
        <Typography variant='h6'>
          Convert Lead{' '}
          <Typography
            component='span'
            variant='subtitle1'
            color='text.secondary'
          >
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
            sx={{
              backgroundColor: '#e3e6ed',
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
              backgroundColor: '#e3e6ed',
              fontWeight: 500,
              borderRadius: '6px'
            }}
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
          onClick={handleConvert}
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
