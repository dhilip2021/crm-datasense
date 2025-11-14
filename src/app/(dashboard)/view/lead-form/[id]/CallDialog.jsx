'use client'
import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  LinearProgress,
  Typography,
  TextField,
  Stack
} from '@mui/material'

import CloseIcon from '@mui/icons-material/Close'

function CallDialog({
  openCallDialog,
  handleCallClose,
  progress,
  seconds,
  isCalling,
  handleStopCall,
  handleStartCall,
  toPhoneNumber,
  setToPhoneNumber,
  callResponse,
  setCallResponse
}) {
  const formatTime = sec => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')
    const s = (sec % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <Dialog
      open={openCallDialog}
      onClose={handleCallClose}
      maxWidth='xs'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
        }
      }}
    >
      {/* ------------ HEADER ------------- */}
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: 18,
          p: 2,
          px: 3,
          borderBottom: '1px solid #eee',
          bgcolor: '#fafafa'
        }}
      >
        <Box display='flex' alignItems='center' justifyContent='space-between'>
          <Typography fontWeight={700}>Call</Typography>

          <Tooltip title='Close' arrow>
            <IconButton size='small' onClick={handleCallClose}>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* ------------ PROGRESS BAR ------------- */}
      <LinearProgress
        variant='determinate'
        value={progress}
        sx={{
          height: 6,
          borderRadius: 2,
          bgcolor: 'grey.300',
          '& .MuiLinearProgress-bar': {
            bgcolor: isCalling ? '#43a047' : '#1976d2'
          }
        }}
      />

      {/* ------------ BODY CONTENT ------------- */}
      <DialogContent sx={{ p: 3 }}>
        <Typography
          variant='h5'
          sx={{
            mb: 3,
            fontWeight: 700,
            textAlign: 'center',
            color: isCalling ? '#2e7d32' : '#1976d2'
          }}
        >
          {isCalling ? `⏱ ${formatTime(seconds)}` : 'Ready to call'}
        </Typography>

        {/* ------------ INPUT FIELD ------------- */}
        <TextField
          size='small'
          fullWidth
          label='Phone Number'
          value={toPhoneNumber}
          onChange={e => setToPhoneNumber(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* ------------ START / STOP CONTROLS ------------- */}
        {!isCalling ? (
          <Box textAlign='center'>
            <Button
            disabled={toPhoneNumber === ""}
              variant='contained'
              color='success'
              onClick={handleStartCall}
              sx={{
                borderRadius: 20,
                px: 5,
                py: 1.4,
                fontWeight: 700,
                fontSize: 16,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(76,175,80,0.3)'
              }}
            >
              📞 Start Call
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <TextField
              required
              size='small'
              fullWidth
              label='Call Response'
              value={callResponse}
              onChange={e => setCallResponse(e.target.value)}
            />

            <Button
              variant='contained'
              color='error'
              onClick={handleStopCall}
              fullWidth
              sx={{
                borderRadius: 20,
                py: 1.4,
                fontWeight: 700,
                fontSize: 16,
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(244,67,54,0.3)'
              }}
            >
              🛑 Stop Call
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default CallDialog
